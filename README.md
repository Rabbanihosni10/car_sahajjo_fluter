# 🚗 Car Sahajjo - Comprehensive Car Management System

A full-stack mobile application for car management, connecting car owners, drivers, vendors, and service providers in one unified ecosystem.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-3.9.2+-blue.svg)](https://flutter.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Private-red.svg)](LICENSE)

## 📋 Overview

Car Sahajjo is a comprehensive platform that provides solutions for:

- 🚗 **Car Rental & Sales** - List, browse, and rent/buy vehicles
- 👨‍✈️ **Driver Hiring** - Connect car owners with professional drivers
- 🛒 **Auto Parts Marketplace** - Buy and sell car parts and accessories
- 🔧 **Service Centers** - Locate nearby service centers with GPS
- 💬 **Community Forum** - Share experiences and tips
- 📱 **Real-time Chat** - Direct messaging between users
- 💳 **Integrated Payments** - Multiple payment methods supported
- ⭐ **Reviews & Ratings** - Rate drivers, cars, and products

## 🎯 Features

### ✅ Implemented
- Complete backend REST API with 50+ endpoints
- JWT authentication with role-based access control
- Real-time chat with Socket.io
- Booking system with conflict detection
- Marketplace with product catalog
- Review and rating system
- Admin dashboard with analytics
- Community forum
- Notification system
- Dark mode support

### 🚧 In Progress
- Flutter UI screens for all features
- Payment gateway integration (SSLCommerz, Stripe, bKash)
- Firebase push notifications
- Google Maps integration
- Email/SMS notifications

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Real-time**: Socket.io
- **File Upload**: Multer

### Frontend
- **Framework**: Flutter (Dart)
- **State Management**: Provider
- **HTTP Client**: Dio & HTTP
- **Maps**: Google Maps Flutter
- **Notifications**: Firebase Cloud Messaging

## 📁 Project Structure

```
car_sahajjo_fluter/
├── backend/              # Node.js + Express backend
│   ├── models/          # 13 MongoDB schemas
│   ├── routes/          # 15 API route modules
│   ├── middleware/      # Auth & upload middleware
│   └── server.js        # Entry point
│
├── frontend/            # Flutter mobile app
│   ├── lib/
│   │   ├── config/      # App configuration
│   │   ├── models/      # Data models
│   │   ├── providers/   # State management
│   │   ├── screens/     # UI screens
│   │   └── services/    # API services
│   └── assets/          # Images, fonts, icons
│
├── PROJECT_DOCUMENTATION.md      # Complete documentation
├── IMPLEMENTATION_SUMMARY.md     # Implementation details
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Flutter SDK 3.9.2+
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (see backend/README.md for details)
cp .env.example .env

# Start development server
npm run dev
```

Backend will run on `http://localhost:6000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
flutter pub get

# Update API endpoint in lib/config/app_config.dart

# Run the app
flutter run
```

## 📱 Screenshots

*Screenshots will be added as UI screens are completed*

## 📚 Documentation

- [📖 Project Documentation](PROJECT_DOCUMENTATION.md) - Complete project overview
- [📝 Implementation Summary](IMPLEMENTATION_SUMMARY.md) - What's been built
- [🔧 Backend Documentation](backend/README.md) - Backend API guide
- [📱 Frontend Documentation](frontend/README.md) - Flutter app guide

## 🔌 API Documentation

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

#### Jobs
- `GET /api/jobs` - List job postings
- `POST /api/jobs` - Create job (Owner)
- `POST /api/jobs/:id/apply` - Apply for job (Driver)

#### Cars
- `GET /api/cars` - List cars
- `POST /api/cars` - Add car (Owner)
- `GET /api/cars/:id` - Get car details

#### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings

*See [backend/README.md](backend/README.md) for complete API documentation*

## 👥 User Roles

- **Owner**: List cars, post jobs, manage bookings
- **Driver**: Apply for jobs, view cars, get hired
- **Admin**: Manage users, verify KYC, moderate content
- **Vendor**: Sell products in marketplace

## 🔒 Security

- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- File upload validation
- Input sanitization
- XSS protection
- CORS configuration

## 🧪 Testing

```bash
# Backend tests (to be added)
cd backend
npm test

# Frontend tests (to be added)
cd frontend
flutter test
```

## 📊 Project Status

### Backend: ✅ Complete
- All API endpoints functional
- 13 database models
- Authentication system
- Real-time chat
- File uploads

### Frontend: 🟡 Foundation Complete
- Authentication screens ✅
- Dashboard structure ✅
- Theme system ✅
- API integration ✅
- Additional UI screens 🚧

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] Backend API development
- [x] Database schema design
- [x] Authentication system
- [x] Flutter app structure

### Phase 2: UI Development 🚧 (In Progress)
- [ ] Job listing screens
- [ ] Car browsing screens
- [ ] Booking calendar
- [ ] Marketplace screens
- [ ] Chat interface

### Phase 3: Integration 🔜 (Upcoming)
- [ ] Payment gateways
- [ ] Push notifications
- [ ] Google Maps
- [ ] Email/SMS service

### Phase 4: Testing & Deployment 🔜 (Upcoming)
- [ ] Automated testing
- [ ] Performance optimization
- [ ] Production deployment
- [ ] App store submission

## 🤝 Contributing

This is a private project. For internal development only.

## 📄 License

Private - Car Sahajjo Project

## 👨‍💻 Development Team

Car Sahajjo Development Team

## 📞 Support

For technical issues or questions, contact the development team.

## 🙏 Acknowledgments

- Express.js community
- Flutter team
- MongoDB team
- Socket.io team

---

**Built with ❤️ for Car Sahajjo**

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Active Development
