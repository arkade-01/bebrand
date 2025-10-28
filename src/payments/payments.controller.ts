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
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @Public()
  @ApiOperation({
    summary: 'Initialize a payment with Paystack (Guest checkout supported)',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment initialized successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
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
  @ApiOperation({ summary: 'Verify a payment (Guest checkout supported)' })
  @ApiResponse({
    status: 200,
    description: 'Payment verified successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(verifyPaymentDto.reference);
  }

  @Get('my-payments')
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
