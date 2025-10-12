import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Headphones',
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    description: 'Quantity',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Price per unit',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Subtotal (quantity * price)',
    example: 199.98,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  subtotal: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Array of order items',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Shipping address',
    example: '123 Main St, City, Country',
    required: false,
  })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Please handle with care',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
