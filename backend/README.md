# Car Sahajjo Backend

Backend server for Car Sahajjo with real-time chat support using Socket.IO.

## Features

- **JWT Authentication**: Secure user authentication with JSON Web Tokens
- **Real-time Chat**: Socket.IO integration for instant messaging
- **REST API**: Complete REST endpoints for chat operations
- **MongoDB**: Persistent message storage with message subdocuments
- **Socket JWT Auth**: Socket connections verified with JWT tokens

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB URI and JWT secret:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=6000
JWT_SECRET=your-secret-key-change-in-production
```

4. Start the server:
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  - Body: `{ username, email, password }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`

### Chat (All require JWT token in Authorization header)
- `GET /api/chat` - List all chats for authenticated user
- `POST /api/chat` - Create a new chat
  - Body: `{ participantIds: [userId1, userId2, ...] }`
- `GET /api/chat/:id/messages` - Get paginated messages
  - Query: `?page=1&limit=50`
- `POST /api/chat/:id/messages` - Send a message via REST
  - Body: `{ content, attachments: [] }`

### Health Check
- `GET /health` - Server health status

## Socket.IO Events

### Client → Server
- `join-chat` - Join a chat room
  - Data: `{ chatId }`
- `send-message` - Send a message
  - Data: `{ chatId, content, attachments: [] }`
- `leave-chat` - Leave a chat room
  - Data: `{ chatId }`

### Server → Client
- `receive-message` - Receive a new message
  - Data: `{ chatId, message: {...} }`
- `joined-chat` - Confirmation of joining chat
  - Data: `{ chatId }`
- `error` - Error notification
  - Data: `{ message }`

## Socket.IO Authentication

Connect to Socket.IO with JWT token:

```javascript
const socket = io('http://localhost:6000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

Or via query parameter:
```javascript
const socket = io('http://localhost:6000?token=your-jwt-token');
```

## Database Schema

### User
- `username`: String (unique)
- `email`: String (unique)
- `password`: String (hashed)

### Chat
- `participants`: Array of User IDs
- `messages`: Array of message subdocuments
  - `sender`: User ID
  - `content`: String
  - `attachments`: Array of attachments
  - `readBy`: Array of User IDs
  - `timestamp`: Date
- `lastMessage`: Object
  - `sender`: User ID
  - `content`: String
  - `timestamp`: Date

## Testing

### Using curl

1. Register a user:
```bash
curl -X POST http://localhost:6000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user1@test.com","password":"password123"}'
```

2. Login:
```bash
curl -X POST http://localhost:6000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password123"}'
```

3. Create a chat (use token from login):
```bash
curl -X POST http://localhost:6000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"participantIds":["USER_ID_2"]}'
```

4. Send a message:
```bash
curl -X POST http://localhost:6000/api/chat/CHAT_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"Hello!"}'
```

### Using Socket.IO Client

See the Flutter client implementation in `frontend/lib/services/socket_service.dart` for a complete example.

## Security

- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Socket connections require valid JWT token
- All chat operations verify user is a participant
- CORS enabled (configure for production)

## Project Structure

```
backend/
├── models/
│   ├── User.js          # User schema
│   └── Chat.js          # Chat schema with message subdocuments
├── routes/
│   ├── auth.js          # Authentication routes
│   └── chat.js          # Chat REST API routes
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── server.js            # Main server with Socket.IO
├── package.json
└── .env                 # Environment variables (not in git)
```
