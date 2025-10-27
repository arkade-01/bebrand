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
  imageUrl?: string;
  category?: string;
}

@Injectable()
export class ProductsService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Nike Air Max 90',
      description:
        'Classic Nike Air Max 90 sneakers with premium leather and iconic visible Air cushioning. Perfect for everyday wear with timeless style.',
      price: 129.99,
      brand: 'Nike',
      stock: 45,
      imageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      category: 'Footwear',
    },
    {
      id: 2,
      name: 'Apple AirPods Pro',
      description:
        'Premium wireless earbuds with active noise cancellation, transparency mode, and spatial audio. Includes MagSafe charging case.',
      price: 249.99,
      brand: 'Apple',
      stock: 78,
      imageUrl:
        'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&q=80',
      category: 'Electronics',
    },
    {
      id: 3,
      name: 'Adidas Ultraboost 22',
      description:
        'Revolutionary running shoes with responsive Boost cushioning and Primeknit upper for ultimate comfort and performance.',
      price: 189.99,
      brand: 'Adidas',
      stock: 32,
      imageUrl:
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
      category: 'Footwear',
    },
    {
      id: 4,
      name: 'Sony WH-1000XM5',
      description:
        'Industry-leading noise canceling wireless headphones with exceptional sound quality, 30-hour battery life, and premium comfort.',
      price: 399.99,
      brand: 'Sony',
      stock: 23,
      imageUrl:
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
      category: 'Electronics',
    },
    {
      id: 5,
      name: 'Ray-Ban Aviator Classic',
      description:
        'Iconic Ray-Ban aviator sunglasses with crystal lenses and gold frames. Timeless style with 100% UV protection.',
      price: 159.99,
      brand: 'Ray-Ban',
      stock: 56,
      imageUrl:
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
      category: 'Accessories',
    },
    {
      id: 6,
      name: 'Samsung Galaxy Watch 6',
      description:
        'Advanced smartwatch with comprehensive health tracking, GPS, fitness features, and seamless smartphone integration. Water-resistant design.',
      price: 299.99,
      brand: 'Samsung',
      stock: 41,
      imageUrl:
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
      category: 'Electronics',
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
