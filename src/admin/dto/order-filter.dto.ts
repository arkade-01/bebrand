import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';

export class OrderFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by order status',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  })
  @IsOptional()
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter orders from this date (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter orders until this date (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Search by customer email or order ID',
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  limit?: number;
}
