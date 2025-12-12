# LocalLens Backend

A comprehensive tour booking and management system built with Node.js, Express, TypeScript, and MongoDB. LocalLens connects tourists with local guides, enabling seamless tour discovery, booking, and payment processing.

## 🔗 Related Repositories

**Frontend Application**: [`~/Documents/workspace/level-2/local-lens-frontend`](~/Documents/workspace/level-2/local-lens-frontend)
- React/Next.js frontend application
- Consumes this backend API
- Handles user interface and client-side interactions

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
│   │   ├── booking/      # Tour booking management (Enhanced)
│   │   ├── payment/      # Payment processing
│   │   ├── review/       # Review and rating system (New)
│   │   ├── sslCommerz/   # SSL Commerce payment gateway
│   │   ├── tour/         # Tour management (Enhanced)
│   │   └── users/        # User management (Enhanced - tourists, guides, admin)
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

## 🚀 Key Features

### **1. Enhanced Multi-Role User Management**
- **Tourists**: Browse tours, make bookings, write reviews, manage trips
- **Guides**: Create/manage tour listings, handle bookings, track revenue
- **Admins**: Complete system administration, user management, content moderation

### **2. Advanced Tour Management System**
- Dynamic tour creation with detailed itineraries and scheduling
- Enhanced tour categorization and filtering
- Image upload via Cloudinary integration
- Slug-based tour URLs for SEO optimization
- Tour availability calendar with time slots
- Comprehensive tour details (highlights, inclusions, policies)

### **3. Complete Booking & Payment System**
- Full booking workflow with multiple status states
- SSL Commerce payment gateway integration
- Guest management and special requests
- Automated booking confirmations and status updates
- Revenue tracking and analytics

### **4. Review & Rating System (New)**
- Tourist review submission for completed tours
- Guide rating and feedback system
- Review moderation and helpful voting
- Aggregate rating calculations
- Review-based tour recommendations

### **4. Authentication & Security**
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Secure cookie management

### **5. File Management**
- Cloudinary integration for image storage
- Buffer-based file uploads
- Automatic image optimization
- Image deletion management

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

## 📋 Environment Configuration

The application requires comprehensive environment variables for different services:

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

## 🏛️ Database Schema Design

### **User Schema**
```typescript
interface IUser {
  name: string;
  image: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  role: 'TOURIST' | 'GUIDE' | 'ADMIN';
  bio: string;
  language: string[];
  isActive: 'ACTIVE' | 'INACTIVE';
  isDeleted: boolean;
  isBlocked: boolean;
}
```

### **Tour Schema (Enhanced)**
```typescript
interface ITourListing {
  slug: string;
  guideId: ObjectId;
  title: string;
  description: string;
  longDescription?: string;
  itinerary: IItineraryItem[];
  tourFee: number;
  originalPrice?: number;
  maxDuration: number;
  meetingPoint: string;
  maxGroupSize: number;
  category: 'FOOD' | 'HISTORICAL' | 'ART' | 'NATURE' | 'ADVENTURE' | 'CULTURAL';
  location: string;
  images: string[];
  highlights: string[];
  included: string[];
  notIncluded: string[];
  importantInfo: string[];
  cancellationPolicy?: string;
  availableDates: IAvailableDate[];
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'SUSPENDED';
  rating?: number;
  reviewCount?: number;
  bookingCount?: number;
  active: boolean;
}
```

### **Booking Schema (Enhanced)**
```typescript
interface IBooking {
  userId: ObjectId;
  tourId: ObjectId;
  guideId: ObjectId;
  payment?: ObjectId;
  bookingDate: string;
  bookingTime: string;
  numberOfGuests: number;
  totalAmount: number;
  specialRequests?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'FAILED';
}
```

### **Review Schema (New)**
```typescript
interface IReview {
  userId: ObjectId;
  tourId: ObjectId;
  guideId: ObjectId;
  bookingId: ObjectId;
  rating: number;
  comment: string;
  helpful?: number;
}
```

### **Payment Schema**
```typescript
interface IPayment {
  bookingId: ObjectId;
  transactionId: string;
  amount: number;
  paymentGatewayData?: any;
  status: 'PAID' | 'UNPAID' | 'CANCELLED' | 'FAILED' | 'REFUNDED';
}
```

## 🔧 Code Quality & Standards

### **TypeScript Implementation**
- Strict type checking enabled
- Interface-driven development
- Comprehensive type definitions
- Generic utility functions

### **Error Handling Strategy**
- Global error handler middleware
- Consistent error response format
- Environment-specific error details
- Graceful server shutdown handling

### **Validation Approach**
- **Simplified Zod schema validation** for better frontend integration
- **Flexible data type handling** - accepts strings or numbers, converts automatically
- **Smart array processing** - handles JSON strings, arrays, and comma-separated values
- **Type-safe request/response handling** with automatic parsing
- **Custom validation middleware** with informative error messages
- **Helper endpoints** for enum values (categories, roles, statuses)

### **Security Measures**
- JWT token management with refresh mechanism
- Role-based access control
- Password hashing with salt rounds
- CORS configuration for frontend integration
- Environment variable validation

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

### **Full Stack Setup**
```bash
# Backend setup (this repository)
cd ~/Documents/workspace/level-2/localLens-backend
npm install
npm run dev  # Runs on http://localhost:5000

# Frontend setup (in a new terminal)
cd ~/Documents/workspace/level-2/local-lens-frontend
npm install
npm run dev  # Typically runs on http://localhost:3000
```

### **Available Scripts**
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm run lint     # Run ESLint for code quality
npm run deploy   # Build and deploy to Vercel
```

### **Complete API Endpoints**
```
Base URL: /api/v1

Authentication:
POST /auth/login              # User login
GET  /auth/getMe             # Get current user (Protected)
POST /auth/refresh-token     # Refresh access token
GET  /auth/logout            # User logout
POST /auth/change-password   # Change password (Protected)

Users:
GET    /user/enums           # Get user roles and statuses (Public)
POST   /user/register        # User registration
GET    /user/profile/:id     # Get public user profile
GET    /user/profile         # Get own profile (Protected)
PATCH  /user/profile         # Update own profile (Protected)
GET    /user/admin/all       # Get all users (Admin)
PATCH  /user/admin/:id       # Update user (Admin)
DELETE /user/admin/:id       # Delete user (Admin)

Tours:
GET    /tour                 # Get all active tours (Public)
GET    /tour/enums           # Get tour categories and statuses (Public)
GET    /tour/debug           # Debug: Get all tours with status info (Public)
GET    /tour/search          # Search tours with filters (Public)
GET    /tour/:slug           # Get tour by slug (Public)
GET    /tour/details/:id     # Get tour by ID (Public)
GET    /tour/my-tours        # Get user's tours/bookings (All authenticated users)
POST   /tour                 # Create new tour (Guide/Admin)
PATCH  /tour/:id             # Update tour (Guide/Admin)
DELETE /tour/:id             # Delete tour (Guide/Admin)
GET    /tour/guide/my-tours  # Get guide's tours (Guide only)
GET    /tour/admin/all       # Get all tours for admin (Admin)
```

### **Frontend Integration**
The backend is designed to work seamlessly with the LocalLens frontend application:
- **CORS Configuration**: Configured to accept requests from frontend URL
- **Cookie-based Authentication**: Secure HTTP-only cookies for session management
- **RESTful API Design**: Standard REST endpoints for easy frontend consumption
- **Consistent Response Format**: Standardized JSON responses for predictable frontend handling
- **Simplified Validation**: Flexible data handling to reduce frontend complexity
- **Helper Endpoints**: Easy access to enum values for dropdowns and form validation
- **Smart Data Processing**: Automatic parsing of arrays, JSON strings, and form data

#### **Frontend Usage Examples:**
```javascript
// Get enum values for dropdowns
const tourEnums = await fetch('/api/v1/tour/enums').then(res => res.json());
// Returns: { categories: ["FOOD", "HISTORICAL", ...], statuses: [...] }

// Flexible tour creation
const tourData = {
  title: "Amazing Tour",
  tourFee: "100", // String or number both work
  highlights: "Great views,Local guide", // Comma-separated or array
  itinerary: JSON.stringify([...]) // JSON string or object
};

// Simple user registration with automatic token handling
const userData = {
  name: "John Doe",
  email: "john@example.com", 
  password: "123456", // Minimum 6 characters
  role: "TOURIST"
};
```

## 🏗️ Architecture Decisions & Patterns

### **1. Modular Monolithic Architecture**
- **Why**: Easier development and deployment while maintaining separation of concerns
- **Benefits**: Clear module boundaries, shared utilities, centralized configuration
- **Trade-offs**: Potential for tight coupling if not managed properly

### **2. Service Layer Pattern**
- **Implementation**: Separate business logic from controllers
- **Benefits**: Testable business logic, reusable services, clean separation
- **Example**: `authService.userLoginService()` handles login logic

### **3. Middleware-First Approach**
- **Global Error Handling**: Centralized error processing
- **Authentication Middleware**: JWT verification and user injection
- **Validation Middleware**: Zod-based request validation

### **4. Environment-Driven Configuration**
- **Centralized Config**: Single source of truth for environment variables
- **Type Safety**: TypeScript interfaces for configuration
- **Validation**: Runtime validation of required environment variables

### **5. Response Standardization**
- **Consistent Format**: Standardized success/error responses
- **Response Manager**: Utility for consistent API responses
- **Error Handling**: Structured error information

## 🔍 Code Organization Highlights

### **Utility Management**
- **JWT Management**: Token generation, verification, and refresh logic
- **Response Manager**: Standardized API response formatting
- **Logger**: Centralized logging system
- **Cookie Management**: Secure cookie handling utilities

### **Middleware Architecture**
- **Global Error Handler**: Catches and formats all errors
- **Role-Based Protection**: Enforces access control
- **Zod Validation**: Type-safe request validation
- **Not Found Handler**: Handles undefined routes

### **Database Integration**
- **Connection Management**: Robust MongoDB connection handling
- **Model Relationships**: Proper referencing between collections
- **Schema Validation**: Mongoose schema validation
- **Admin Seeding**: Automatic admin user creation

## 🚀 Deployment Configuration

### **Vercel Deployment**
- **Build Process**: TypeScript compilation to `dist/`
- **Entry Point**: `dist/server.js`
- **Route Handling**: All routes directed to main server file
- **Environment**: Production-ready configuration

### **Production Considerations**
- **Error Stack Traces**: Hidden in production environment
- **CORS Configuration**: Environment-specific frontend URLs
- **Database Connection**: Production MongoDB Atlas integration
- **SSL Commerce**: Live payment gateway configuration

## 📈 Future Enhancements

### **Potential Improvements**
1. **Caching Layer**: Redis integration for improved performance
2. **Real-time Features**: WebSocket integration for live updates
3. **Notification System**: Email/SMS notifications for bookings
4. **Analytics Dashboard**: Booking and revenue analytics
5. **Multi-language Support**: Internationalization (i18n)
6. **API Documentation**: Swagger/OpenAPI documentation
7. **Testing Suite**: Unit and integration tests
8. **Rate Limiting**: API rate limiting for security
9. **Logging System**: Structured logging with external services
10. **Monitoring**: Application performance monitoring

## 🤝 Development Workflow

### **Code Standards**
- **Consistent Naming**: camelCase for variables, PascalCase for types
- **File Organization**: Feature-based module structure
- **Import Management**: Organized imports with clear dependencies
- **Error Handling**: Consistent error throwing and handling

### **Git Workflow**
- **Branch Strategy**: Feature branches with descriptive names
- **Commit Messages**: Clear, descriptive commit messages
- **Code Reviews**: Structured review process
- **Deployment**: Automated deployment via Vercel

---

## 📁 Project Structure Overview

```
LocalLens Project Structure:
├── localLens-backend/           # This repository (Backend API)
│   ├── src/app/
│   │   ├── modules/            # Feature modules
│   │   ├── middleware/         # Express middlewares
│   │   ├── config/            # Configuration files
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── README.md              # This file
└── local-lens-frontend/        # Frontend Repository
    ├── src/
    │   ├── components/         # React components
    │   ├── pages/             # Next.js pages
    │   ├── hooks/             # Custom hooks
    │   └── services/          # API service calls
    ├── package.json
    └── README.md
```

## 📝 Summary

LocalLens Backend demonstrates a **well-structured, scalable Node.js application** with:

- **Clean Architecture**: Modular design with clear separation of concerns
- **Type Safety**: Comprehensive TypeScript implementation
- **Security First**: JWT authentication, role-based access, input validation
- **Production Ready**: Error handling, logging, graceful shutdowns
- **Modern Stack**: Latest technologies and best practices
- **Maintainable Code**: Consistent patterns and organized structure
- **Frontend Integration**: Seamlessly works with the LocalLens frontend application

The project showcases professional backend development practices suitable for production environments, with comprehensive feature coverage for a tour booking platform. The backend serves as a robust API foundation for the frontend application located at `~/Documents/workspace/level-2/local-lens-frontend`.