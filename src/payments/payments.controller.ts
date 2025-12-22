import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  InitializePaymentDto,
  VerifyPaymentDto,
} from './dto/create-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @Public()
  @ApiOperation({
    summary: 'Initialize a payment with Paystack (Guest checkout supported)',
    description: `
Initialize a payment transaction with Paystack. This endpoint creates a payment session and returns an authorization URL where the customer will complete the payment.

**Complete Flow:**
1. Create an order using \`POST /orders/guest\` (for guest checkout)
2. Call this endpoint with the order ID and customer email
3. Redirect customer to the returned \`authorizationUrl\`
4. Customer completes payment on Paystack checkout page
5. Paystack redirects to \`/payment/callback?reference=xxx\`
6. Backend verifies payment and updates order status to "processing"

**Guest Checkout:**
- No authentication required
- Works for both guest and authenticated users
- Payment records are stored in database

**Test Cards:**
- Success: 4084 0840 8408 4081
- CVV: Any 3 digits
- Expiry: Any future date
- PIN: 0000

**Amount:** Enter amount in Naira (e.g., 299.99 for ₦299.99). It will be automatically converted to Kobo for Paystack.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Payment initialized successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Payment initialized successfully',
        },
        payment: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'payment_id' },
            reference: { type: 'string', example: 'ref_1234567890_abc123' },
            amount: { type: 'number', example: 299.99 },
            authorizationUrl: {
              type: 'string',
              example: 'https://checkout.paystack.com/xxx',
            },
            accessCode: { type: 'string', example: 'access_code_xxx' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  @ApiResponse({
    status: 500,
    description: 'Paystack configuration error or API failure',
  })
  initializePayment(
    @Body() initializePaymentDto: InitializePaymentDto,
    @CurrentUser() user?: { userId: string; email: string },
  ) {
    return this.paymentsService.initializePayment(
      initializePaymentDto,
      user?.userId,
    );
  }

  @Post('verify')
  @Public()
  @ApiOperation({
    summary: 'Verify a payment (Guest checkout supported)',
    description: `
Verify a payment transaction using the payment reference from Paystack.

**Usage:**
- Called automatically by the callback handler
- Can be called manually to check payment status
- Works for both guest and authenticated payments

**When to use:**
- After Paystack redirects back to your frontend
- To check payment status at any time
- To resolve payment inquiries

**Response includes:**
- Payment status (success, pending, failed)
- Payment amount and reference
- Payment channel and timestamp
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Payment verified successfully' },
        payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            reference: { type: 'string' },
            amount: { type: 'number' },
            status: { type: 'string', enum: ['success', 'pending', 'failed'] },
            paidAt: { type: 'string', format: 'date-time' },
            channel: { type: 'string', example: 'card' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Payment verification failed' })
  verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(verifyPaymentDto.reference);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user payments' })
  @ApiResponse({
    status: 200,
    description: 'Returns all payments for current user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserPayments(@CurrentUser() user: { userId: string; email: string }) {
    return this.paymentsService.getUserPayments(user.userId);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Returns all payments',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  getAllPayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.paymentsService.getAllPayments(+page, +limit);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get payment statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns payment statistics',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns payment details',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  getPaymentById(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }
}
