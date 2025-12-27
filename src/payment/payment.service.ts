/* eslint-disable */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface InitializePaymentDto {
  email: string;
  amount: number; // in kobo (smallest currency unit)
  orderId: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentVerificationResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    amount: number;
    status: string;
    paid_at: string;
    metadata?: any;
  };
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private secretKey: string | undefined;
  private readonly callbackUrl: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!this.secretKey) {
      this.logger.warn(
        'PAYSTACK_SECRET_KEY not found. Payment service will not work.',
      );
    }

    this.callbackUrl =
      this.configService.get<string>('PAYSTACK_CALLBACK_URL') ||
      'http://localhost:3000/payment/callback';
  }

  async initializePayment(
    data: InitializePaymentDto,
    origin?: string,
  ): Promise<{ status: boolean; message: string; data?: any }> {
    if (!this.secretKey) {
      throw new Error('Paystack is not configured');
    }

    // Determine callback URL based on request origin
    let callbackUrl = data.callbackUrl || this.callbackUrl;
    
    if (origin && !data.callbackUrl) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callbackUrl = 'http://localhost:5173/payment/callback';
      } else if (origin.includes('vercel.app') || origin.includes('be-brand')) {
        callbackUrl = 'https://be-brand.vercel.app/payment/callback';
      }
    }

    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: data.email,
          amount: data.amount, // Amount in kobo
          callback_url: callbackUrl,
          reference: `order_${data.orderId}_${Date.now()}`,
          metadata: {
            orderId: data.orderId,
            ...data.metadata,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `Payment initialized for order ${data.orderId}: ${response.data.data.reference}`,
      );

      return {
        status: response.data.status,
        message: response.data.message || 'Payment initialized successfully',
        data: {
          authorizationUrl: response.data.data.authorization_url,
          accessCode: response.data.data.access_code,
          reference: response.data.data.reference,
        },
      };
    } catch (error) {
      this.logger.error('Failed to initialize payment:', error);
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    if (!this.secretKey) {
      throw new Error('Paystack is not configured');
    }

    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `Payment verified: ${reference} - ${response.data.status}`,
      );

      return {
        status: response.data.status,
        message: response.data.message || 'Payment verification successful',
        data: response.data.data
          ? {
              reference: response.data.data.reference,
              amount: response.data.data.amount,
              status: response.data.data.status,
              paid_at: response.data.data.paid_at,
              metadata: response.data.data.metadata,
            }
          : undefined,
      };
    } catch (error) {
      this.logger.error('Failed to verify payment:', error);
      throw error;
    }
  }

  /**
   * Convert amount from Naira to Kobo (Paystack requires amount in kobo)
   * @param amountInNaira Amount in Naira
   * @returns Amount in Kobo
   */
  convertToKobo(amountInNaira: number): number {
    return Math.round(amountInNaira * 100);
  }

  /**
   * Convert amount from Kobo to Naira
   * @param amountInKobo Amount in Kobo
   * @returns Amount in Naira
   */
  convertToNaira(amountInKobo: number): number {
    return amountInKobo / 100;
  }

  /**
   * Get the frontend URL from environment variables
   * @returns Frontend URL
   */
  getFrontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  }
}
