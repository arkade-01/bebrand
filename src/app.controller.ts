import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CurrentUser } from './common/decorators/current-user.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get welcome message (Public)' })
  @ApiResponse({ status: 200, description: 'Returns welcome message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile (Protected)' })
  @ApiResponse({ status: 200, description: 'Returns current user info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: { userId: string; email: string }) {
    return {
      message: 'This is a protected route',
      user: user,
    };
  }
}
