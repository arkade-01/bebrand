import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
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
  async initializePayment(@Body() data: InitializePaymentDto) {
    try {
      // Convert amount from Naira to Kobo
      const amountInKobo = this.paymentService.convertToKobo(data.amount);

      const result = await this.paymentService.initializePayment({
        email: data.email,
        amount: amountInKobo,
        orderId: data.orderId,
      });

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
    summary: 'Paystack payment callback (Redirect endpoint)',
    description: `
This endpoint is automatically called by Paystack after payment completion.
It verifies the payment in the background and redirects to the frontend URL with payment status.

**What happens:**
1. Customer completes payment on Paystack
2. Paystack redirects to: \`/payment/callback?reference=xxx\`
3. This endpoint verifies the payment in the background
4. Order status updates to "processing" if payment successful
5. Customer is redirected to: \`{FRONTEND_URL}/order/status\` with query parameters

**Redirect URL Format:**
\`{FRONTEND_URL}/order/status?status=success&orderId=xxx&reference=xxx&amount=xxx\`

**Query Parameters on Redirect:**
- \`status\`: Payment status - "success" or "failed"
- \`orderId\`: Order ID (if available)
- \`reference\`: Payment reference
- \`amount\`: Payment amount in Naira (for success)
- \`message\`: Error message (for failed)

**Query Parameters (Input):**
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
    status: 302,
    description: 'Redirects to {FRONTEND_URL}/order/status with payment status and details',
  })
  async paymentCallback(
    @Query('reference') reference: string,
    @Query('trxref') trxref: string | undefined,
    @Res() res: Response,
  ) {
    const frontendUrl = this.paymentService.getFrontendUrl();
    const baseRedirectUrl = `${frontendUrl}/order/status`;

    try {
      if (!reference && !trxref) {
        // Redirect to frontend with error
        return res.redirect(
          `${baseRedirectUrl}?status=failed&message=${encodeURIComponent('Payment reference is required')}`,
        );
      }

      const paymentRef = reference || trxref || '';

      // Verify payment with Paystack in the background
      const verification = await this.paymentService.verifyPayment(paymentRef);

      if (!verification.status || !verification.data) {
        // Redirect to frontend with failure status
        return res.redirect(
          `${baseRedirectUrl}?status=failed&reference=${encodeURIComponent(paymentRef)}&message=${encodeURIComponent('Payment verification failed')}`,
        );
      }

      // Check if payment was successful
      if (verification.data.status === 'success') {
        // Extract order ID from metadata
        const orderId = verification.data.metadata?.orderId as string;

        if (orderId) {
          // Update order status to processing in the background
          await this.ordersService.update(orderId, {
            status: OrderStatus.PROCESSING,
          });

          const amount = this.paymentService.convertToNaira(
            verification.data.amount,
          );

          // Redirect to frontend with success status
          return res.redirect(
            `${baseRedirectUrl}?status=success&orderId=${encodeURIComponent(orderId)}&reference=${encodeURIComponent(paymentRef)}&amount=${amount}`,
          );
        }

        // Redirect to frontend with success but no order ID
        const amount = this.paymentService.convertToNaira(
          verification.data.amount,
        );
        return res.redirect(
          `${baseRedirectUrl}?status=success&reference=${encodeURIComponent(paymentRef)}&amount=${amount}`,
        );
      } else {
        // Redirect to frontend with failure status
        return res.redirect(
          `${baseRedirectUrl}?status=failed&reference=${encodeURIComponent(paymentRef)}&message=${encodeURIComponent(verification.data.status || 'Payment was not successful')}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Payment verification failed';

      // Redirect to frontend with error
      return res.redirect(
        `${baseRedirectUrl}?status=failed&reference=${encodeURIComponent(reference || trxref || '')}&message=${encodeURIComponent(errorMessage)}`,
      );
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
