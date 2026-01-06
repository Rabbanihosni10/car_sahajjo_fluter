import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;

/// Singleton service for managing Socket.IO connections
class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  final StreamController<Map<String, dynamic>> _messageController =
      StreamController<Map<String, dynamic>>.broadcast();

  /// Stream of incoming messages
  Stream<Map<String, dynamic>> get messages => _messageController.stream;

  /// Check if socket is connected
  bool get isConnected => _socket?.connected ?? false;

  /// Connect to Socket.IO server
  void connect(String serverUrl, {String? token}) {
    if (_socket != null && _socket!.connected) {
      return; // Already connected
    }

    _socket = IO.io(
      serverUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setExtraHeaders({'Authorization': token != null ? 'Bearer $token' : ''})
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) {
      print('Socket connected');
    });

    _socket!.onDisconnect((_) {
      print('Socket disconnected');
    });

    _socket!.on('receive-message', (data) {
      print('Message received: $data');
      _messageController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on('user-typing', (data) {
      print('User typing: $data');
    });

    _socket!.on('error', (error) {
      print('Socket error: $error');
    });
  }

  /// Disconnect from Socket.IO server
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  /// Join a chat room
  void joinChat(String chatId) {
    if (_socket == null || !_socket!.connected) {
      print('Socket not connected, cannot join chat');
      return;
    }
    _socket!.emit('join-chat', chatId);
    print('Joined chat: $chatId');
  }

  /// Leave a chat room
  void leaveChat(String chatId) {
    if (_socket == null || !_socket!.connected) {
      print('Socket not connected, cannot leave chat');
      return;
    }
    _socket!.emit('leave-chat', chatId);
    print('Left chat: $chatId');
  }

  /// Send a message to a chat
  void sendMessage({
    required String chatId,
    required String userId,
    required String content,
    List<Map<String, dynamic>>? attachments,
  }) {
    if (_socket == null || !_socket!.connected) {
      print('Socket not connected, cannot send message');
      return;
    }

    final message = {
      'chatId': chatId,
      'userId': userId,
      'content': content,
      'attachments': attachments ?? [],
    };

    _socket!.emit('send-message', message);
    print('Message sent: $content');
  }

  /// Emit typing indicator
  void emitTyping(String chatId, String userId, bool isTyping) {
    if (_socket == null || !_socket!.connected) {
      return;
    }

    _socket!.emit('typing', {
      'chatId': chatId,
      'userId': userId,
      'isTyping': isTyping,
    });
  }

  /// Dispose the service
  void dispose() {
    disconnect();
    _messageController.close();
  }
}
