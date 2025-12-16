# LocalLens Backend

A comprehensive tour booking and management system backend API built with Node.js, Express, TypeScript, and MongoDB. LocalLens connects tourists with local guides, enabling seamless tour discovery, booking, and payment processing.

## 📋 Short Description

LocalLens Backend is a RESTful API server that powers a tourism platform where local guides can create and manage tour listings, tourists can discover and book tours, and administrators can oversee the entire system. The backend handles authentication, tour management, booking workflows, payment processing, reviews, and wishlist functionality with role-based access control.

## 🌐 Live URLs

- **Backend API**: [https://local-lens-backend.vercel.app/](https://local-lens-backend.vercel.app/)
- **Frontend Application**: [https://local-lens-frontend.vercel.app/](https://local-lens-frontend.vercel.app/)

## 🚀 Key Features

- **Multi-Role User Management**: Support for Tourists, Guides, and Admins with role-specific features
- **Tour Management System**: Complete CRUD operations for tours with image uploads, categorization, and availability management
- **Booking & Payment System**: Full booking workflow with SSL Commerz payment gateway integration
- **Review & Rating System**: Post-tour review functionality with rating aggregation
- **Wishlist Management**: Save and manage favorite tours
- **Authentication & Security**: JWT-based authentication with refresh tokens and role-based access control
- **File Management**: Cloudinary integration for image storage and optimization
- **Search & Filtering**: Advanced tour search with multiple filter options

## 🛠️ Technology Stack

### **Backend Framework**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety and developer experience

### **Database & ODM**
- **MongoDB** - Primary database
- **Mongoose** - Object Document Mapping

### **Authentication & Security**
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### **Validation & Type Safety**
- **Zod** - Schema validation
- **TypeScript** - Static type checking

### **File Storage & Processing**
- **Cloudinary** - Image storage and optimization
- **Multer** - File upload middleware

### **Payment Processing**
- **SSL Commerce** - Payment gateway integration
- **Axios** - HTTP client for API calls

### **Development Tools**
- **ts-node-dev** - Development server with hot reload
- **ESLint** - Code linting
- **Vercel** - Deployment platform

## 📍 API Routes

Base URL: `/api/v1`

### **Authentication Routes** (`/auth`)
- `POST /auth/login` - User login
- `GET /auth/getMe` - Get current user (Protected)
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/logout` - User logout
- `POST /auth/change-password` - Change password (Protected)

### **User Routes** (`/user`)
- `GET /user/enums` - Get user roles and statuses (Public)
- `POST /user/register` - User registration
- `GET /user/profile/:id` - Get public user profile
- `GET /user/profile` - Get own profile (Protected)
- `PATCH /user/profile` - Update own profile (Protected)
- `GET /user/admin/all` - Get all users (Admin)
- `GET /user/admin/role/:role` - Get users by role (Admin)
- `PATCH /user/admin/:id` - Update user (Admin)
- `DELETE /user/admin/:id` - Delete user (Admin)

### **Tour Routes** (`/tour`)
- `GET /tour` - Get all active tours (Public)
- `GET /tour/enums` - Get tour categories and statuses (Public)
- `GET /tour/debug` - Debug: Get all tours with status info (Public)
- `GET /tour/search` - Search tours with filters (Public)
- `GET /tour/:slug` - Get tour by slug (Public)
- `GET /tour/details/:id` - Get tour by ID (Public)
- `GET /tour/my-tours` - Get user's tours/bookings (All authenticated users)
- `GET /tour/guide/my-tours` - Get guide's tours (Guide only)
- `POST /tour` - Create new tour (Guide/Admin)
- `PATCH /tour/:id` - Update tour (Guide/Admin)
- `DELETE /tour/:id` - Delete tour (Guide/Admin)
- `GET /tour/admin/all` - Get all tours for admin (Admin)

### **Wishlist Routes** (`/wishlist`)
- `GET /wishlist` - Get user's wishlist (Tourist only)
- `POST /wishlist` - Add tour to wishlist (Tourist only)
- `DELETE /wishlist/:tourId` - Remove tour from wishlist (Tourist only)
- `GET /wishlist/check/:tourId` - Check if tour is in wishlist (Tourist only)

### **Booking Routes** (`/booking`)
- `POST /booking` - Create booking (Tourist only)
- `GET /booking/my-bookings` - Get tourist's bookings (Tourist only)
- `POST /booking/:id/payment` - Initiate payment for completed booking (Tourist only)
- `GET /booking/guide/pending` - Get guide's pending bookings (Guide only)
- `GET /booking/guide/upcoming` - Get guide's upcoming bookings (Guide only)
- `GET /booking/guide/all` - Get all guide's bookings (Guide only)
- `PATCH /booking/:id/status` - Update booking status (Guide/Admin)
- `GET /booking/:id` - Get booking by ID (All authenticated users)
- `GET /booking/admin/all` - Get all bookings (Admin only)

### **Payment Routes** (`/payment`)
- `GET /payment/success` - Payment success callback (SSL Commerz)
- `POST /payment/success` - Payment success callback (SSL Commerz)
- `GET /payment/fail` - Payment fail callback (SSL Commerz)
- `POST /payment/fail` - Payment fail callback (SSL Commerz)
- `GET /payment/cancel` - Payment cancel callback (SSL Commerz)
- `POST /payment/cancel` - Payment cancel callback (SSL Commerz)

### **Review Routes** (`/review`)
- `POST /review` - Create review (Tourist only)
- `PATCH /review/:id` - Update review (Tourist only)
- `DELETE /review/:id` - Delete review (Tourist only)
- `GET /review/tour/:tourId` - Get reviews for a tour (Public)
- `GET /review/guide/:guideId` - Get reviews for a guide (Public)
- `GET /review/user/:userId` - Get reviews by a user (Public)
- `GET /review/admin/all` - Get all reviews (Admin only)
- `DELETE /review/admin/:id` - Delete any review (Admin only)

## 🏗️ Project Architecture

### **Clean Architecture Pattern**
The project follows a **modular monolithic architecture** with clear separation of concerns:

```
src/
├── app/
│   ├── config/           # Configuration files (env, cloudinary, multer)
│   ├── interface/        # Global TypeScript interfaces
│   ├── lib/              # External library connections (MongoDB)
│   ├── middleware/       # Express middlewares (auth, validation, error handling)
│   ├── modules/          # Feature-based modules
│   │   ├── auth/         # Authentication & authorization
│   │   ├── booking/      # Tour booking management
│   │   ├── payment/      # Payment processing
│   │   ├── review/       # Review and rating system
│   │   ├── sslCommerz/   # SSL Commerce payment gateway
│   │   ├── tour/         # Tour management
│   │   ├── users/        # User management (tourists, guides, admin)
│   │   └── wishlist/     # Wishlist management
│   ├── routes.ts         # Central route configuration
│   └── utils/            # Utility functions
├── app.ts               # Express application setup
└── server.ts           # Server initialization
```

### **Module Structure Pattern**
Each module follows a consistent structure:
- `*.interface.ts` - TypeScript interfaces and enums
- `*.model.ts` - Mongoose schemas and models
- `*.validation.ts` - Zod validation schemas
- `*.service.ts` - Business logic layer
- `*.controller.ts` - Request/response handling
- `*.routes.ts` - Route definitions

## 📋 Environment Configuration

The application requires comprehensive environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CORS_FRONTEND_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/locallens

# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES=7d
BCRYPT_SALT_ROUND=12

# Admin Seeding
ADMIN_EMAIL=admin@locallens.com
ADMIN_PASSWORD=admin123

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SSL Commerce Payment Gateway
SSL_STORE_ID=your_store_id
SSL_STORE_PASS=your_store_password
SSL_PAYMENT_API=https://sandbox.sslcommerz.com/gwprocess/v4/api.php
SSL_VALIDATION_API=https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
SSL_IPN_URL=your_ipn_url
SSL_SUCCESS_BACKEND_URL=your_success_url
SSL_FAIL_BACKEND_URL=your_fail_url
SSL_CANCEL_BACKEND_URL=your_cancel_url
SSL_SUCCESS_FRONTEND_URL=your_frontend_success_url
SSL_FAIL_FRONTEND_URL=your_frontend_fail_url
SSL_CANCEL_FRONTEND_URL=your_frontend_cancel_url
```

## 🚀 Getting Started

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd localLens-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### **Available Scripts**
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm run lint     # Run ESLint for code quality
npm run deploy   # Build and deploy to Vercel
```

## 🔗 Related Repositories

**Frontend Application**: [`~/Documents/workspace/level-2/local-lens-frontend`](~/Documents/workspace/level-2/local-lens-frontend)
- React/Next.js frontend application
- Consumes this backend API
- Handles user interface and client-side interactions

## 📝 Summary

LocalLens Backend demonstrates a **well-structured, scalable Node.js application** with:

- **Clean Architecture**: Modular design with clear separation of concerns
- **Type Safety**: Comprehensive TypeScript implementation
- **Security First**: JWT authentication, role-based access, input validation
- **Production Ready**: Error handling, logging, graceful shutdowns
- **Modern Stack**: Latest technologies and best practices
- **Maintainable Code**: Consistent patterns and organized structure
- **Frontend Integration**: Seamlessly works with the LocalLens frontend application

The project showcases professional backend development practices suitable for production environments, with comprehensive feature coverage for a tour booking platform.
