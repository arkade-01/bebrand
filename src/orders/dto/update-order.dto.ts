import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../schemas/order.schema';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
    required: false,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({
    description: 'Shipping address',
    example: '456 New St, City, Country',
    required: false,
  })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Updated delivery instructions',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
