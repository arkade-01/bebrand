import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('BeBrand E-commerce API')
    .setDescription(
      `
## Welcome to BeBrand API Documentation

A comprehensive e-commerce REST API built with NestJS, MongoDB, JWT authentication, and Paystack payment integration.

### Features
- 🔐 **JWT Authentication** - Secure login and registration with role-based access
- 👥 **User Management** - Complete user profile management
- 📦 **Product Catalog** - 6 pre-loaded products with real images
- 🛒 **Order Management** - Create and track orders (authenticated & guest checkout)
- � **Payment Integration** - Paystack payment gateway with callback verification
- 🛍️ **Guest Checkout** - Place orders without creating an account
- 📧 **Email Notifications** - Welcome emails and order confirmations (Brevo)
- 👨‍💼 **Admin Panel** - Complete admin dashboard with analytics
- 📊 **Analytics** - Revenue and order analytics

### 🔑 Authentication

#### Admin Access Credentials
For testing admin-only endpoints (product creation, updates, deletion):

**Email**: \`admin@bebrand.com\`  
**Password**: \`Admin123!\`

#### Getting Started
1. **Register** a new user via \`POST /auth/register\` OR use admin credentials above
2. **Login** to get your JWT token via \`POST /auth/login\`
3. Click the **Authorize** button (🔓) and enter: \`Bearer YOUR_TOKEN\`
4. Start making authenticated requests!

### 💳 Payment Flow (Paystack)

#### For Authenticated Users:
1. Create order: \`POST /orders\`
2. Initialize payment: \`POST /payment/initialize\` with order ID
3. User redirects to Paystack payment page
4. After payment, Paystack redirects to: \`/payment/callback?reference=xxx\`
5. Order status automatically updates to "processing"

#### For Guest Users:
1. Create guest order: \`POST /orders/guest\` (no auth required)
2. Initialize payment: \`POST /payment/initialize\` with order ID and guest email
3. Complete payment on Paystack
4. Order status updates automatically

### 🛍️ Products
6 pre-loaded products available:
- Nike Air Max 90 ($129.99)
- Apple AirPods Pro ($249.99)
- Adidas Ultraboost 22 ($189.99)
- Sony WH-1000XM5 ($399.99)
- Ray-Ban Aviator Classic ($159.99)
- Samsung Galaxy Watch 6 ($299.99)

### 🔒 Role-Based Access Control
- **Public**: View products, guest checkout, payment callbacks
- **Regular Users**: Create orders, view own orders, manage profile
- **Admin Users**: Full access including create/update/delete products + all admin endpoints

### 🔑 Admin-Only Endpoints
These endpoints require Admin role:
- \`POST /products\` - Create new products
- \`PATCH /products/:id\` - Update products
- \`DELETE /products/:id\` - Delete products
- All \`/admin/*\` endpoints - Dashboard, user management, order management, analytics

### 🌐 Available Servers
- **Production**: https://bebrand-eoo2.onrender.com
- **Development**: http://localhost:3000

Select your preferred server from the dropdown above to test the API!

### 📧 Email Configuration
The API sends emails via Brevo for:
- Welcome emails on successful registration
- Order confirmation after placing an order

### 💡 Testing Payment
Use Paystack test cards:
- **Success**: 4084084084084081
- **Declined**: 4084080000000408

### 📚 Additional Documentation
- Email Setup: See EMAIL_SETUP.md
- Payment Integration: See PAYMENT_INTEGRATION.md
- Products Catalog: See PRODUCTS.md
- Checkout Flow: See CHECKOUT_FLOW.md

### 🆘 Support
For issues or questions, contact the development team.
    `.trim(),
    )
    .setVersion('1.0.0')
    .addServer('https://bebrand-eoo2.onrender.com', 'Production Server')
    .addServer('http://localhost:3000', 'Development Server')
    .addTag('Auth', 'Authentication endpoints - Register and login')
    .addTag('Users', 'User profile management')
    .addTag(
      'Products',
      'Product catalog - View: Public | Create/Update/Delete: Admin only',
    )
    .addTag(
      'Orders',
      'Order management - Authenticated orders & Guest checkout available',
    )
    .addTag(
      'Payment',
      'Paystack payment integration - Initialize payment & verify transactions',
    )
    .addTag(
      'Admin',
      'Admin panel - User management, order management, and analytics (Admin only)',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

void bootstrap();
