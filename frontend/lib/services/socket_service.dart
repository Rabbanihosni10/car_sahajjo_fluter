import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  bool _isConnected = false;
  
  final StreamController<Map<String, dynamic>> _messageController =
      StreamController<Map<String, dynamic>>.broadcast();
  
  final StreamController<String> _errorController =
      StreamController<String>.broadcast();

  Stream<Map<String, dynamic>> get messageStream => _messageController.stream;
  Stream<String> get errorStream => _errorController.stream;
  bool get isConnected => _isConnected;

  /// Connect to the Socket.IO server with JWT authentication
  void connect(String serverUrl, String token) {
    if (_isConnected) {
      print('Socket already connected');
      return;
    }

    try {
      _socket = IO.io(
        serverUrl,
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .enableAutoConnect()
            .setAuth({'token': token})
            .build(),
      );

      _socket!.onConnect((_) {
        print('Socket connected successfully');
        _isConnected = true;
      });

      _socket!.onDisconnect((_) {
        print('Socket disconnected');
        _isConnected = false;
      });

      _socket!.onError((error) {
        print('Socket error: $error');
        _errorController.add(error.toString());
      });

      _socket!.onConnectError((error) {
        print('Connection error: $error');
        _errorController.add('Connection error: $error');
        _isConnected = false;
      });

      // Listen for incoming messages
      _socket!.on('receive-message', (data) {
        print('Received message: $data');
        _messageController.add(data as Map<String, dynamic>);
      });

      // Listen for joined-chat confirmation
      _socket!.on('joined-chat', (data) {
        print('Joined chat: $data');
      });

      // Listen for errors from server
      _socket!.on('error', (data) {
        print('Server error: $data');
        if (data is Map<String, dynamic> && data['message'] != null) {
          _errorController.add(data['message']);
        }
      });

    } catch (e) {
      print('Failed to connect socket: $e');
      _errorController.add('Failed to connect: $e');
    }
  }

  /// Join a specific chat room
  void joinChat(String chatId) {
    if (!_isConnected || _socket == null) {
      print('Socket not connected. Cannot join chat.');
      _errorController.add('Socket not connected');
      return;
    }

    _socket!.emit('join-chat', {'chatId': chatId});
    print('Joining chat: $chatId');
  }

  /// Leave a specific chat room
  void leaveChat(String chatId) {
    if (!_isConnected || _socket == null) {
      print('Socket not connected. Cannot leave chat.');
      return;
    }

    _socket!.emit('leave-chat', {'chatId': chatId});
    print('Left chat: $chatId');
  }

  /// Send a message through Socket.IO
  void sendMessage({
    required String chatId,
    required String content,
    List<Map<String, String>>? attachments,
  }) {
    if (!_isConnected || _socket == null) {
      print('Socket not connected. Cannot send message.');
      _errorController.add('Socket not connected');
      return;
    }

    final messageData = {
      'chatId': chatId,
      'content': content,
      'attachments': attachments ?? [],
    };

    _socket!.emit('send-message', messageData);
    print('Sending message to chat $chatId: $content');
  }

  /// Disconnect the socket
  void disconnect() {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
      _isConnected = false;
      print('Socket disconnected and disposed');
    }
  }

  /// Dispose all resources
  void dispose() {
    disconnect();
    _messageController.close();
    _errorController.close();
  }
}
