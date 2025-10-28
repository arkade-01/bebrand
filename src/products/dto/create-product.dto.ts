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
import { ProductCategory, MenSubcategory, WomenSubcategory, AllSubcategories } from '../schemas/product.schema';
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
  description?: string;https://github.com/arkade-01/bebrand/pull/1/conflict?name=src%252Fproducts%252Fdto%252Fcreate-product.dto.ts&ancestor_oid=3217cb8a91c41b30ebae6f20b9c5ab9df6fd7905&base_oid=237708c58ae0cd8d52f2f9b3d33ad742507fcec6&head_oid=838a2cb02b644ba8fa8c97851aaab53bf04c71e0

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
    enumName: 'ProductSubcategory'
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
    example: 'product-image.jpg'
  })
  @ValidateIf(() => false) // Skip validation for image field
  image?: any;
}
