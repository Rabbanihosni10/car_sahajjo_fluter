import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  final _messageController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get messages => _messageController.stream;

  bool get isConnected => _socket?.connected ?? false;

  void connect(String url, String token) {
    if (_socket?.connected ?? false) {
      return;
    }

    _socket = IO.io(
      url,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _socket!.onConnect((_) {
      print('Socket connected');
    });

    _socket!.on('receive-message', (data) {
      _messageController.add(data as Map<String, dynamic>);
    });

    _socket!.on('error', (error) {
      print('Socket error: $error');
    });

    _socket!.onDisconnect((_) {
      print('Socket disconnected');
    });

    _socket!.onConnectError((error) {
      print('Connection error: $error');
    });
  }

  void joinChat(String chatId) {
    if (_socket?.connected ?? false) {
      _socket!.emit('join-chat', chatId);
    }
  }

  void sendMessage(String chatId, String content, {List<Map<String, dynamic>>? attachments}) {
    if (_socket?.connected ?? false) {
      _socket!.emit('send-message', {
        'chatId': chatId,
        'content': content,
        'attachments': attachments ?? [],
      });
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  void dispose() {
    disconnect();
    _messageController.close();
  }
}
