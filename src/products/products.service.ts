import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  brand: string;
  stock: number;
}

@Injectable()
export class ProductsService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Sample Product',
      description: 'This is a sample product',
      price: 29.99,
      brand: 'SampleBrand',
      stock: 50,
    },
  ];

  create(createProductDto: CreateProductDto) {
    const newProduct = {
      id: this.products.length + 1,
      ...createProductDto,
    };
    this.products.push(newProduct);
    return {
      message: 'Product created successfully',
      product: newProduct,
    };
  }

  findAll() {
    return {
      message: 'Products retrieved successfully',
      products: this.products,
      total: this.products.length,
    };
  }

  findOne(id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return {
      message: 'Product retrieved successfully',
      product,
    };
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updateProductDto,
    };
    return {
      message: 'Product updated successfully',
      product: this.products[productIndex],
    };
  }

  remove(id: number) {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const deletedProduct = this.products.splice(productIndex, 1);
    return {
      message: 'Product deleted successfully',
      product: deletedProduct[0],
    };
  }
}
