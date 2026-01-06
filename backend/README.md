# Car Sahajjo Backend

Backend server for Car Sahajjo app with real-time chat functionality using Socket.IO and MongoDB.

## Features

- Real-time messaging with Socket.IO
- REST API for chat management
- Message persistence with MongoDB
- JWT authentication
- Message history with pagination
- Support for message attachments
- Read receipts tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string and JWT secret:
```
MONGODB_URI="your-mongodb-connection-string"
PORT=6000
JWT_SECRET="your-secret-key"
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Check server and database status

### Chat Routes
All chat routes require authentication via `Authorization: Bearer <token>` header.

- `GET /api/chat` - List all chats for the authenticated user
- `POST /api/chat` - Create a new chat
  - Body: `{ "participants": ["userId1", "userId2"] }`
- `GET /api/chat/:id/messages` - Get paginated message history
  - Query params: `page` (default: 1), `limit` (default: 50)
- `POST /api/chat/:id/messages` - Send a message to a chat
  - Body: `{ "content": "message text", "attachments": [] }`

## Socket.IO Events

### Client → Server

- `join-chat` - Join a chat room
  - Payload: `chatId` (string)
- `leave-chat` - Leave a chat room
  - Payload: `chatId` (string)
- `send-message` - Send a message
  - Payload: `{ chatId, userId, content, attachments }`
- `typing` - Emit typing indicator
  - Payload: `{ chatId, userId, isTyping }`

### Server → Client

- `receive-message` - New message received
  - Payload: `{ chatId, message }`
- `user-typing` - User is typing
  - Payload: `{ chatId, userId, isTyping }`
- `error` - Error occurred
  - Payload: `{ message }`

## Project Structure

```
backend/
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── models/
│   ├── Chat.js          # Chat model with message subdocuments
│   └── User.js          # User model
├── routes/
│   └── chat.js          # Chat REST API routes
├── server.js            # Main server file with Socket.IO setup
├── package.json
└── .env.example
```

## Database Schema

### Chat
- `participants`: Array of User IDs
- `messages`: Array of message subdocuments
  - `sender`: User ID
  - `content`: Message text
  - `attachments`: Array of attachment objects
  - `readBy`: Array of read receipts
  - `timestamp`: Message timestamp
- `lastMessage`: Last message summary for sorting
- `createdAt`: Chat creation timestamp
- `updatedAt`: Last update timestamp

## Notes

- MongoDB connection required for full functionality
- Messages are stored as subdocuments in the Chat collection
- For production, ensure proper JWT secret and MongoDB credentials
- Socket authentication can be added for enhanced security
