# Car Sahajjo Backend

Comprehensive backend API for Car Sahajjo - Car Management System

## Features Implemented

### 1. User Management
- User registration and authentication with JWT
- User roles: Owner, Driver, Admin, Vendor
- Profile management with photo upload
- KYC verification for drivers
- Admin approval workflow

### 2. Driver Hiring & Job System
- Job posting by owners
- Driver applications
- Application status tracking
- Interview scheduling support

### 3. Booking & Rate System
- Calendar-based booking
- Hourly/Daily rate system
- Conflict detection
- Rate negotiation support

### 4. Document & Car Management
- Car listing with specifications
- Document upload and tracking
- Car status management
- GPS tracking support

### 5. Marketplace & Cart
- Product catalog
- Order management
- Vendor system

### 6. Car Sales & Rentals
- Car listings for sale/rent
- Search and filter
- Test drive booking support
- Rental management with deposits

### 7. Payment & Billing
- Payment processing
- Transaction history
- Invoice generation support
- Refund workflow

### 8. Review, Rating & Feedback
- Multi-entity reviews (drivers, cars, products)
- Rating system
- Moderation support

### 9. Service Center & GPS Integration
- Service center locator with geospatial queries
- GPS tracking for rentals

### 10. Admin Panel
- Dashboard with statistics
- User management
- Approval workflows
- KYC verification

### 11. Community Forum
- Social posts
- Comments and likes
- Tag-based filtering
- Moderation support

### 12. Notifications
- Multi-channel notification system
- In-app notifications
- Email/SMS support (configurable)

### 13. Communication & Support
- Real-time chat with Socket.io
- Support ticket system
- FAQ section

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file with the following:

```
MONGODB_URI=your_mongodb_connection_string
PORT=6000
JWT_SECRET=your_jwt_secret  # IMPORTANT: Use a strong random secret!
NODE_ENV=development

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_your_stripe_key
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- POST `/api/auth/refresh` - Refresh token

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update profile
- POST `/api/users/profile/photo` - Upload profile photo
- POST `/api/users/kyc` - Submit KYC documents
- GET `/api/users/drivers` - Get approved drivers

### Jobs
- POST `/api/jobs` - Create job posting (Owner)
- GET `/api/jobs` - Get job listings
- POST `/api/jobs/:id/apply` - Apply for job (Driver)

### Cars
- POST `/api/cars` - Add new car (Owner)
- GET `/api/cars` - Get car listings
- GET `/api/cars/:id` - Get car details

### Bookings
- POST `/api/bookings` - Create booking
- GET `/api/bookings` - Get user bookings

### Products
- GET `/api/products` - Get products
- POST `/api/products` - Create product (Vendor)

### Orders
- POST `/api/orders` - Create order
- GET `/api/orders` - Get user orders

### Payments
- POST `/api/payments` - Process payment
- GET `/api/payments` - Get payment history

### Reviews
- POST `/api/reviews` - Create review
- GET `/api/reviews/:type/:id` - Get reviews

### Service Centers
- GET `/api/services/nearby` - Get nearby service centers

### Posts (Community Forum)
- POST `/api/posts` - Create post
- GET `/api/posts` - Get posts feed
- POST `/api/posts/:id/like` - Like/unlike post

### Notifications
- GET `/api/notifications` - Get user notifications
- PUT `/api/notifications/:id/read` - Mark as read

### Chat
- GET `/api/chat` - Get user chats
- POST `/api/chat` - Create/get chat

### Support
- POST `/api/support/tickets` - Create support ticket
- GET `/api/support/tickets` - Get user tickets
- GET `/api/support/faq` - Get FAQ

### Admin
- GET `/api/admin/dashboard` - Dashboard stats
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/:id/approve` - Approve user
- PUT `/api/admin/kyc/:id/verify` - Verify KYC

## Database Models

- User
- Job
- Car
- Booking
- Product
- Order
- Payment
- Review
- ServiceCenter
- Post
- Notification
- Chat
- SupportTicket

## Socket.io Events

- `connection` - Client connected
- `join-chat` - Join a chat room
- `send-message` - Send message
- `receive-message` - Receive message
- `disconnect` - Client disconnected

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- File upload validation
- Input validation with express-validator

## Next Steps

1. Configure payment gateways (SSLCommerz, Stripe)
2. Set up email service (Nodemailer)
3. Configure Firebase for push notifications
4. Add Google Maps integration
5. Implement invoice generation (PDFKit)
6. Add automated document expiry reminders
7. Implement rate limiting
8. Add comprehensive error logging
9. Set up automated testing
10. Deploy to production server

## Technology Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time chat
- JWT for authentication
- Multer for file uploads
- bcryptjs for password hashing
- express-validator for input validation

## License

Private - Car Sahajjo Project
