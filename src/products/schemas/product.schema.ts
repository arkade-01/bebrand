import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ProductCategory {
  MEN = 'men',
  WOMEN = 'women',
}

export enum MenSubcategory {
  SHIRTS = 'shirts',
  PANTS = 'pants',
  ACCESSORIES = 'accessories',
  SHOES = 'shoes',
  OUTERWEAR = 'outerwear',
  UNDERWEAR = 'underwear',
  SPORTSWEAR = 'sportswear',
}

export enum WomenSubcategory {
  LIFE_ACCESSORIES = 'life accessories',
  DRESSES = 'dresses',
  TOPS = 'tops',
  BOTTOMS = 'bottoms',
  SHOES = 'shoes',
  ACCESSORIES = 'accessories',
  OUTERWEAR = 'outerwear',
  UNDERWEAR = 'underwear',
  SPORTSWEAR = 'sportswear',
}

// Combined enum for Swagger UI dropdown
export const AllSubcategories = {
  ...MenSubcategory,
  ...WomenSubcategory,
};

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ type: String, enum: ProductCategory, required: true })
  category: ProductCategory;

  @Prop({ required: true })
  subcategory: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  imageFileId?: string;

  @Prop()
  thumbnailUrl?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
