# Car Sahajjo - Chat Support with Persistence and JWT Authentication

This project implements a real-time chat system with message persistence, JWT-authenticated Socket.IO connections, and REST API endpoints for chat management.

## Features

- **Real-time messaging** via Socket.IO with JWT authentication
- **Message persistence** using MongoDB with message history
- **REST API endpoints** for chat management and message retrieval
- **User authentication** with JWT tokens
- **Flutter client** with Socket.IO integration and chat UI

## Backend Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Atlas or local instance)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```
MONGODB_URI=your_mongodb_connection_string
PORT=6000
JWT_SECRET=your_jwt_secret_key_change_in_production
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:6000`

## API Endpoints

### Authentication

#### Register a new user
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Chat Management

#### Get all chats for authenticated user
```bash
GET /api/chat
Authorization: Bearer <jwt_token>
```

#### Create a new chat
```bash
POST /api/chat
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "participants": ["user_id_1", "user_id_2"],
  "type": "private",
  "name": "Optional chat name"
}
```

#### Get messages for a chat (paginated)
```bash
GET /api/chat/:chatId/messages?page=1&limit=50
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "messages": [...],
  "page": 1,
  "limit": 50,
  "total": 100,
  "hasMore": true
}
```

#### Post a new message to a chat
```bash
POST /api/chat/:chatId/messages
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Hello, this is a test message",
  "attachments": []
}
```

## Socket.IO Events

### Connection

Connect to Socket.IO with JWT authentication:
```javascript
const socket = io('http://localhost:6000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

#### Client -> Server

- **join-chat**: Join a chat room
```javascript
socket.emit('join-chat', chatId);
```

- **send-message**: Send a message
```javascript
socket.emit('send-message', {
  chatId: 'chat_id',
  content: 'Message content',
  attachments: []
});
```

#### Server -> Client

- **receive-message**: Receive a new message
```javascript
socket.on('receive-message', (data) => {
  console.log(data);
  // {
  //   chatId: 'chat_id',
  //   message: {
  //     sender: 'user_id',
  //     content: 'Message content',
  //     timestamp: '2026-01-06T00:00:00.000Z',
  //     ...
  //   }
  // }
});
```

- **error**: Error handling
```javascript
socket.on('error', (error) => {
  console.error(error);
});
```

## Frontend Setup (Flutter)

### Prerequisites

- Flutter SDK (3.9.2 or higher)
- Dart SDK

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
flutter pub get
```

### Usage

Import the chat screen in your Flutter app:

```dart
import 'package:frontend/screens/chat_screen.dart';

// Navigate to chat screen
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => ChatScreen(
      chatId: 'your_chat_id',
      token: 'your_jwt_token',
      serverUrl: 'http://localhost:6000',
    ),
  ),
);
```

## Testing Instructions

### 1. Backend Setup

Configure your MongoDB URI and JWT secret in `.env` file and start the server:
```bash
cd backend
npm run dev
```

### 2. Create Test Users

Register two users using the `/api/auth/register` endpoint:

**User 1:**
```bash
curl -X POST http://localhost:6000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "password": "password123"
  }'
```

**User 2:**
```bash
curl -X POST http://localhost:6000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "email": "bob@example.com",
    "password": "password123"
  }'
```

Save the JWT tokens returned from each registration.

### 3. Create a Chat

Create a chat between the two users using User 1's token:
```bash
curl -X POST http://localhost:6000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user1_token>" \
  -d '{
    "participants": ["<user1_id>", "<user2_id>"],
    "type": "private"
  }'
```

Save the `chatId` returned.

### 4. Test Socket.IO Connection

From two different clients (e.g., Flutter ChatScreen + Postman or a second client), connect to the Socket.IO server with the respective JWT tokens and join the chat.

#### Using a Node.js test client:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:6000', {
  auth: { token: 'user1_token' }
});

socket.on('connect', () => {
  console.log('Connected');
  socket.emit('join-chat', 'chat_id');
});

socket.on('receive-message', (data) => {
  console.log('Message received:', data);
});

// Send a message
socket.emit('send-message', {
  chatId: 'chat_id',
  content: 'Hello from client 1'
});
```

### 5. Verify Message Persistence

Check that messages are persisted by retrieving message history:
```bash
curl http://localhost:6000/api/chat/<chat_id>/messages?page=1&limit=50 \
  -H "Authorization: Bearer <token>"
```

### 6. Verify Real-time Delivery

- Send messages from one client
- Verify both clients receive the `receive-message` event
- Verify `lastMessage` is updated in the Chat document
- Verify messages are saved in the database

## Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  timestamps: true
}
```

### Chat Model
```javascript
{
  participants: [ObjectId],
  type: 'private' | 'group',
  name: String,
  lastMessage: {
    sender: ObjectId,
    content: String,
    timestamp: Date
  },
  messages: [
    {
      sender: ObjectId,
      content: String,
      attachments: [
        {
          url: String,
          filename: String,
          mimeType: String
        }
      ],
      readBy: [
        {
          user: ObjectId,
          readAt: Date
        }
      ],
      timestamp: Date
    }
  ],
  isActive: Boolean,
  timestamps: true
}
```

## Notes

- Messages are stored as subdocuments in the Chat collection for simplicity. For high-volume chats, consider refactoring messages into a separate collection.
- Attachments are stored as metadata (URL, filename, mimeType). File upload endpoints can be added separately.
- The JWT secret should be changed to a strong, randomly generated secret in production.
- Socket.IO connections are authenticated using the same JWT secret as REST endpoints.

## Security

- All Socket.IO connections require JWT authentication
- REST API endpoints are protected with JWT authentication middleware
- Passwords are hashed using bcrypt before storage
- Only chat participants can access chat messages and send messages

## License

MIT
