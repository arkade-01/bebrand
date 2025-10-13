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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== DASHBOARD ====================
  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard overview with statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns comprehensive dashboard statistics',
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
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of orders',
  })
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ) {
    return await this.adminService.getAllOrders(+page, +limit, status);
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
}
