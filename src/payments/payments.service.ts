/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus } from './schemas/payment.schema';
import { InitializePaymentDto } from './dto/create-payment.dto';
import axios, { AxiosError } from 'axios';
import {
  PaystackInitializeResponse,
  PaystackVerifyResponse,
  PaystackErrorResponse,
} from './interfaces/paystack.interface';

@Injectable()
export class PaymentsService {
  private readonly paystackSecretKey: string;
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private configService: ConfigService,
  ) {
    this.paystackSecretKey = this.configService.get<string>(
      'PAYSTACK_SECRET_KEY',
      '',
    );

    if (!this.paystackSecretKey) {
      console.warn(
        '⚠️  PAYSTACK_SECRET_KEY not found in environment variables',
      );
    }
  }

  async initializePayment(
    initializePaymentDto: InitializePaymentDto,
    userId?: string,
  ) {
    try {
      // Check if Paystack is configured
      if (!this.paystackSecretKey) {
        throw new HttpException(
          'Paystack is not configured. Please set PAYSTACK_SECRET_KEY in your .env file.\n' +
          'For testing, you can use a test key from: https://paystack.com/docs/api/keys/#test-keys',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Generate unique reference
      const reference = `ref_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Convert amount to kobo (Paystack uses kobo for NGN)
      const amountInKobo = Math.round(initializePaymentDto.amount * 100);

      // Initialize payment with Paystack
      const response = await axios.post<PaystackInitializeResponse>(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email: initializePaymentDto.email,
          amount: amountInKobo,
          reference: reference,
          currency: 'NGN',
          metadata: {
            ...initializePaymentDto.metadata,
            orderId: initializePaymentDto.orderId,
            ...(userId && { userId: userId }),
          },
          callback_url: `${this.configService.get<string>('APP_URL') || 'https://bebrand-eoo2.onrender.com'}/api/docs`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data.status) {
        throw new HttpException(
          'Failed to initialize payment',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Save payment record
      const paymentData: any = {
        orderId: initializePaymentDto.orderId,
        amount: initializePaymentDto.amount,
        email: initializePaymentDto.email,
        reference: reference,
        status: PaymentStatus.PENDING,
        paystackReference: response.data.data.reference,
        accessCode: response.data.data.access_code,
        authorizationUrl: response.data.data.authorization_url,
        metadata: initializePaymentDto.metadata,
        currency: 'NGN',
      };
      
      // Only add userId if provided (for authenticated users)
      if (userId) {
        paymentData.userId = userId;
      }
      
      const payment = await this.paymentModel.create(paymentData);

      return {
        message: 'Payment initialized successfully',
        payment: {
          id: payment._id,
          reference: payment.reference,
          amount: payment.amount,
          authorizationUrl: payment.authorizationUrl,
          accessCode: payment.accessCode,
        },
      };
    } catch (error) {
      console.error('Payment initialization error:', error);
      const axiosError = error as AxiosError<PaystackErrorResponse>;
      
      // Check if Paystack secret key is missing
      if (!this.paystackSecretKey) {
        throw new HttpException(
          'Paystack is not configured. Please set PAYSTACK_SECRET_KEY in environment variables.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      if (axiosError.response?.data) {
        console.error('Paystack API error:', axiosError.response.data);
        throw new HttpException(
          axiosError.response.data.message || 'Payment initialization failed',
          HttpStatus.BAD_REQUEST,
        );
      }
      
      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check for specific error types
        if (error.message.includes('E11000')) {
          throw new HttpException(
            'Payment reference already exists. Please try again.',
            HttpStatus.BAD_REQUEST,
          );
        }
        
        if (error.message.includes('validation')) {
          throw new HttpException(
            `Validation error: ${error.message}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        
        // Return the actual error message for debugging
        throw new HttpException(
          `Payment initialization failed: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      throw new HttpException(
        'An error occurred while initializing payment. Check server logs for details.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyPayment(reference: string) {
    try {
      // Verify with Paystack
      const response = await axios.get<PaystackVerifyResponse>(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );

      if (!response.data.status) {
        throw new HttpException(
          'Payment verification failed',
          HttpStatus.BAD_REQUEST,
        );
      }

      const paystackData = response.data.data;

      // Update payment in database
      const payment = await this.paymentModel.findOneAndUpdate(
        { reference: reference },
        {
          status:
            paystackData.status === 'success'
              ? PaymentStatus.SUCCESS
              : PaymentStatus.FAILED,
          paidAt: paystackData.paid_at,
          channel: paystackData.channel,
          ipAddress: paystackData.ip_address,
        },
        { new: true },
      );

      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }

      return {
        message: 'Payment verified successfully',
        payment: {
          id: payment._id,
          reference: payment.reference,
          amount: payment.amount,
          status: payment.status,
          paidAt: payment.paidAt,
          channel: payment.channel,
        },
      };
    } catch (error) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data.message || 'Payment verification failed',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  async getUserPayments(userId: string) {
    const payments = await this.paymentModel
      .find({ userId })
      .sort({ createdAt: -1 });

    return {
      message: 'Payments retrieved successfully',
      payments: payments.map((p) => ({
        id: p._id,
        orderId: p.orderId,
        amount: p.amount,
        status: p.status,
        reference: p.reference,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      total: payments.length,
    };
  }

  async getAllPayments(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.paymentModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.paymentModel.countDocuments(),
    ]);

    return {
      message: 'All payments retrieved successfully',
      payments: payments.map((p) => ({
        id: p._id,
        userId: p.userId,
        orderId: p.orderId,
        email: p.email,
        amount: p.amount,
        status: p.status,
        reference: p.reference,
        paidAt: p.paidAt,
        channel: p.channel,
        createdAt: p.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPaymentById(id: string) {
    const payment = await this.paymentModel.findById(id);

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Payment retrieved successfully',
      payment,
    };
  }

  async getPaymentStats() {
    const stats = await this.paymentModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalPayments = await this.paymentModel.countDocuments();
    const totalRevenue = await this.paymentModel.aggregate([
      { $match: { status: PaymentStatus.SUCCESS } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      message: 'Payment statistics retrieved successfully',
      stats: {
        totalPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        byStatus: stats.reduce(
          (acc, stat) => {
            acc[stat._id] = {
              count: stat.count,
              totalAmount: stat.totalAmount,
            };
            return acc;
          },
          {} as Record<string, any>,
        ),
      },
    };
  }
}
