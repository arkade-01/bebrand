import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  IsOptional,
} from 'class-validator';

export class InitializePaymentDto {
  @ApiProperty({
    description: 'Order ID to pay for',
    example: '68eee98563dff63036826ae1',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'Amount in Naira (will be converted to kobo)',
    example: 5000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Customer email',
    example: 'customer@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Additional metadata',
    required: false,
    example: { customerId: '123', cartId: '456' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Payment reference to verify',
    example: 'ref_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  reference: string;
}
