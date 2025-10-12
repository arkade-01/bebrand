# 🛍️ BeBrand E-commerce API

A production-ready NestJS e-commerce backend API with JWT authentication, MongoDB database, and automatic Swagger documentation.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run start:dev
```

### Production Build
```bash
npm run build
npm run start:prod
```

## 📚 API Documentation

### Local Development
```
http://localhost:3000/api/docs
```

### Production (Render)
```
https://your-app-name.onrender.com/api/docs
```

Replace `your-app-name` with your Render service name.

## ✨ Features

- ✅ **JWT Authentication** - Secure user authentication with JWT tokens
- ✅ **MongoDB Database** - Mongoose ODM with MongoDB Atlas
- ✅ **Swagger Documentation** - Auto-generated interactive API docs
- ✅ **User Management** - Register, login, profile management
- ✅ **Product Management** - Full CRUD operations for products
- ✅ **Order Management** - Complete order system with status tracking
- ✅ **Input Validation** - Request validation with class-validator
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **CORS Enabled** - Ready for frontend integration
- ✅ **Production Ready** - Configured for Render deployment

## 🔐 Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-generated-jwt-secret
JWT_EXPIRATION=7d
MONGODB_URI=your-mongodb-connection-string
```

## 🚢 Deployment on Render

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick:** After deployment, your Swagger docs will be at:
```
https://your-app-name.onrender.com/api/docs
```

## 📖 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Detailed API guide
- [Deployment Guide](./DEPLOYMENT.md) - Render deployment instructions
- [Setup Complete](./SETUP_COMPLETE.md) - Configuration summary

## 🛠️ Available Scripts

```bash
npm run start:dev      # Development with hot-reload
npm run build          # Build for production
npm run start:prod     # Start production server
npm run lint           # Lint and fix code
npm run test           # Run tests
```

---

**Built with ❤️ using NestJS, MongoDB, and TypeScript**
