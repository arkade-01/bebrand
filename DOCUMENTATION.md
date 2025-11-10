# BeBrand E-commerce API - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Payment Integration](#payment-integration)
8. [Email Service](#email-service)
9. [Frontend Integration](#frontend-integration)
10. [Admin Features](#admin-features)
11. [Deployment](#deployment)

---

## 🎯 Overview

**BeBrand** is a comprehensive e-commerce REST API built with NestJS, featuring:

- 🔐 JWT-based authentication with role-based access control
- 📦 Complete product catalog management
- 🛒 Guest and authenticated checkout
- 💳 Paystack payment integration
- 📧 Automated email notifications via Brevo
- 👨‍💼 Admin dashboard with analytics
- 📊 Order management and tracking
- 🎨 Black & white themed email templates

### Tech Stack
- **Framework**: NestJS 11.0.1
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Payment Gateway**: Paystack
- **Email Service**: Brevo (Sendinblue)
- **Image Upload**: ImageKit (optional)
- **Documentation**: Swagger/OpenAPI

---

## 🏗️ Architecture

```
src/
├── admin/              # Admin-only endpoints (dashboard, analytics)
├── auth/               # Authentication (register, login)
├── common/             # Shared utilities (decorators, guards)
├── email/              # Email service (Brevo integration)
├── orders/             # Order management
├── payment/            # Payment processing (Paystack)
├── payments/           # Payment history & tracking
├── products/           # Product CRUD operations
├── users/              # User management
└── upload/             # Image upload (ImageKit)
```

### Design Patterns
- **Module Pattern**: Each feature is encapsulated in its own module
- **Dependency Injection**: Services are injected via NestJS DI container
- **Repository Pattern**: Mongoose models act as repositories
- **Guard Pattern**: JWT and Role guards for route protection
- **Decorator Pattern**: Custom decorators for user context

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 18.x
npm >= 9.x
MongoDB Atlas account
Brevo account (for emails)
Paystack account (for payments)
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Goldexcool/bebrand.git
cd bebrand
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```properties
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/bebrand

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Brevo Email
BREVO_API_KEY=xkeysib-your-key-here
BREVO_SENDER_EMAIL=your-verified-email@domain.com
BREVO_SENDER_NAME=BeBrand

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your-key-here
PAYSTACK_PUBLIC_KEY=pk_test_your-key-here
PAYSTACK_CALLBACK_URL=https://your-domain.com/payment/callback

# URLs
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000
PORT=3000
```

4. **Run the application**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

5. **Access Swagger Documentation**
```
http://localhost:3000/api/docs
```

### Create Admin User
```bash
npm run create-admin
```

---

## 🔌 API Endpoints

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://bebrand-eoo2.onrender.com`

### Authentication Endpoints

#### POST /auth/register
Register a new user (sends welcome email)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/login
Login with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Product Endpoints

#### GET /products
Get all products (Public)

**Query Parameters:**
- `category` (optional): Filter by category (men, women)
- `subcategory` (optional): Filter by subcategory
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `inStock` (optional): true/false

**Response:**
```json
{
  "message": "Products retrieved successfully",
  "products": [
    {
      "_id": "69013fc3ffe6cde69f385774",
      "name": "Nike Air Max 90",
      "description": "Classic Nike sneakers...",
      "price": 129.99,
      "brand": "Nike",
      "stock": 50,
      "category": "men",
      "subcategory": "shoes",
      "imageUrl": "https://example.com/image.jpg",
      "createdAt": "2025-10-28T...",
      "updatedAt": "2025-10-28T..."
    }
  ],
  "total": 6
}
```

#### POST /products
Create a new product (Admin only)

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "name": "Cotton Polo Shirt",
  "description": "Premium cotton polo",
  "price": 12500.00,
  "brand": "BeBrand",
  "stock": 100,
  "category": "men",
  "subcategory": "shirts",
  "image": "<file>"
}
```

#### GET /products/:id
Get single product

#### PATCH /products/:id
Update product (Admin only)

#### DELETE /products/:id
Delete product (Admin only)

---

### Order Endpoints

#### POST /orders/guest
Create order as guest (no authentication required)

**Request Body:**
```json
{
  "items": [
    {
      "productId": "69013fc3ffe6cde69f385774",
      "quantity": 2
    }
  ],
  "customerEmail": "customer@example.com",
  "customerFirstName": "Jane",
  "customerLastName": "Doe",
  "customerPhone": "+234 800 000 0000",
  "guestInfo": {
    "email": "customer@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "+234 800 000 0000"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "zipCode": "100001",
    "country": "Nigeria"
  },
  "notes": "Please deliver before 5pm"
}
```

**Response:**
```json
{
  "_id": "690148658a806a41d550ee2c",
  "items": [
    {
      "productId": "69013fc3ffe6cde69f385774",
      "quantity": 2,
      "productName": "Nike Air Max 90",
      "price": 129.99,
      "subtotal": 259.98
    }
  ],
  "totalAmount": 259.98,
  "status": "pending",
  "customerEmail": "customer@example.com",
  "customerFirstName": "Jane",
  "customerLastName": "Doe",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "zipCode": "100001",
    "country": "Nigeria"
  },
  "isGuestOrder": true,
  "createdAt": "2025-10-28T...",
  "updatedAt": "2025-10-28T..."
}
```

#### POST /orders
Create order (authenticated users)

**Headers:**
```
Authorization: Bearer {token}
```

#### GET /orders
Get user's orders (authenticated)

#### GET /orders/:id
Get order by ID

#### PATCH /orders/:id
Update order

#### DELETE /orders/:id
Delete order

---

### Payment Endpoints

#### POST /payments/initialize
Initialize Paystack payment

**Request Body:**
```json
{
  "orderId": "690148658a806a41d550ee2c",
  "email": "customer@example.com"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "...",
    "reference": "..."
  }
}
```

#### POST /payments/verify
Verify payment after Paystack redirect

**Request Body:**
```json
{
  "reference": "paystack-reference-123"
}
```

#### GET /payments/callback
Paystack callback handler (automatic)

---

### Admin Endpoints

All admin endpoints require `Authorization: Bearer {admin_token}`

#### GET /admin/dashboard
Get dashboard statistics

**Response:**
```json
{
  "totalRevenue": 125450.00,
  "revenueGrowth": 8.7,
  "totalOrders": 1560,
  "ordersGrowth": 41.6,
  "newCustomers": 247,
  "customersGrowth": 12.5,
  "productsInStock": 1560,
  "lowStockItems": 15,
  "ordersByStatus": {
    "pending": 45,
    "processing": 120,
    "shipped": 80,
    "delivered": 1200,
    "cancelled": 115
  },
  "recentActivity": [
    {
      "customerId": "Jane D.",
      "customer": "Jane Doe",
      "orderId": "#1567",
      "status": "delivered",
      "date": "2025-10-28"
    }
  ]
}
```

#### GET /admin/users
Get all users with pagination

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name or email

#### GET /admin/orders
Get all orders with filtering

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status (pending, processing, shipped, delivered, cancelled)
- `startDate`: Filter by date range
- `endDate`: Filter by date range

#### PATCH /admin/orders/:id/status
Update order status

**Request Body:**
```json
{
  "status": "shipped"
}
```

#### GET /admin/analytics/revenue
Get revenue analytics

**Response:**
```json
{
  "totalRevenue": 125450.00,
  "dailyRevenue": [
    { "date": "2025-10-01", "revenue": 5000.00 },
    { "date": "2025-10-02", "revenue": 6200.00 }
  ],
  "byStatus": {
    "delivered": 100000.00,
    "processing": 25450.00
  }
}
```

#### GET /admin/analytics/orders
Get order analytics

---

## 💾 Database Schema

### User Schema
```typescript
{
  email: string (unique, required),
  password: string (hashed, required),
  firstName: string (required),
  lastName: string (required),
  role: enum ['user', 'admin'] (default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```typescript
{
  name: string (required),
  description: string,
  price: number (required),
  brand: string (required),
  stock: number (required, default: 0),
  category: enum ['men', 'women'] (required),
  subcategory: string (required),
  imageUrl: string,
  imageFileId: string,
  thumbnailUrl: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```typescript
{
  userId: ObjectId (ref: 'User', optional),
  items: [
    {
      productId: string (required),
      quantity: number (required),
      productName: string,
      price: number,
      subtotal: number
    }
  ],
  totalAmount: number (required),
  status: enum ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  customerEmail: string,
  customerFirstName: string,
  customerLastName: string,
  customerPhone: string,
  shippingAddress: {
    street: string (required),
    city: string (required),
    state: string (required),
    zipCode: string (required),
    country: string (required)
  },
  notes: string,
  paymentReference: string,
  isGuestOrder: boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Schema
```typescript
{
  orderId: ObjectId (ref: 'Order', required),
  userId: ObjectId (ref: 'User'),
  amount: number (required),
  currency: string (default: 'NGN'),
  reference: string (unique, required),
  status: enum ['pending', 'success', 'failed'],
  paystackResponse: object,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role-Based Access Control

**Public Routes** (No authentication):
- `GET /products`
- `GET /products/:id`
- `POST /auth/register`
- `POST /auth/login`
- `POST /orders/guest`
- `GET /payment/callback`

**User Routes** (Requires JWT):
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `GET /profile`
- `POST /payments/initialize`

**Admin Routes** (Requires JWT + admin role):
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`
- All `/admin/*` endpoints

### Using JWT in Requests

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Swagger:**
Click the 🔓 Authorize button and enter: `Bearer YOUR_TOKEN`

---

## 💳 Payment Integration (Paystack)

### Payment Flow

1. **Customer creates order** → Order saved with status "pending"
2. **Initialize payment** → `POST /payments/initialize`
3. **Redirect to Paystack** → Customer pays on Paystack checkout page
4. **Paystack redirects back** → `GET /payment/callback?reference=xxx`
5. **Verify payment** → Backend verifies with Paystack API
6. **Update order** → Status changes to "processing"

### Test Cards

**Success:**
```
Card Number: 4084 0840 8408 4081
CVV: 123
Expiry: 12/25
PIN: 1234
```

**Declined:**
```
Card Number: 4084 0800 0000 0408
```

### Webhook Setup (Optional)

Configure webhook URL in Paystack dashboard:
```
https://your-domain.com/payment/webhook
```

---

## 📧 Email Service (Brevo)

### Email Types

1. **Welcome Email** - Sent on user registration
2. **Order Confirmation** - Sent after order creation

### Email Template Structure

**Black & White Theme** (no purple, no gradients)

```html
<html>
  <body style="background-color: #ffffff; color: #000000;">
    <div style="max-width: 600px; margin: 0 auto;">
      <h1 style="color: #000000;">Welcome to BeBrand!</h1>
      <p>Thank you for joining us...</p>
    </div>
  </body>
</html>
```

### Sender Configuration

**Verified Sender:**
- Email: `ogunseitangold105@gmail.com`
- Name: `BeBrand`

### Email Delivery Status

Check via Brevo API:
```bash
GET https://api.brevo.com/v3/smtp/statistics/events
```

---

## 🎨 Frontend Integration

### Design System

**Colors:**
- Primary: Brown (#8B6F47)
- Background: Cream (#F5E6D3)
- Text: Black (#000000)
- White: #FFFFFF

### API Integration Example

```javascript
// Fetch products
const products = await fetch('https://bebrand-eoo2.onrender.com/products')
  .then(res => res.json());

// Create guest order
const order = await fetch('https://bebrand-eoo2.onrender.com/orders/guest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{ productId: '123', quantity: 2 }],
    customerEmail: 'customer@example.com',
    customerFirstName: 'Jane',
    customerLastName: 'Doe',
    shippingAddress: { /* ... */ },
    guestInfo: { /* ... */ }
  })
}).then(res => res.json());

// Initialize payment
const payment = await fetch('https://bebrand-eoo2.onrender.com/payments/initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: order._id,
    email: 'customer@example.com'
  })
}).then(res => res.json());

// Redirect to Paystack
window.location.href = payment.data.authorization_url;
```

---

## 👨‍💼 Admin Features

### Dashboard Analytics
- Total Revenue with growth percentage
- Total Orders with growth percentage
- New Customers with growth percentage
- Products in Stock count
- Revenue Overview Chart (line graph)
- Order Status Distribution (donut chart)
- Recent Activity table

**API Endpoint:**
```bash
GET /admin/dashboard
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "message": "Welcome to the admin dashboard",
  "admin": {
    "userId": "65abc123...",
    "email": "admin@bebrand.com"
  },
  "stats": {
    "totalUsers": 247,
    "totalOrders": 1560,
    "totalRevenue": 125450.00,
    "pendingOrders": 45,
    "processingOrders": 120,
    "shippedOrders": 340,
    "deliveredOrders": 980
  },
  "recentUsers": [...]
}
```

### Order Management

#### Get All Orders with Filtering
```bash
GET /admin/orders?page=1&limit=10&status=pending&startDate=2024-01-01&endDate=2024-12-31&search=customer@example.com
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by order status (pending, processing, shipped, delivered, cancelled)
- `startDate` (optional): Filter orders from date (ISO 8601 format)
- `endDate` (optional): Filter orders until date (ISO 8601 format)
- `search` (optional): Search by customer email or order ID

**Response:**
```json
{
  "orders": [
    {
      "_id": "69014865...",
      "userId": null,
      "items": [...],
      "totalAmount": 249.99,
      "status": "pending",
      "paymentStatus": "pending",
      "guestInfo": {
        "email": "customer@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "shippingAddress": {...},
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 1560,
    "page": 1,
    "limit": 10,
    "pages": 156
  }
}
```

#### Export Orders to CSV
```bash
GET /admin/orders/export/csv?status=delivered&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "data": "Order ID,Customer Name,Customer Email,Phone,Status,Total Amount,Payment Status,Items Count,Shipping Address,Created At\n\"69014865...\",\"John Doe\",\"customer@example.com\",\"+2348012345678\",\"delivered\",\"249.99\",\"paid\",\"2\",\"123 Main St, Lagos, Lagos State, Nigeria\",\"2024-01-15T10:30:00.000Z\"\n...",
  "filename": "orders_export_2024-01-15.csv",
  "contentType": "text/csv"
}
```

**JavaScript Example:**
```javascript
// Fetch CSV data
const response = await fetch('https://bebrand-eoo2.onrender.com/admin/orders/export/csv?status=delivered', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const result = await response.json();

// Create download link
const blob = new Blob([result.data], { type: 'text/csv' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = result.filename;
a.click();
```

#### Update Order Status
```bash
PATCH /admin/orders/:orderId/status
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "status": "shipped"
}
```

### Product Management

Products now include automatic stock status calculation:
- **In Stock**: Stock quantity > 10
- **Low Stock**: Stock quantity 1-10
- **Out of Stock**: Stock quantity = 0

**Get Product with Stock Status:**
```bash
GET /products/:id
```

**Response:**
```json
{
  "_id": "69013fc3...",
  "name": "Nike Air Max 90",
  "price": 129.99,
  "stock": 5,
  "stockStatus": "low_stock",
  "category": "men",
  "subcategory": "shoes"
}
```

### User Management
- View all users with pagination
- Search users by email
- View user details with order history
- Delete users
- View total spending per user

```bash
GET /admin/users?page=1&limit=10
GET /admin/users/:userId
DELETE /admin/users/:userId
```

### Analytics Endpoints

#### Revenue Analytics
Get daily revenue data for last 30 days and revenue breakdown by order status.

```bash
GET /admin/analytics/revenue
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "dailyRevenue": [
    {
      "_id": "2024-01-01",
      "revenue": 5420.50,
      "orders": 15
    },
    {
      "_id": "2024-01-02",
      "revenue": 7830.25,
      "orders": 22
    }
  ],
  "revenueByStatus": [
    {
      "_id": "delivered",
      "revenue": 98450.00,
      "count": 980
    },
    {
      "_id": "processing",
      "revenue": 15600.00,
      "count": 120
    }
  ]
}
```

#### Order Analytics
Get order distribution by status and average order value.

```bash
GET /admin/analytics/orders
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "ordersByStatus": [
    { "_id": "pending", "count": 45 },
    { "_id": "processing", "count": 120 },
    { "_id": "shipped", "count": 340 },
    { "_id": "delivered", "count": 980 },
    { "_id": "cancelled", "count": 75 }
  ],
  "averageOrderValue": 80.42
}
```

**Chart.js Integration Example:**
```javascript
// Fetch revenue analytics
const revenueData = await fetch('https://bebrand-eoo2.onrender.com/admin/analytics/revenue', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
}).then(res => res.json());

// Create line chart for daily revenue
new Chart(document.getElementById('revenueChart'), {
  type: 'line',
  data: {
    labels: revenueData.dailyRevenue.map(d => d._id),
    datasets: [{
      label: 'Daily Revenue (₦)',
      data: revenueData.dailyRevenue.map(d => d.revenue),
      borderColor: '#8B6F47',
      backgroundColor: 'rgba(139, 111, 71, 0.1)',
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Revenue Overview' }
    }
  }
});

// Fetch order analytics
const orderData = await fetch('https://bebrand-eoo2.onrender.com/admin/analytics/orders', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
}).then(res => res.json());

// Create donut chart for order status distribution
new Chart(document.getElementById('orderStatusChart'), {
  type: 'doughnut',
  data: {
    labels: orderData.ordersByStatus.map(s => s._id),
    datasets: [{
      data: orderData.ordersByStatus.map(s => s.count),
      backgroundColor: ['#FFB84D', '#4DABF5', '#9B59B6', '#2ECC71', '#E74C3C']
    }]
  }
});
```

---

## 📰 Newsletter Subscription

### Subscribe to Newsletter
```bash
POST /newsletter/subscribe
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Successfully subscribed to newsletter",
  "subscription": {
    "_id": "65abc...",
    "email": "user@example.com",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Unsubscribe from Newsletter
```bash
DELETE /newsletter/unsubscribe
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Get All Subscribers (Admin Only)
```bash
GET /newsletter/subscribers?page=1&limit=50
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "subscribers": [
    {
      "_id": "65abc...",
      "email": "user@example.com",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "pages": 3
  }
}
```

**Frontend Integration Example:**
```javascript
// Newsletter signup form
document.getElementById('newsletter-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  
  try {
    const response = await fetch('https://bebrand-eoo2.onrender.com/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert('Successfully subscribed to newsletter!');
    } else if (response.status === 409) {
      alert('Email is already subscribed');
    }
  } catch (error) {
    alert('Failed to subscribe. Please try again.');
  }
});
```

---

## 🚀 Deployment

### Render.com Deployment

1. **Connect GitHub repository**
2. **Configure build settings:**
```yaml
buildCommand: npm install && npm run build
startCommand: npm run start:prod
```

3. **Add environment variables:**
- `MONGODB_URI`
- `JWT_SECRET`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `FRONTEND_URL`
- `BACKEND_URL`

### Database Backup

```bash
# Backup
mongodump --uri="mongodb+srv://..." --out=./backup

# Restore
mongorestore --uri="mongodb+srv://..." ./backup
```

---

## 📊 Performance & Optimization

### Caching Strategy
- Product list caching (Redis recommended for production)
- JWT token caching
- Static asset caching

### Database Indexes
```javascript
// User email index
userSchema.index({ email: 1 }, { unique: true });

// Product category index
productSchema.index({ category: 1, subcategory: 1 });

// Order status index
orderSchema.index({ status: 1, createdAt: -1 });
```

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Password Hashing**: Uses bcrypt with salt rounds
3. **JWT Secrets**: Use strong random strings (256-bit)
4. **CORS Configuration**: Whitelist only trusted origins
5. **Rate Limiting**: Implement rate limiting for production
6. **Input Validation**: All DTOs use class-validator
7. **SQL Injection**: Mongoose provides protection
8. **XSS Protection**: Sanitize user inputs

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📝 API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { /* ... */ }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message or array of validation errors",
  "error": "Bad Request"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support & Contact

- **GitHub**: [@Goldexcool](https://github.com/Goldexcool)
- **Email**: ogunseitangold105@gmail.com
- **API Documentation**: https://bebrand-eoo2.onrender.com/api/docs

---

## 🎯 Roadmap

### Phase 1 (Completed) ✅
- User authentication
- Product management
- Order processing
- Payment integration
- Email notifications

### Phase 2 (In Progress) 🚧
- Advanced filtering and search
- Order tracking
- Wishlist functionality
- Product reviews and ratings
- Newsletter subscription

### Phase 3 (Planned) 📋
- Multi-currency support
- Advanced analytics
- Inventory management
- Coupon/discount system
- Mobile app API enhancements
