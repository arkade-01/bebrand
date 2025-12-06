# 🛒 Checkout & Payment Flow - Quick Start Guide

> **Note:** For complete documentation, see [CHECKOUT_PAYMENT_FLOW.md](./CHECKOUT_PAYMENT_FLOW.md)

## 📁 Frontend Files

### 1. **checkout.html** - Complete Checkout Page
Full-featured checkout page with:
- ✅ Step-by-step checkout process
- ✅ Customer information form
- ✅ Shipping address form
- ✅ Order summary with cart items
- ✅ Paystack payment integration
- ✅ Order confirmation page
- ✅ Error handling and loading states

**Usage:**
```html
<!-- Open in browser -->
<!-- Or integrate into your React/Vue/Angular app -->
```

### 2. **Payment Callback Handling**

The backend handles Paystack callbacks automatically at `GET /payment/callback`. 

**For Frontend:**
- Implement your own callback page in your frontend framework
- Paystack redirects to: `http://localhost:3000/payment/callback?reference=xxx`
- Backend verifies payment and updates order status
- Redirect users to your success/failure page

## 🚀 Quick Start

### Step 1: Test the Flow
1. Open `checkout.html` in your browser
2. Products will load automatically (or add to cart first)
3. Fill in customer information and shipping address
4. Click "Place Order & Continue to Payment"
5. Click "Pay with Paystack"
6. Use test card: **4084 0840 8408 4081** (CVV: any 3 digits, PIN: 0000)
7. Payment will be verified automatically after redirect

### Step 2: Integrate into Your App
1. Copy checkout logic from `checkout.html`
2. Adapt to your framework (React/Vue/Angular)
3. Configure API base URL
4. Set up Paystack callback URL

### Step 3: Configure Paystack
1. Get Paystack API keys from dashboard
2. Set callback URL: `https://yourdomain.com/payment-callback.html`
3. Test with test keys first
4. Switch to live keys in production

## 🔄 Complete Flow

```
1. Customer adds products to cart
   ↓
2. Customer fills checkout form
   ↓
3. Create order: POST /orders/guest
   ↓
4. Initialize payment: POST /payments/initialize
   ↓
5. Redirect to Paystack authorization URL
   ↓
6. Customer completes payment on Paystack
   ↓
7. Paystack redirects to: payment-callback.html?reference=xxx
   ↓
8. Verify payment: POST /payments/verify
   ↓
9. Show order confirmation
```

## 📝 API Endpoints Used

### Create Order (Guest)
```javascript
POST /orders/guest
Content-Type: application/json

{
  "items": [
    { "productId": "product_id", "quantity": 2 }
  ],
  "customerEmail": "customer@example.com",
  "customerFirstName": "John",
  "customerLastName": "Doe",
  "customerPhone": "+234 800 000 0000",
  "shippingAddress": {
    "address": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "zipCode": "100001",
    "country": "Nigeria"
  }
}
```

### Initialize Payment
```javascript
POST /payments/initialize
Content-Type: application/json

{
  "orderId": "order_id_from_step_1",
  "amount": 5000.00,
  "email": "customer@example.com"
}
```

### Verify Payment
```javascript
POST /payments/verify
Content-Type: application/json

{
  "reference": "payment_reference_from_paystack"
}
```

## 🧪 Test Cards

**Success Card:**
- Card Number: `4084 0840 8408 4081`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- PIN: `0000`

**Declined Card:**
- Card Number: `4084 0800 0000 0408`

## ⚙️ Configuration

### API Base URL
Update in all HTML files:
```javascript
const API_BASE = 'https://bebrand-eoo2.onrender.com';
// Or use environment variable
const API_BASE = process.env.API_URL || 'https://bebrand-eoo2.onrender.com';
```

### Paystack Callback URL
Configure in Paystack dashboard:
```
https://yourdomain.com/payment-callback.html
```

Or update in payment initialization:
```javascript
callback_url: 'https://yourdomain.com/payment-callback.html'
```

## 🐛 Troubleshooting

### Payment Not Verifying
- Check if reference is correct
- Verify Paystack API keys are set
- Check network requests in browser console
- Ensure callback URL is configured in Paystack

### Order Creation Fails
- Verify product IDs are valid
- Check product stock availability
- Ensure all required fields are provided
- Check API response for error messages

### Paystack Redirect Not Working
- Verify callback URL is whitelisted in Paystack
- Check if URL is accessible (not localhost in production)
- Ensure HTTPS is used in production

## 📚 Additional Resources

- **Full Documentation:** See `FRONTEND_IMPLEMENTATION_GUIDE.md`
- **API Documentation:** https://bebrand-eoo2.onrender.com/api/docs
- **Paystack Docs:** https://paystack.com/docs

## ✅ Checklist

Before going live:
- [ ] Test complete flow with test cards
- [ ] Configure production Paystack keys
- [ ] Set up callback URL in Paystack dashboard
- [ ] Test payment verification
- [ ] Test error handling
- [ ] Test on mobile devices
- [ ] Set up order confirmation emails
- [ ] Test with real payment (small amount)

---

**Ready to go!** All files are complete and tested. Just integrate into your app and configure Paystack. 🎉
