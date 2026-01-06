# Testing Guide for Chat Support

This guide provides comprehensive testing instructions for the chat support implementation.

## Prerequisites

1. MongoDB instance running (local or Atlas)
2. Node.js and npm installed
3. Flutter SDK installed (for frontend testing)
4. Postman or curl for API testing

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```bash
MONGODB_URI=your_mongodb_connection_string
PORT=6000
JWT_SECRET=your-secret-key
```

4. Start the server:
```bash
npm run dev  # or npm start
```

Expected output:
```
Connected to MongoDB
Server is running on port 6000
```

## Test 1: User Registration and Authentication

### Register User 1
```bash
curl -X POST http://localhost:6000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@test.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_1",
    "username": "alice",
    "email": "alice@test.com"
  }
}
```

Save the token as `ALICE_TOKEN` and user ID as `ALICE_ID`.

### Register User 2
```bash
curl -X POST http://localhost:6000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "email": "bob@test.com",
    "password": "password123"
  }'
```

Save the token as `BOB_TOKEN` and user ID as `BOB_ID`.

### Test Login
```bash
curl -X POST http://localhost:6000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.com",
    "password": "password123"
  }'
```

## Test 2: Create Chat

Create a chat between Alice and Bob (using Alice's token):
```bash
curl -X POST http://localhost:6000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -d '{
    "participantIds": ["BOB_ID"]
  }'
```

Expected response:
```json
{
  "message": "Chat created successfully",
  "chat": {
    "_id": "chat_id",
    "participants": [...],
    "messages": [],
    "lastMessage": null
  }
}
```

Save the chat ID as `CHAT_ID`.

## Test 3: Send Message via REST API

### Send message from Alice
```bash
curl -X POST http://localhost:6000/api/chat/CHAT_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -d '{
    "content": "Hello Bob! How are you?"
  }'
```

Expected response:
```json
{
  "message": "Message sent successfully",
  "data": {
    "_id": "message_id",
    "sender": {
      "id": "ALICE_ID",
      "username": "alice"
    },
    "content": "Hello Bob! How are you?",
    "timestamp": "2026-01-06T00:00:00.000Z"
  }
}
```

### Verify message persistence
Get messages from the chat:
```bash
curl -X GET http://localhost:6000/api/chat/CHAT_ID/messages \
  -H "Authorization: Bearer BOB_TOKEN"
```

Verify the message appears in the response.

## Test 4: Socket.IO Connection and Real-time Messaging

### Using a Node.js Socket.IO Client

Create a test file `test-socket.js`:
```javascript
const io = require('socket.io-client');

const ALICE_TOKEN = 'your-alice-token';
const BOB_TOKEN = 'your-bob-token';
const CHAT_ID = 'your-chat-id';

// Connect Alice
const aliceSocket = io('http://localhost:6000', {
  auth: { token: ALICE_TOKEN }
});

// Connect Bob
const bobSocket = io('http://localhost:6000', {
  auth: { token: BOB_TOKEN }
});

aliceSocket.on('connect', () => {
  console.log('Alice connected');
  aliceSocket.emit('join-chat', { chatId: CHAT_ID });
});

bobSocket.on('connect', () => {
  console.log('Bob connected');
  bobSocket.emit('join-chat', { chatId: CHAT_ID });
});

aliceSocket.on('joined-chat', () => {
  console.log('Alice joined chat');
});

bobSocket.on('joined-chat', () => {
  console.log('Bob joined chat');
  
  // Bob sends a message
  setTimeout(() => {
    bobSocket.emit('send-message', {
      chatId: CHAT_ID,
      content: 'Hi Alice! I am doing great!'
    });
  }, 1000);
});

// Listen for messages
aliceSocket.on('receive-message', (data) => {
  console.log('Alice received:', data.message.content);
});

bobSocket.on('receive-message', (data) => {
  console.log('Bob received:', data.message.content);
});

aliceSocket.on('error', (error) => {
  console.error('Alice error:', error);
});

bobSocket.on('error', (error) => {
  console.error('Bob error:', error);
});
```

Run:
```bash
node test-socket.js
```

Expected output:
```
Alice connected
Bob connected
Alice joined chat
Bob joined chat
Alice received: Hi Alice! I am doing great!
Bob received: Hi Alice! I am doing great!
```

## Test 5: Socket JWT Authentication

### Test with invalid token
```javascript
const invalidSocket = io('http://localhost:6000', {
  auth: { token: 'invalid-token' }
});

invalidSocket.on('connect_error', (error) => {
  console.log('Expected error:', error.message);
  // Should output: "Invalid authentication token"
});
```

### Test without token
```javascript
const noTokenSocket = io('http://localhost:6000');

noTokenSocket.on('connect_error', (error) => {
  console.log('Expected error:', error.message);
  // Should output: "Authentication token required"
});
```

## Test 6: Frontend Flutter Testing

### Setup
1. Navigate to frontend directory:
```bash
cd frontend
flutter pub get
```

2. Update the base URL in the code if your backend is not on `localhost:6000`

3. Run the Flutter app:
```bash
flutter run
```

### Manual Testing Flow

1. **Login/Register**: Use the AuthService to login with one of the test users
2. **Connect Socket**: The ChatScreen should automatically connect when opened
3. **Join Chat**: Pass the chat ID to ChatScreen
4. **View History**: Messages should load from the database
5. **Send Message**: Type and send a message
6. **Real-time**: Open another instance (or use Postman) to send a message and verify it appears in real-time

### Expected Behavior
- Messages appear instantly without refresh
- Message history loads on screen open
- Sent messages show sending indicator
- Errors are displayed as snackbars

## Test 7: Verify Database Persistence

### Using MongoDB Compass or mongosh

Connect to your MongoDB and check the `chats` collection:

```javascript
db.chats.findOne({ _id: ObjectId("CHAT_ID") })
```

Verify:
- `messages` array contains all sent messages
- `lastMessage` reflects the most recent message
- `participants` array includes both user IDs

## Test 8: Pagination Testing

Send multiple messages (50+) and test pagination:

```bash
# Send 60 messages
for i in {1..60}; do
  curl -X POST http://localhost:6000/api/chat/CHAT_ID/messages \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ALICE_TOKEN" \
    -d "{\"content\": \"Message $i\"}"
done
```

Test pagination:
```bash
# Get page 1 (latest 50 messages)
curl -X GET "http://localhost:6000/api/chat/CHAT_ID/messages?page=1&limit=50" \
  -H "Authorization: Bearer ALICE_TOKEN"

# Get page 2 (next 10 messages)
curl -X GET "http://localhost:6000/api/chat/CHAT_ID/messages?page=2&limit=50" \
  -H "Authorization: Bearer ALICE_TOKEN"
```

Verify `hasMore` field in pagination response.

## Test 9: Error Handling

### Test unauthorized access
```bash
# Try to access chat without auth
curl -X GET http://localhost:6000/api/chat

# Try to send message to chat you're not part of
curl -X POST http://localhost:6000/api/chat/INVALID_CHAT_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -d '{"content": "test"}'
```

Expected: 401 or 403 error responses

### Test invalid data
```bash
# Empty message content
curl -X POST http://localhost:6000/api/chat/CHAT_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -d '{"content": ""}'
```

Expected: 400 error response

## Test 10: Concurrent Users

Open multiple terminal windows and run socket clients simultaneously. Verify:
- All clients receive messages in real-time
- No duplicate messages
- Messages are delivered in correct order
- Socket connections remain stable

## Success Criteria

✅ Users can register and login successfully
✅ JWT tokens are generated and validated
✅ Chats can be created with multiple participants
✅ Messages sent via REST API are persisted in database
✅ Messages sent via Socket.IO are persisted in database
✅ lastMessage is updated correctly
✅ All participants receive real-time message notifications
✅ Socket connections require valid JWT token
✅ Invalid tokens are rejected
✅ Message history is retrieved with pagination
✅ Users cannot access chats they're not part of
✅ Error handling works correctly

## Troubleshooting

### Server won't start
- Check MongoDB connection string
- Verify port 6000 is not in use
- Check Node.js version (should be 14+)

### Socket connection fails
- Verify server is running
- Check JWT token is valid
- Check CORS configuration

### Messages not persisting
- Check MongoDB connection
- Verify user is participant in chat
- Check server logs for errors

### Frontend issues
- Run `flutter pub get` again
- Check Flutter version (should be 3.9+)
- Verify base URL is correct
- Check device/emulator network access
