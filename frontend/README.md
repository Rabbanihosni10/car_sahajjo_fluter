# Car Sahajjo Frontend

Flutter frontend for Car Sahajjo with real-time chat support.

## Features

- **Real-time Messaging**: Socket.IO client for instant chat
- **REST API Integration**: HTTP client for chat operations
- **JWT Authentication**: Secure authentication with backend
- **Chat UI**: Minimal chat screen with message history and live updates

## Setup

1. Install Flutter dependencies:
```bash
flutter pub get
```

2. Update the base URL in your code to point to your backend server (default: `http://localhost:6000`)

3. Run the app:
```bash
flutter run
```

## Services

### SocketService
Singleton service for Socket.IO connection management.

**Methods:**
- `connect(serverUrl, token)` - Connect to Socket.IO with JWT
- `joinChat(chatId)` - Join a chat room
- `leaveChat(chatId)` - Leave a chat room
- `sendMessage({chatId, content, attachments})` - Send a message
- `disconnect()` - Disconnect socket

**Streams:**
- `messageStream` - Listen for incoming messages
- `errorStream` - Listen for errors

### AuthService
Singleton service for user authentication.

**Methods:**
- `register({baseUrl, username, email, password})` - Register new user
- `login({baseUrl, email, password})` - Login user
- `logout()` - Logout user
- `getHeaders()` - Get authorization headers

**Properties:**
- `token` - Current JWT token
- `user` - Current user data
- `isAuthenticated` - Authentication status

### ChatApiService
Singleton service for chat REST API operations.

**Methods:**
- `getChats(baseUrl)` - Get all chats
- `createChat({baseUrl, participantIds})` - Create a new chat
- `getMessages({baseUrl, chatId, page, limit})` - Get paginated messages
- `sendMessage({baseUrl, chatId, content, attachments})` - Send message via REST

## Usage Example

### Authentication
```dart
import 'package:frontend/services/auth_service.dart';

final authService = AuthService();

// Login
final result = await authService.login(
  baseUrl: 'http://localhost:6000',
  email: 'user@test.com',
  password: 'password123',
);

if (result['success']) {
  print('Logged in: ${authService.user}');
  print('Token: ${authService.token}');
}
```

### Socket Connection
```dart
import 'package:frontend/services/socket_service.dart';

final socketService = SocketService();

// Connect with JWT token
socketService.connect('http://localhost:6000', authService.token!);

// Join a chat
socketService.joinChat('chat-id-here');

// Listen for messages
socketService.messageStream.listen((data) {
  print('New message: ${data['message']['content']}');
});

// Send a message
socketService.sendMessage(
  chatId: 'chat-id-here',
  content: 'Hello!',
);
```

### Chat Screen
```dart
import 'package:frontend/screens/chat_screen.dart';

// Navigate to chat screen
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => ChatScreen(
      chatId: 'chat-id-here',
      baseUrl: 'http://localhost:6000',
    ),
  ),
);
```

## Project Structure

```
frontend/lib/
├── services/
│   ├── socket_service.dart      # Socket.IO client wrapper
│   ├── auth_service.dart        # Authentication service
│   └── chat_api_service.dart    # Chat REST API service
├── screens/
│   └── chat_screen.dart         # Chat UI screen
└── main.dart                     # App entry point
```

## Dependencies

```yaml
dependencies:
  socket_io_client: ^2.0.3+1  # Socket.IO client
  http: ^1.1.0                # HTTP client for REST API
```

## Testing

1. Start the backend server
2. Register two users using the backend API
3. Create a chat between the two users
4. Connect both clients to the chat
5. Send messages and verify:
   - Messages appear in real-time on both clients
   - Messages are persisted in the database
   - Message history loads correctly

## Notes

- The socket service is a singleton, only one connection per app
- Always connect to socket before joining chat rooms
- Remember to leave chat rooms when disposing screens
- Token must be valid for socket authentication
- Handle error streams to show user-friendly messages

---

## Original Flutter Documentation

A new Flutter project.

### Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
