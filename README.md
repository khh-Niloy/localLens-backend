# LocalLens Backend

A high-performance tour booking and management system API built with Node.js, Express, TypeScript, and MongoDB. Optimized for speed and scalability with Redis caching and real-time WebSocket communication.

## 🚀 Key Improvements

- **Redis Caching**: Optimized API latency by **~95%** and ensured **O(1) query scalability**. Uses a sophisticated versioning system for efficient cache invalidation.
- **Cursor-based Pagination**: Implemented for high-performance deep scrolling, providing **O(1) search capability** and consistent results in dynamic data environments.
- **Real-time Messaging**: Multi-user 1:1 chat system using **Socket.IO** with **Room Management** for secure, isolated communication.

## 🛠️ Technology Stack

- **Runtime**: Node.js, TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Caching**: **Redis** (with version-key tracking)
- **Real-time**: **Socket.io** (Room-based events)
- **Security**: JWT, bcrypt, Zod validation
- **Storage**: Cloudinary
- **Payment**: SSL Commerz

## 🏗️ Core Features

- **Multi-Role RBAC**: Secure access for Tourists, Guides, and Admins.
- **Tour discovery**: Advanced filtering and search optimized by Redis.
- **Booking Workflow**: Full lifecycle from pending to completion with secure payments.
- **Conversation Engine**: Robust chat model managing user pairs and persistent history.

## 🔗 Live URLs

- **Backend API**: [https://local-lens-backend.vercel.app/](https://local-lens-backend.vercel.app/)
- **Frontend App**: [https://local-lens-frontend.vercel.app/](https://local-lens-frontend.vercel.app/)

## 🏗️ Project Architecture

```
src/
├── app/
│   ├── lib/              # Connect Redis & Mongoose
│   ├── modules/          # Feature groups
│   │   ├── web-socket/   # Socket.io & Message logic
│   │   ├── tour/         # Caching & Pagination logic
│   │   └── ...           # Other modules
│   └── utils/            # Shared utilities
├── server.ts             # Server & Socket initialization
└── app.ts                # Express setup
```

## 📝 Summary

LocalLens Backend demonstrates a **production-ready architecture** focused on performance. By offloading complex queries to **Redis** and leveraging **Cursor pagination**, the system remains responsive even with large datasets. The **Socket.IO room management** ensures real-time features are scalable and secure.
