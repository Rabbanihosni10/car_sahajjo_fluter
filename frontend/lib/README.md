# Chat Feature Implementation

This directory contains the Flutter implementation of the real-time chat feature.

## Files

### `services/socket_service.dart`
Singleton service for managing Socket.IO connections.

**Features:**
- Connect/disconnect from Socket.IO server
- Join/leave chat rooms
- Send messages in real-time
- Receive message stream
- Typing indicators
- Automatic reconnection handling

**Usage:**
```dart
final socketService = SocketService();

// Connect to server
socketService.connect('http://localhost:6000', token: 'your-jwt-token');

// Join a chat
socketService.joinChat('chatId');

// Listen for messages
socketService.messages.listen((data) {
  print('New message: ${data['message']}');
});

// Send a message
socketService.sendMessage(
  chatId: 'chatId',
  userId: 'userId',
  content: 'Hello!',
);

// Cleanup
socketService.leaveChat('chatId');
socketService.disconnect();
```

### `screens/chat_screen.dart`
Chat UI screen with message history and real-time messaging.

**Features:**
- Load paginated message history from REST API
- Real-time message updates via Socket.IO
- Send messages with socket service
- Auto-scroll to latest messages
- Display sender name and timestamp
- Visual distinction between sent and received messages

**Usage:**
```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => ChatScreen(
      chatId: 'chat-id',
      userId: 'user-id',
      serverUrl: 'http://localhost:6000',
      token: 'jwt-token',
    ),
  ),
);
```

## Dependencies

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  socket_io_client: ^2.0.3+1
  http: ^1.1.0
```

## Configuration

Update the server URL in your app:

```dart
const String serverUrl = 'http://your-server-url:6000';
```

For production, use environment variables or a config file.

## Integration

1. Ensure the backend server is running
2. Obtain a JWT token from your authentication flow
3. Pass the token when connecting to the socket service
4. Navigate to ChatScreen with required parameters

## Notes

- Socket connection is managed as a singleton
- Messages are streamed via broadcast stream
- Message history is loaded via REST API on screen init
- Real-time messages are received via Socket.IO
- Both socket and REST messages use the same data structure
