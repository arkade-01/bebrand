import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== DASHBOARD ====================
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get admin dashboard overview with comprehensive statistics',
    description: `
Returns enhanced dashboard statistics including:
- Overview metrics (users, products, orders, subscribers)
- Revenue breakdown (today, week, month, total)
- Order status distribution
- Product inventory status (low stock, out of stock)
- Payment statistics and success rate
- Recent orders and users
- Low stock product alerts

Perfect for building a comprehensive admin dashboard matching the design mockups.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns comprehensive dashboard statistics',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        admin: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            email: { type: 'string' },
          },
        },
        stats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number' },
            totalProducts: { type: 'number' },
            totalOrders: { type: 'number' },
            totalRevenue: { type: 'number' },
            todayRevenue: { type: 'number' },
            weekRevenue: { type: 'number' },
            monthRevenue: { type: 'number' },
            revenueGrowth: { type: 'number' },
            pendingOrders: { type: 'number' },
            processingOrders: { type: 'number' },
            shippedOrders: { type: 'number' },
            deliveredOrders: { type: 'number' },
            lowStockCount: { type: 'number' },
            outOfStockCount: { type: 'number' },
            paymentSuccessRate: { type: 'number' },
          },
        },
        recentOrders: { type: 'array' },
        recentUsers: { type: 'array' },
        lowStockProducts: { type: 'array' },
      },
    },
  })
  async getDashboard(@CurrentUser() user: { userId: string; email: string }) {
    const stats = await this.adminService.getDashboardStats();
    return {
      message: 'Welcome to the admin dashboard',
      admin: {
        userId: user.userId,
        email: user.email,
      },
      ...stats,
    };
  }

  // ==================== USER MANAGEMENT ====================
  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Returns paginated list of users' })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.adminService.getAllUsers(+page, +limit);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get detailed information about a specific user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns user details with order history',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    const result = await this.adminService.getUserById(id);
    if (!result.user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string) {
    const result = await this.adminService.deleteUser(id);
    if (!result) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'User deleted successfully',
      user: result,
    };
  }

  // ==================== ORDER MANAGEMENT ====================
  @Get('orders')
  @ApiOperation({ summary: 'Get all orders with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'customer@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of orders',
  })
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return await this.adminService.getAllOrders(
      +page,
      +limit,
      status,
      startDate,
      endDate,
      search,
    );
  }

  @Get('orders/export/csv')
  @ApiOperation({
    summary: 'Export orders to CSV with optional filters',
    description:
      'Downloads all orders matching the filter criteria as a CSV file',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV file download',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  async exportOrdersCSV(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.adminService.exportOrdersToCSV(
      status,
      startDate,
      endDate,
    );

    return {
      data: csv,
      filename: `orders_export_${new Date().toISOString().split('T')[0]}.csv`,
      contentType: 'text/csv',
    };
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get detailed information about a specific order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns order details with customer info',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id') id: string) {
    const result = await this.adminService.getOrderById(id);
    if (!result) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
          example: 'shipped',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status')
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  ) {
    const result = await this.adminService.updateOrderStatus(id, status);
    if (!result) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Order status updated successfully',
      order: result,
    };
  }

  @Delete('orders/:id')
  @ApiOperation({ summary: 'Delete an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async deleteOrder(@Param('id') id: string) {
    const result = await this.adminService.deleteOrder(id);
    if (!result) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Order deleted successfully',
      order: result,
    };
  }

  // ==================== ANALYTICS ====================
  @Get('analytics/revenue')
  @ApiOperation({
    summary:
      'Get revenue analytics including daily revenue and status breakdown',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns revenue analytics data',
  })
  async getRevenueAnalytics() {
    return await this.adminService.getRevenueAnalytics();
  }

  @Get('analytics/orders')
  @ApiOperation({
    summary: 'Get order analytics including status distribution and averages',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns order analytics data',
  })
  async getOrderAnalytics() {
    return await this.adminService.getOrderAnalytics();
  }

  @Get('analytics/sales')
  @ApiOperation({
    summary: 'Get comprehensive sales analytics with top products and category breakdown',
  })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30, description: 'Number of days to analyze' })
  @ApiResponse({
    status: 200,
    description: 'Returns sales analytics data',
  })
  async getSalesAnalytics(@Query('days') days: number = 30) {
    return await this.adminService.getSalesAnalytics(+days);
  }

  // ==================== PRODUCT MANAGEMENT ====================
  @Get('products')
  @ApiOperation({
    summary: 'Get all products with pagination and filtering (Admin view)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'category', required: false, enum: ['men', 'women'] })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, brand, or description' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of products with stock status',
  })
  async getAllProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return await this.adminService.getAllProducts(+page, +limit, category, search);
  }

  @Get('products/stats')
  @ApiOperation({
    summary: 'Get product statistics and inventory overview',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns product statistics',
  })
  async getProductStats() {
    return await this.adminService.getProductStats();
  }

  @Get('products/:id')
  @ApiOperation({
    summary: 'Get detailed product information with sales data',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns product details with order history',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id') id: string) {
    const result = await this.adminService.getProductById(id);
    if (!result) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  // ==================== NEWSLETTER MANAGEMENT ====================
  @Get('newsletter/subscribers')
  @ApiOperation({
    summary: 'Get all newsletter subscribers with pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, example: true })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of subscribers',
  })
  async getAllNewsletterSubscribers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('activeOnly') activeOnly: boolean = true,
  ) {
    return await this.adminService.getAllNewsletterSubscribers(+page, +limit, activeOnly === true || activeOnly === undefined);
  }

  @Get('newsletter/stats')
  @ApiOperation({
    summary: 'Get newsletter subscription statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns newsletter statistics',
  })
  async getNewsletterStats() {
    return await this.adminService.getNewsletterStats();
  }

  @Delete('newsletter/subscribers/:email')
  @ApiOperation({
    summary: 'Delete a newsletter subscriber',
  })
  @ApiParam({ name: 'email', description: 'Subscriber email address' })
  @ApiResponse({
    status: 200,
    description: 'Subscriber deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscriber not found' })
  async deleteNewsletterSubscriber(@Param('email') email: string) {
    const result = await this.adminService.deleteNewsletterSubscriber(email);
    if (!result) {
      throw new HttpException('Subscriber not found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Subscriber deleted successfully',
      subscriber: result,
    };
  }
}
