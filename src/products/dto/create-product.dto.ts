/* eslint-disable */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductCategory, AllSubcategories } from '../schemas/product.schema';
import { IsValidSubcategory } from './validators/category-subcategory.validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Headphones',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality wireless headphones with noise cancellation',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Product price',
    example: 99.99,
    minimum: 0,
  })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Product brand',
    example: 'TechBrand',
  })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({
    description: 'Stock quantity',
    example: 100,
    minimum: 0,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'Product category',
    enum: ProductCategory,
    example: ProductCategory.MEN,
  })
  @IsEnum(ProductCategory)
  @IsNotEmpty()
  category: ProductCategory;

  @ApiProperty({
    description: 'Product subcategory - must match the selected category',
    example: 'shirts',
    enum: AllSubcategories,
    enumName: 'ProductSubcategory',
  })
  @IsString()
  @IsNotEmpty()
  @IsValidSubcategory()
  subcategory: string;

  @ApiProperty({
    description: 'Product image file (JPEG, PNG, GIF, WebP - Max 10MB)',
    type: 'string',
    format: 'binary',
    required: false,
    example: 'product-image.jpg',
  })
  @ValidateIf(() => false) // Skip validation for image field
  image?: any;
}
