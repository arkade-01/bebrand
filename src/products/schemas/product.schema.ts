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

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
}

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

  // Virtual property for stock status
  get stockStatus(): StockStatus {
    if (this.stock === 0) return StockStatus.OUT_OF_STOCK;
    if (this.stock <= 10) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Enable virtuals in JSON
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    // Add stock status to the returned object
    const stockStatus = doc.stockStatus;
    return { ...ret, stockStatus };
  },
});
