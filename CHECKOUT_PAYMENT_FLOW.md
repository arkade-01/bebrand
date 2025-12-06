# 🛒 Complete Checkout & Payment Flow Documentation

## 📋 Overview

This document describes the complete checkout and payment flow implementation for BeBrand e-commerce platform. The system supports both **guest checkout** (no account required) and **authenticated user checkout** with Paystack payment integration.

---

## 🏗️ Architecture

### Flow Diagram

```
┌─────────────┐
│   Customer  │
│  Browses    │
│  Products   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Add to     │
│  Cart       │
└──────┬──────┘
       │
       ▼
┌─────────────┐      POST /orders/guest
│  Checkout   │ ──────────────────────► Create Order
│  Form       │
└──────┬──────┘
       │
       ▼
┌─────────────┐      POST /payments/initialize
│  Initialize │ ──────────────────────► Get Paystack URL
│  Payment    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Redirect   │
│  to Paystack│
└──────┬──────┘
       │
       ▼
┌─────────────┐      Customer Pays
│   Paystack  │ ◄──────────────────────
│  Checkout   │
└──────┬──────┘
       │
       ▼
┌─────────────┐      GET /payment/callback?reference=xxx
│  Callback   │ ◄────────────────────── Paystack Redirects
│  Handler    │
└──────┬──────┘
       │
       ▼
┌─────────────┐      POST /payments/verify
│  Verify     │ ──────────────────────► Verify Payment
│  Payment    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Order      │
│  Confirmed  │
└─────────────┘
```

---

## 🔄 Complete Flow Steps

### Step 1: Create Order

**Endpoint:** `POST /orders/guest`

**Purpose:** Create an order without requiring user authentication (guest checkout).

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
  "customerFirstName": "John",
  "customerLastName": "Doe",
  "customerPhone": "+234 800 000 0000",
  "shippingAddress": {
    "address": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos",
    "zipCode": "100001",
    "country": "Nigeria"
  },
  "notes": "Optional delivery instructions"
}
```

**Response:**
```json
{
  "message": "Guest order created successfully",
  "order": {
    "_id": "6934724868ba8a98a72ffebf",
    "items": [...],
    "totalAmount": 299.99,
    "status": "pending",
    "isGuestOrder": true,
    "customerEmail": "customer@example.com",
    "createdAt": "2025-12-06T18:01:59.724Z"
  }
}
```

**What Happens:**
- ✅ Validates product IDs and stock availability
- ✅ Calculates total amount from product prices
- ✅ Creates order with status "pending"
- ✅ Reduces product stock
- ✅ Sends order confirmation email

---

### Step 2: Initialize Payment

**Endpoint:** `POST /payments/initialize`

**Purpose:** Initialize a Paystack payment session and get authorization URL.

**Request Body:**
```json
{
  "orderId": "6934724868ba8a98a72ffebf",
  "amount": 299.99,
  "email": "customer@example.com"
}
```

**Response:**
```json
{
  "message": "Payment initialized successfully",
  "payment": {
    "id": "payment_id",
    "reference": "ref_1234567890_abc123",
    "amount": 299.99,
    "authorizationUrl": "https://checkout.paystack.com/xxx",
    "accessCode": "access_code_xxx"
  }
}
```

**What Happens:**
- ✅ Generates unique payment reference
- ✅ Converts amount from Naira to Kobo (Paystack requirement)
- ✅ Calls Paystack API to initialize transaction
- ✅ Saves payment record in database
- ✅ Returns authorization URL for customer

---

### Step 3: Redirect to Paystack

**Action:** Redirect customer to `authorizationUrl` from Step 2.

**Implementation:**
```javascript
window.location.href = payment.authorizationUrl;
// Or open in new window:
window.open(payment.authorizationUrl, 'Paystack Payment', 'width=600,height=700');
```

**What Happens:**
- Customer sees Paystack checkout page
- Enters payment details (card, bank, etc.)
- Completes payment
- Paystack redirects back to callback URL

---

### Step 4: Payment Callback

**Endpoint:** `GET /payment/callback?reference=xxx`

**Purpose:** Handle Paystack redirect after payment completion.

**What Happens:**
- ✅ Paystack redirects to this endpoint with payment reference
- ✅ Backend verifies payment with Paystack API
- ✅ Updates payment status in database
- ✅ Updates order status to "processing" if payment successful
- ✅ Returns success/failure response

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment successful! Your order is being processed.",
  "orderId": "6934724868ba8a98a72ffebf",
  "reference": "ref_1234567890_abc123",
  "amount": 299.99,
  "paidAt": "2025-12-06T18:05:30.000Z"
}
```

**Frontend Handling:**
- Implement your own callback page (e.g., `order-success.html`)
- Backend callback at `/payment/callback` handles verification automatically
- Display success/failure message to user
- Show order confirmation details

---

### Step 5: Verify Payment

**Endpoint:** `POST /payments/verify`

**Purpose:** Manually verify payment status (optional, for frontend verification).

**Request Body:**
```json
{
  "reference": "ref_1234567890_abc123"
}
```

**Response:**
```json
{
  "message": "Payment verified successfully",
  "payment": {
    "id": "payment_id",
    "reference": "ref_1234567890_abc123",
    "amount": 299.99,
    "status": "success",
    "paidAt": "2025-12-06T18:05:30.000Z",
    "channel": "card"
  }
}
```

---

## 📁 Frontend Files

### 1. `checkout.html`

Complete checkout page with:
- ✅ Customer information form
- ✅ Shipping address form
- ✅ Order summary with cart items
- ✅ Payment initialization
- ✅ Step-by-step progress indicator
- ✅ Error handling and loading states

**Features:**
- Guest checkout support
- Real-time cart display
- Form validation
- Responsive design
- Test card information display

**API Configuration:**
```javascript
const API_BASE = 'http://localhost:3000'; // Change for production
```

---

### 2. Payment Callback Handling

**Backend Callback:**
- Paystack redirects to: `GET /payment/callback?reference=xxx`
- Backend automatically verifies payment
- Updates order status to "processing" if successful

**Frontend Implementation:**
- Create your own callback page in your frontend framework
- Handle the redirect from Paystack
- Display success/failure message
- Show order confirmation details

---

## 🔧 Backend Implementation

### Key Components

#### 1. Orders Service (`src/orders/orders.service.ts`)

**Methods:**
- `createGuestOrder()` - Creates order without authentication
- `create()` - Creates order for authenticated users
- `update()` - Updates order status

**Features:**
- Stock validation
- Automatic stock reduction
- Email notifications
- Guest order support

#### 2. Payments Service (`src/payments/payments.service.ts`)

**Methods:**
- `initializePayment()` - Initialize Paystack payment
- `verifyPayment()` - Verify payment with Paystack
- `getUserPayments()` - Get user's payment history

**Features:**
- Paystack API integration
- Payment record storage
- Guest payment support
- Error handling

#### 3. Payment Controller (`src/payment/payment.controller.ts`)

**Endpoints:**
- `POST /payment/initialize` - Initialize payment
- `GET /payment/callback` - Paystack callback handler
- `GET /payment/verify/:reference` - Verify payment

---

## 🔐 Authentication & Authorization

### Public Endpoints (No Auth Required)

- ✅ `POST /orders/guest` - Create guest order
- ✅ `POST /payments/initialize` - Initialize payment
- ✅ `POST /payments/verify` - Verify payment
- ✅ `GET /payment/callback` - Payment callback
- ✅ `GET /products` - Get products

### Authenticated Endpoints

- 🔒 `GET /orders` - Get user's orders
- 🔒 `GET /payments/my-payments` - Get user's payments
- 🔒 `GET /orders/:id` - Get order details

### Admin Endpoints

- 🔒 `GET /admin/orders` - Get all orders
- 🔒 `GET /admin/payments/all` - Get all payments
- 🔒 `GET /admin/analytics/*` - Analytics endpoints

---

## 💳 Paystack Integration

### Configuration

**Environment Variables:**
```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_CALLBACK_URL=http://localhost:3000/payment/callback
```

### Test Cards

**Success Card:**
- Card Number: `4084 0840 8408 4081`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- PIN: `0000`

**Declined Card:**
- Card Number: `4084 0800 0000 0408`

### Amount Conversion

Paystack requires amounts in **Kobo** (smallest currency unit):
- ₦1,000 = 100,000 Kobo
- Conversion: `amountInKobo = amountInNaira * 100`

---

## 🗄️ Database Schema

### Order Schema

```typescript
{
  _id: ObjectId,
  userId?: ObjectId,           // Optional (for guest orders)
  items: OrderItem[],
  totalAmount: number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  paymentStatus: 'pending' | 'success' | 'failed',
  customerEmail: string,
  customerFirstName: string,
  customerLastName: string,
  customerPhone: string,
  shippingAddress: ShippingAddress,
  isGuestOrder: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Schema

```typescript
{
  _id: ObjectId,
  userId?: string,             // Optional (for guest payments)
  orderId: string,
  amount: number,
  email: string,
  reference: string,           // Unique payment reference
  status: 'pending' | 'success' | 'failed' | 'abandoned',
  paystackReference: string,
  authorizationUrl: string,
  accessCode: string,
  paidAt?: Date,
  channel?: string,
  currency: 'NGN',
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚨 Error Handling

### Common Errors

**1. Missing Paystack Key**
```json
{
  "statusCode": 500,
  "message": "Paystack is not configured. Please set PAYSTACK_SECRET_KEY in environment variables."
}
```

**2. Insufficient Stock**
```json
{
  "statusCode": 400,
  "message": "Insufficient stock for product Nike Air Max 90. Available: 5, Requested: 10"
}
```

**3. Invalid Product ID**
```json
{
  "statusCode": 400,
  "message": "Product with ID 123 not found"
}
```

**4. Payment Verification Failed**
```json
{
  "statusCode": 400,
  "message": "Payment verification failed"
}
```

---

## ✅ Testing Checklist

- [ ] Create guest order successfully
- [ ] Initialize payment and get authorization URL
- [ ] Complete payment on Paystack with test card
- [ ] Verify payment callback works
- [ ] Check order status updates to "processing"
- [ ] Verify payment record in database
- [ ] Test error handling (insufficient stock, invalid product, etc.)
- [ ] Test with authenticated user
- [ ] Test payment verification endpoint
- [ ] Test order confirmation email

---

## 🚀 Deployment

### Environment Variables

**Required:**
```env
MONGODB_URI=your_mongodb_uri
PAYSTACK_SECRET_KEY=sk_live_your_live_key
PAYSTACK_PUBLIC_KEY=pk_live_your_live_key
PAYSTACK_CALLBACK_URL=https://yourdomain.com/payment/callback
```

### Paystack Configuration

1. **Update Callback URL** in Paystack Dashboard:
   - Production: `https://yourdomain.com/payment/callback`
   - Development: `http://localhost:3000/payment/callback`

2. **Switch to Live Keys** in production:
   - Replace test keys with live keys
   - Update `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY`

3. **Update Frontend API URL:**
   ```javascript
   const API_BASE = 'https://yourdomain.com'; // Production
   ```

---

## 📚 Related Documentation

- [Frontend Implementation Guide](./FRONTEND_IMPLEMENTATION_GUIDE.md)
- [API Documentation](./DOCUMENTATION.md)

---

## 🎯 Summary

The checkout and payment flow is fully implemented with:

✅ **Guest Checkout** - No account required  
✅ **Paystack Integration** - Secure payment processing  
✅ **Order Management** - Automatic status updates  
✅ **Email Notifications** - Order confirmations  
✅ **Error Handling** - Comprehensive error messages  
✅ **Database Storage** - Payment and order records  
✅ **Frontend Pages** - Complete checkout UI  

**All features are production-ready!** 🎉
