/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('guest')
  @Public()
  @ApiOperation({
    summary: 'Create an order as guest (no authentication required)',
    description: `
Create an order without logging in or creating an account. Perfect for quick checkouts!

**Guest Checkout Flow:**
1. Browse products at \`GET /products\`
2. Create guest order at \`POST /orders/guest\` (this endpoint)
3. Initialize payment at \`POST /payment/initialize\`
4. Complete payment on Paystack
5. Order confirmation sent to provided email

**Important:** 
- No authentication required (no JWT token needed)
- Provide guest email in the request body
- Email confirmation will be sent to the guest email
- Order ID will be returned for payment initialization

**Note:** Guest users cannot track their orders later. Create an account for order history!
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Guest order created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Guest order created successfully',
        },
        order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            isGuestOrder: { type: 'boolean', example: true },
            guestEmail: { type: 'string', example: 'guest@example.com' },
            items: { type: 'array' },
            totalAmount: { type: 'number', example: 259.98 },
            status: { type: 'string', example: 'pending' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  createGuestOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createGuestOrder(createOrderDto);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new order (Guest checkout supported)' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Order created successfully' },
        order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string' },
            items: { type: 'array' },
            totalAmount: { type: 'number', example: 259.98 },
            status: { type: 'string', example: 'pending' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user?: { userId: string; email: string },
  ) {
    return this.ordersService.create(createOrderDto, user?.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all orders (for current user)' })
  @ApiResponse({
    status: 200,
    description: 'Returns all orders for the current user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: { userId: string; email: string }) {
    return this.ordersService.findAllByUser(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the order',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
