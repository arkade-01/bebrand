import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProductsService } from '../src/products/products.service';
import { ProductCategory } from '../src/products/schemas/product.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);

  const products = [
    // Men's Shirts (5 products)
    {
      name: 'Classic White Oxford Shirt',
      description:
        'Timeless white oxford shirt perfect for formal and casual occasions',
      price: 49.99,
      brand: 'BeBrand Essentials',
      stock: 50,
      category: ProductCategory.MEN,
      subcategory: 'shirts',
      imageUrl:
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80',
    },
    {
      name: 'Slim Fit Blue Dress Shirt',
      description:
        'Modern slim fit dress shirt in sky blue with button-down collar',
      price: 54.99,
      brand: 'BeBrand Premium',
      stock: 45,
      category: ProductCategory.MEN,
      subcategory: 'shirts',
      imageUrl:
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80',
    },
    {
      name: 'Casual Plaid Flannel Shirt',
      description: 'Comfortable flannel shirt with classic plaid pattern',
      price: 39.99,
      brand: 'BeBrand Casual',
      stock: 60,
      category: ProductCategory.MEN,
      subcategory: 'shirts',
      imageUrl:
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&q=80',
    },
    {
      name: 'Linen Short Sleeve Shirt',
      description: 'Breathable linen shirt perfect for summer',
      price: 44.99,
      brand: 'BeBrand Summer',
      stock: 35,
      category: ProductCategory.MEN,
      subcategory: 'shirts',
      imageUrl:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
    },
    {
      name: 'Black Tuxedo Shirt',
      description: 'Elegant tuxedo shirt for formal events',
      price: 69.99,
      brand: 'BeBrand Formal',
      stock: 25,
      category: ProductCategory.MEN,
      subcategory: 'shirts',
      imageUrl:
        'https://images.unsplash.com/photo-1621951753854-c265dce1187b?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1621951753854-c265dce1187b?w=400&q=80',
    },

    // Men's Pants (5 products)
    {
      name: 'Classic Fit Chinos Navy',
      description: 'Versatile navy chinos with classic fit',
      price: 59.99,
      brand: 'BeBrand Essentials',
      stock: 55,
      category: ProductCategory.MEN,
      subcategory: 'pants',
      imageUrl:
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
    },
    {
      name: 'Slim Fit Dark Denim Jeans',
      description: 'Dark wash slim fit jeans with stretch comfort',
      price: 79.99,
      brand: 'BeBrand Denim',
      stock: 70,
      category: ProductCategory.MEN,
      subcategory: 'pants',
      imageUrl:
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
    },
    {
      name: 'Cargo Pants Olive Green',
      description: 'Functional cargo pants with multiple pockets',
      price: 64.99,
      brand: 'BeBrand Urban',
      stock: 40,
      category: ProductCategory.MEN,
      subcategory: 'pants',
      imageUrl:
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
    },
    {
      name: 'Formal Dress Pants Grey',
      description: 'Tailored grey dress pants for business occasions',
      price: 74.99,
      brand: 'BeBrand Premium',
      stock: 30,
      category: ProductCategory.MEN,
      subcategory: 'pants',
      imageUrl:
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80',
    },
    {
      name: 'Athletic Joggers Black',
      description: 'Comfortable joggers with tapered fit',
      price: 49.99,
      brand: 'BeBrand Active',
      stock: 65,
      category: ProductCategory.MEN,
      subcategory: 'pants',
      imageUrl:
        'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=400&q=80',
    },

    // Men's Shoes (5 products)
    {
      name: 'Leather Oxford Shoes Brown',
      description: 'Classic brown leather oxford shoes',
      price: 129.99,
      brand: 'BeBrand Footwear',
      stock: 35,
      category: ProductCategory.MEN,
      subcategory: 'shoes',
      imageUrl:
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80',
    },
    {
      name: 'White Canvas Sneakers',
      description: 'Minimalist white canvas sneakers for everyday wear',
      price: 59.99,
      brand: 'BeBrand Casual',
      stock: 80,
      category: ProductCategory.MEN,
      subcategory: 'shoes',
      imageUrl:
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
    },
    {
      name: 'Running Shoes Performance',
      description: 'High-performance running shoes with cushioned sole',
      price: 99.99,
      brand: 'BeBrand Sport',
      stock: 45,
      category: ProductCategory.MEN,
      subcategory: 'shoes',
      imageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    },
    {
      name: 'Leather Loafers Black',
      description: 'Elegant black leather loafers',
      price: 89.99,
      brand: 'BeBrand Premium',
      stock: 28,
      category: ProductCategory.MEN,
      subcategory: 'shoes',
      imageUrl:
        'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=80',
    },
    {
      name: 'Hiking Boots Waterproof',
      description: 'Durable waterproof hiking boots',
      price: 139.99,
      brand: 'BeBrand Outdoor',
      stock: 20,
      category: ProductCategory.MEN,
      subcategory: 'shoes',
      imageUrl:
        'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&q=80',
    },

    // Women's Dresses (5 products)
    {
      name: 'Floral Summer Dress',
      description: 'Light and breezy floral print summer dress',
      price: 69.99,
      brand: 'BeBrand Femme',
      stock: 40,
      category: ProductCategory.WOMEN,
      subcategory: 'dresses',
      imageUrl:
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80',
    },
    {
      name: 'Little Black Dress',
      description: 'Classic little black dress for any occasion',
      price: 89.99,
      brand: 'BeBrand Elegance',
      stock: 35,
      category: ProductCategory.WOMEN,
      subcategory: 'dresses',
      imageUrl:
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
    },
    {
      name: 'Maxi Boho Dress',
      description: 'Flowing maxi dress with bohemian style',
      price: 79.99,
      brand: 'BeBrand Boho',
      stock: 30,
      category: ProductCategory.WOMEN,
      subcategory: 'dresses',
      imageUrl:
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
    },
    {
      name: 'Cocktail Party Dress Red',
      description: 'Stunning red cocktail dress',
      price: 99.99,
      brand: 'BeBrand Party',
      stock: 25,
      category: ProductCategory.WOMEN,
      subcategory: 'dresses',
      imageUrl:
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80',
    },
    {
      name: 'Midi Wrap Dress',
      description: 'Versatile midi wrap dress in navy',
      price: 74.99,
      brand: 'BeBrand Office',
      stock: 45,
      category: ProductCategory.WOMEN,
      subcategory: 'dresses',
      imageUrl:
        'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80',
    },

    // Women's Tops (5 products)
    {
      name: 'Silk Blouse White',
      description: 'Elegant silk blouse perfect for office',
      price: 64.99,
      brand: 'BeBrand Premium',
      stock: 50,
      category: ProductCategory.WOMEN,
      subcategory: 'tops',
      imageUrl:
        'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&q=80',
    },
    {
      name: 'Casual T-Shirt Striped',
      description: 'Comfortable striped cotton t-shirt',
      price: 29.99,
      brand: 'BeBrand Basics',
      stock: 75,
      category: ProductCategory.WOMEN,
      subcategory: 'tops',
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    },
    {
      name: 'Off-Shoulder Top Black',
      description: 'Trendy off-shoulder top',
      price: 44.99,
      brand: 'BeBrand Trend',
      stock: 55,
      category: ProductCategory.WOMEN,
      subcategory: 'tops',
      imageUrl:
        'https://images.unsplash.com/photo-1564257577315-8e93b07f2351?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1564257577315-8e93b07f2351?w=400&q=80',
    },
    {
      name: 'Knit Sweater Beige',
      description: 'Cozy knit sweater for cooler days',
      price: 59.99,
      brand: 'BeBrand Cozy',
      stock: 40,
      category: ProductCategory.WOMEN,
      subcategory: 'tops',
      imageUrl:
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80',
    },
    {
      name: 'Crop Top Athletic',
      description: 'Sports crop top with moisture-wicking fabric',
      price: 34.99,
      brand: 'BeBrand Active',
      stock: 60,
      category: ProductCategory.WOMEN,
      subcategory: 'tops',
      imageUrl:
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&q=80',
    },

    // Women's Shoes (5 products)
    {
      name: 'High Heels Black Patent',
      description: 'Classic black patent leather high heels',
      price: 89.99,
      brand: 'BeBrand Elegance',
      stock: 30,
      category: ProductCategory.WOMEN,
      subcategory: 'shoes',
      imageUrl:
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80',
    },
    {
      name: 'Ballet Flats Nude',
      description: 'Comfortable nude ballet flats',
      price: 49.99,
      brand: 'BeBrand Comfort',
      stock: 65,
      category: ProductCategory.WOMEN,
      subcategory: 'shoes',
      imageUrl:
        'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&q=80',
    },
    {
      name: 'Ankle Boots Brown Leather',
      description: 'Stylish brown leather ankle boots',
      price: 119.99,
      brand: 'BeBrand Footwear',
      stock: 35,
      category: ProductCategory.WOMEN,
      subcategory: 'shoes',
      imageUrl:
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80',
    },
    {
      name: 'Sneakers White Platform',
      description: 'Trendy white platform sneakers',
      price: 69.99,
      brand: 'BeBrand Street',
      stock: 55,
      category: ProductCategory.WOMEN,
      subcategory: 'shoes',
      imageUrl:
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80',
    },
    {
      name: 'Sandals Strappy Gold',
      description: 'Elegant gold strappy sandals',
      price: 54.99,
      brand: 'BeBrand Summer',
      stock: 40,
      category: ProductCategory.WOMEN,
      subcategory: 'shoes',
      imageUrl:
        'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&q=80',
    },
  ];

  try {
    console.log('Starting to seed products...');

    for (const productData of products) {
      try {
        const result = await productsService.create(productData);
        console.log(`✓ Created: ${result.product.name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`✗ Failed to create ${productData.name}:`, errorMessage);
      }
    }

    console.log(`\n✅ Successfully seeded ${products.length} products!`);
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await app.close();
  }
}

void bootstrap();
