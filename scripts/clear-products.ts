import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { Product } from '../src/products/schemas/product.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productModel = app.get<Model<Product>>('ProductModel');

  try {
    console.log('Deleting all products...');
    const result = await productModel.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} products`);
  } catch (error) {
    console.error('Error deleting products:', error);
  } finally {
    await app.close();
  }
}

void bootstrap();
