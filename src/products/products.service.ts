import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, imageData?: any) {
    const productData = {
      ...createProductDto,
      ...(imageData && {
        imageUrl: imageData.url,
        imageFileId: imageData.fileId,
        thumbnailUrl: imageData.thumbnailUrl,
      }),
    };

    const newProduct = new this.productModel(productData);
    const savedProduct = await newProduct.save();

    return {
      message: 'Product created successfully',
      product: savedProduct,
    };
  }

  async findAll() {
    const products = await this.productModel.find().exec();
    return {
      message: 'Products retrieved successfully',
      products,
      total: products.length,
    };
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return {
      message: 'Product retrieved successfully',
      product,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, imageData?: any) {
    const updateData = {
      ...updateProductDto,
      ...(imageData && {
        imageUrl: imageData.url,
        imageFileId: imageData.fileId,
        thumbnailUrl: imageData.thumbnailUrl,
      }),
    };

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return {
      message: 'Product updated successfully',
      product: updatedProduct,
    };
  }

  async remove(id: string) {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return {
      message: 'Product deleted successfully',
      product: deletedProduct,
    };
  }
}
