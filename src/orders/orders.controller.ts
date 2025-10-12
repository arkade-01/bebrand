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

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: { userId: string; email: string },
  ) {
    return this.ordersService.create(createOrderDto, user.userId);
  }

  @Get()
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
