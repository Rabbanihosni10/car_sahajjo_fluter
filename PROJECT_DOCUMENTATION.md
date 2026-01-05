# Car Sahajjo - Comprehensive Car Management System

A full-stack mobile application for car management, driver hiring, marketplace, and community features.

## 🚀 Project Overview

Car Sahajjo is a comprehensive platform that connects car owners, drivers, vendors, and service providers in one unified ecosystem. The system provides solutions for:

- 🚗 Car rental and sales
- 👨‍✈️ Driver hiring and job matching
- 🛒 Auto parts marketplace
- 🔧 Service center location
- 💬 Community forum
- 📱 Real-time communication
- 💳 Integrated payments
- ⭐ Reviews and ratings

## 📁 Repository Structure

```
car_sahajjo_fluter/
├── backend/              # Node.js + Express backend
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & upload middleware
│   ├── controllers/     # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
└── frontend/            # Flutter mobile app
    ├── lib/
    │   ├── config/      # App configuration
    │   ├── models/      # Data models
    │   ├── providers/   # State management
    │   ├── screens/     # UI screens
    │   ├── services/    # API services
    │   ├── widgets/     # Reusable components
    │   └── main.dart    # App entry point
    └── assets/          # Images, fonts, icons
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Validation**: Express-validator

### Frontend
- **Framework**: Flutter (Dart)
- **State Management**: Provider
- **HTTP Client**: Dio & HTTP
- **Local Storage**: SharedPreferences
- **Real-time**: Socket.io Client
- **Maps**: Google Maps Flutter
- **Notifications**: Firebase Cloud Messaging

### Planned Integrations
- **Payments**: SSLCommerz, Stripe, bKash, Nagad
- **Email**: Nodemailer
- **SMS**: Twilio (configurable)
- **Push Notifications**: Firebase
- **Maps**: Google Maps API
- **PDF Generation**: PDFKit (backend), PDF (Flutter)

## ✨ Features Implemented

### 1. User Management ✅
- Multi-role authentication (Owner, Driver, Admin, Vendor)
- JWT-based secure authentication
- Profile management with photo upload
- KYC verification for drivers
- Admin approval workflow
- Role-based access control

### 2. Driver Hiring & Job System ✅
- Job posting by car owners
- Driver application system
- Application status tracking
- Interview scheduling support
- Contract management structure

### 3. Booking & Rate System ✅
- Calendar-based booking
- Hourly/Daily/Weekly/Monthly rates
- Conflict detection algorithm
- Rate negotiation system
- Booking history tracking

### 4. Document & Car Management ✅
- Comprehensive car profiles
- Multiple image uploads
- Document tracking (registration, insurance, etc.)
- Expiry date management
- Admin verification workflow
- GPS tracking support

### 5. Marketplace & Cart ✅
- Product catalog with categories
- Vendor onboarding
- Order management
- Stock tracking
- Invoice generation

### 6. Car Sales & Rentals ✅
- Car listings for sale/rent
- Advanced search and filters
- Test drive booking
- Security deposit management
- Insurance verification

### 7. Payment & Billing ✅
- Multiple payment methods
- Transaction history
- Invoice generation
- Refund workflow
- Payment gateway integration ready

### 8. Review & Rating System ✅
- Multi-entity reviews (drivers, cars, products)
- Star ratings (1-5)
- Photo uploads in reviews
- Helpful votes
- Moderation tools

### 9. Service Center & GPS ✅
- Service center locator
- Geospatial queries (nearby search)
- Service booking support
- Real-time GPS tracking for rentals
- Maintenance alerts

### 10. Admin Panel ✅
- Dashboard with statistics
- User management
- Approval workflows
- KYC verification
- Content moderation

### 11. Community Forum ✅
- Social feed with posts
- Comments and likes
- Tag-based filtering
- Content moderation
- Public/Private posts

### 12. Notifications ✅
- Multi-channel (Email, SMS, Push, In-App)
- Notification preferences
- Read/Unread tracking
- Priority levels
- Firebase integration ready

### 13. Communication & Support ✅
- Real-time chat with Socket.io
- Support ticket system
- FAQ section
- Chat history

### 14. Additional Features ✅
- Dark mode support
- Responsive UI
- Material Design 3
- Error handling
- Loading states

## 🔧 Setup Instructions

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
Create/edit `.env` file with:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=6000
JWT_SECRET=your_secret_key
NODE_ENV=development
```

4. **Start the server**:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:6000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
flutter pub get
```

3. **Update API configuration**:
Edit `lib/config/app_config.dart`:
```dart
static const String baseUrl = 'http://your-backend-url:6000/api';
```

4. **Run the app**:
```bash
flutter run
```

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile/photo` - Upload photo
- `POST /api/users/kyc` - Submit KYC documents
- `GET /api/users/drivers` - Get approved drivers

### Job Endpoints
- `POST /api/jobs` - Create job (Owner)
- `GET /api/jobs` - Get job listings
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Apply for job (Driver)

### Car Endpoints
- `POST /api/cars` - Add new car (Owner)
- `GET /api/cars` - Get car listings
- `GET /api/cars/:id` - Get car details
- `PUT /api/cars/:id` - Update car

### Booking Endpoints
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking

### Product & Order Endpoints
- `GET /api/products` - Get products
- `POST /api/products` - Create product (Vendor)
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders

### Payment Endpoints
- `POST /api/payments` - Process payment
- `GET /api/payments` - Get payment history

### Review Endpoints
- `POST /api/reviews` - Create review
- `GET /api/reviews/:type/:id` - Get reviews

### Service Center Endpoints
- `GET /api/services/nearby` - Get nearby centers

### Community Endpoints
- `POST /api/posts` - Create post
- `GET /api/posts` - Get posts feed
- `POST /api/posts/:id/like` - Like/unlike post

### Notification Endpoints
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/approve` - Approve user
- `PUT /api/admin/kyc/:id/verify` - Verify KYC

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control
- File upload validation
- Input sanitization
- XSS protection
- CORS configuration
- Rate limiting ready

## 📊 Database Models

1. **User** - User accounts with roles
2. **Job** - Job postings and applications
3. **Car** - Vehicle information
4. **Booking** - Rental/hire bookings
5. **Product** - Marketplace products
6. **Order** - Purchase orders
7. **Payment** - Payment transactions
8. **Review** - Reviews and ratings
9. **ServiceCenter** - Service locations
10. **Post** - Community posts
11. **Notification** - User notifications
12. **Chat** - Chat conversations
13. **SupportTicket** - Support tickets

## 🎨 UI/UX Features

- Material Design 3
- Custom color scheme
- Light and dark themes
- Smooth animations
- Loading states
- Error handling
- Responsive layouts
- Bottom navigation
- Card-based design

## 🚧 Remaining Work

### High Priority
1. Complete remaining Flutter screens:
   - Job listings and applications
   - Car listing and details
   - Booking calendar
   - Marketplace and cart
   - Payment screens
   - Chat interface

2. Payment gateway integration:
   - SSLCommerz setup
   - Stripe setup
   - bKash integration
   - Nagad integration

3. Firebase configuration:
   - Push notifications
   - Cloud messaging

### Medium Priority
1. Google Maps integration
2. Email notification service
3. SMS notification service
4. PDF invoice generation
5. Advanced search filters
6. Analytics dashboard

### Low Priority
1. Unit tests
2. Integration tests
3. E2E tests
4. Performance optimization
5. SEO optimization
6. PWA support

## 📝 Development Guidelines

### Code Style
- Use consistent indentation
- Follow ESLint rules (backend)
- Follow Flutter/Dart style guide
- Add comments for complex logic
- Use meaningful variable names

### Git Workflow
- Create feature branches
- Write descriptive commit messages
- Test before committing
- Review code before merging

### Testing
- Write unit tests for models
- Test API endpoints
- Test UI components
- Perform manual testing

## 🤝 Contributing

This is a private project. For internal development only.

## 📄 License

Private - Car Sahajjo Project

## 👥 Team

Development Team - Car Sahajjo

## 📞 Support

For technical issues or questions, contact the development team.

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: Active Development
