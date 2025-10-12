import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard info' })
  @ApiResponse({ status: 200, description: 'Returns admin dashboard data' })
  getDashboard(@CurrentUser() user: { userId: string; email: string }) {
    // In a real app, check user role here
    return {
      message: 'Welcome to the admin dashboard',
      user: {
        userId: user.userId,
        email: user.email,
      },
      stats: {
        users: 42,
        products: 17,
        orders: 8,
      },
    };
  }
}
