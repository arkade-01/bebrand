import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Query,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Post('subscribe')
  @HttpCode(200)
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({
    status: 200,
    description: 'Successfully subscribed to newsletter',
  })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  async subscribe(@Body() subscribeDto: SubscribeNewsletterDto) {
    return await this.newsletterService.subscribe(subscribeDto);
  }

  @Public()
  @Delete('unsubscribe')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully unsubscribed from newsletter',
  })
  @ApiResponse({ status: 409, description: 'Email is not subscribed' })
  async unsubscribe(@Body('email') email: string) {
    return await this.newsletterService.unsubscribe(email);
  }

  @Get('subscribers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all active newsletter subscribers (Admin only)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of subscribers',
  })
  async getAllSubscribers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return await this.newsletterService.getAllSubscribers(+page, +limit);
  }
}
