/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Headers,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PaymentService } from './payment.service';
import { OrdersService } from '../orders/orders.service';
import { Public } from '../common/decorators/public.decorator';
import { OrderStatus } from '../orders/schemas/order.schema';

class InitializePaymentDto {
  email: string;
  amount: number;
  orderId: string;
}

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('initialize')
  @Public()
  @ApiOperation({
    summary: 'Initialize payment with Paystack',
    description: `
Initialize a payment transaction with Paystack. This endpoint creates a payment session and returns an authorization URL where the customer will complete the payment.

**Flow:**
1. Create an order (authenticated or guest)
2. Call this endpoint with the order ID and customer email
3. Redirect customer to the returned authorization URL
4. Customer completes payment on Paystack
5. Paystack redirects to callback URL with payment reference
6. Order status automatically updates to "processing"

**Test Cards:**
- Success: 4084084084084081
- Declined: 4084080000000408
- CVV: Any 3 digits
- PIN: 0000 (for PIN authentication)

**Amount:** Enter amount in Naira (e.g., 1000 for ₦1,000). It will be automatically converted to Kobo for Paystack.
    `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'amount', 'orderId'],
      properties: {
        email: {
          type: 'string',
          example: 'customer@example.com',
          description: 'Customer email address',
        },
        amount: {
          type: 'number',
          example: 10000,
          description: 'Amount in Naira (will be converted to Kobo)',
        },
        orderId: {
          type: 'string',
          example: '507f1f77bcf86cd799439011',
          description: 'MongoDB Order ID',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment initialized successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Authorization URL created' },
        data: {
          type: 'object',
          properties: {
            authorizationUrl: {
              type: 'string',
              example: 'https://checkout.paystack.com/xxx',
              description: 'Redirect customer to this URL',
            },
            accessCode: { type: 'string', example: 'xxx' },
            reference: {
              type: 'string',
              example: 'xxx',
              description: 'Payment reference for verification',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data',
  })
  async initializePayment(
    @Body() data: InitializePaymentDto,
    @Headers('origin') origin?: string,
  ) {
    try {
      // Convert amount from Naira to Kobo
      const amountInKobo = this.paymentService.convertToKobo(data.amount);

      const result = await this.paymentService.initializePayment(
        {
          email: data.email,
          amount: amountInKobo,
          orderId: data.orderId,
        },
        origin,
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to initialize payment';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('callback')
  @Public()
  @ApiOperation({
    summary: 'Paystack payment callback (Webhook endpoint)',
    description: `
This endpoint is automatically called by Paystack after payment completion. 
It verifies the payment with Paystack and updates the order status accordingly.

**What happens:**
1. Customer completes payment on Paystack
2. Paystack redirects to: https://bebrand-eoo2.onrender.com/payment/callback?reference=xxx
3. This endpoint verifies the payment
4. Order status updates to "processing" if payment successful
5. Customer sees success/failure message

**Frontend Integration:**
After payment, redirect user to your frontend with query params:
- Success: http://localhost:3001/order-success?orderId=xxx&reference=xxx
- Failed: http://localhost:3001/order-failed?reference=xxx

**Query Parameters:**
- \`reference\`: Payment reference from Paystack (required)
- \`trxref\`: Alternative transaction reference
    `,
  })
  @ApiQuery({
    name: 'reference',
    type: 'string',
    description: 'Payment reference from Paystack',
    required: true,
    example: 'T123456789',
  })
  @ApiQuery({
    name: 'trxref',
    type: 'string',
    description: 'Alternative transaction reference',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verified and order updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Payment successful! Your order is being processed.',
        },
        orderId: {
          type: 'string',
          example: '507f1f77bcf86cd799439011',
        },
        reference: { type: 'string', example: 'T123456789' },
        amount: { type: 'number', example: 10000 },
        paidAt: { type: 'string', example: '2025-10-27T10:30:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Payment verification failed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Payment was not successful' },
        reference: { type: 'string' },
      },
    },
  })
  async paymentCallback(
    @Query('reference') reference: string,
    @Query('trxref') trxref?: string,
  ) {
    try {
      if (!reference && !trxref) {
        throw new HttpException(
          'Payment reference is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const paymentRef = reference || trxref || '';

      // Verify payment with Paystack
      const verification = await this.paymentService.verifyPayment(paymentRef);

      if (!verification.status || !verification.data) {
        return {
          success: false,
          message: 'Payment verification failed',
          reference: paymentRef,
        };
      }

      // Check if payment was successful
      if (verification.data.status === 'success') {
        // Extract order ID from metadata
        const orderId = verification.data.metadata?.orderId as string;

        if (orderId) {
          // Update order status to processing
          await this.ordersService.update(orderId, {
            status: OrderStatus.PROCESSING,
          });

          return {
            success: true,
            message: 'Payment successful! Your order is being processed.',
            orderId: orderId,
            reference: paymentRef,
            amount: this.paymentService.convertToNaira(
              verification.data.amount,
            ),
            paidAt: verification.data.paid_at,
          };
        }

        return {
          success: true,
          message: 'Payment verified successfully',
          reference: paymentRef,
          amount: this.paymentService.convertToNaira(verification.data.amount),
        };
      } else {
        return {
          success: false,
          message: 'Payment was not successful',
          status: verification.data.status,
          reference: paymentRef,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Payment verification failed';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('verify/:reference')
  @Public()
  @ApiOperation({
    summary: 'Manually verify payment status',
    description: `
Manually verify a payment transaction using the payment reference.

Use this endpoint to check payment status at any time, especially useful for:
- Debugging failed transactions
- Checking payment status from your frontend
- Resolving customer inquiries

**Returns:** Complete payment information including status, amount, customer details, and metadata.
    `,
  })
  @ApiQuery({
    name: 'reference',
    type: 'string',
    description: 'Paystack payment reference',
    required: true,
    example: 'T123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Verification successful' },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            reference: { type: 'string', example: 'T123456789' },
            amount: {
              type: 'number',
              example: 10000,
              description: 'Amount in Naira',
            },
            currency: { type: 'string', example: 'NGN' },
            customer: {
              type: 'object',
              properties: {
                email: { type: 'string', example: 'customer@example.com' },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                orderId: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439011',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Payment verification failed',
  })
  async verifyPayment(@Query('reference') reference: string) {
    try {
      const verification = await this.paymentService.verifyPayment(reference);

      return {
        success: verification.status,
        message: verification.message,
        data: verification.data
          ? {
              ...verification.data,
              amount: this.paymentService.convertToNaira(
                verification.data.amount,
              ),
            }
          : null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Payment verification failed';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }
}
