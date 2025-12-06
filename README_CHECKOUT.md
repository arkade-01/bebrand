# 🛒 BeBrand Checkout & Payment System

## Quick Links

- 📖 [Complete Flow Documentation](./CHECKOUT_PAYMENT_FLOW.md)
- 🚀 [Quick Start Guide](./CHECKOUT_PAYMENT_GUIDE.md)
- 🎨 [Frontend Implementation](./FRONTEND_IMPLEMENTATION_GUIDE.md)

---

## 🎯 What's Included

### Frontend Files
- ✅ `checkout.html` - Complete checkout page with payment integration
- ✅ `payment-callback.html` - Payment callback handler

### Backend Endpoints
- ✅ `POST /orders/guest` - Create guest order
- ✅ `POST /payments/initialize` - Initialize Paystack payment
- ✅ `POST /payments/verify` - Verify payment
- ✅ `GET /payment/callback` - Paystack callback handler

### Features
- ✅ Guest checkout (no account required)
- ✅ Paystack payment integration
- ✅ Automatic order status updates
- ✅ Email notifications
- ✅ Payment record storage
- ✅ Error handling

---

## 🚀 Quick Start

1. **Start your backend:**
   ```bash
   npm run start:dev
   ```

2. **Open checkout page:**
   - Open `checkout.html` in your browser
   - Or serve with: `npx http-server -p 8000`

3. **Test the flow:**
   - Fill in customer information
   - Create order
   - Complete payment with test card: `4084 0840 8408 4081`

---

## 📚 Documentation

See [CHECKOUT_PAYMENT_FLOW.md](./CHECKOUT_PAYMENT_FLOW.md) for complete documentation.

---

## 🔧 Configuration

Update API base URL in HTML files:
```javascript
const API_BASE = 'http://localhost:3000'; // Development
// const API_BASE = 'https://bebrand-eoo2.onrender.com'; // Production
```

---

## ✅ Status

**All features are production-ready!** 🎉
