import 'package:flutter/material.dart';
import '../services/socket_service.dart';
import '../services/chat_api_service.dart';
import '../services/auth_service.dart';

class ChatScreen extends StatefulWidget {
  final String chatId;
  final String baseUrl;

  const ChatScreen({
    Key? key,
    required this.chatId,
    required this.baseUrl,
  }) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final SocketService _socketService = SocketService();
  final ChatApiService _chatApiService = ChatApiService();
  final AuthService _authService = AuthService();

  List<Map<String, dynamic>> _messages = [];
  bool _isLoading = true;
  bool _isSending = false;
  int _currentPage = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _initializeChat();
  }

  Future<void> _initializeChat() async {
    // Load initial messages
    await _loadMessages();

    // Connect socket if not connected
    if (!_socketService.isConnected) {
      final token = _authService.token;
      if (token != null) {
        _socketService.connect(widget.baseUrl, token);
      }
    }

    // Join the chat room
    _socketService.joinChat(widget.chatId);

    // Listen for incoming messages
    _socketService.messageStream.listen((data) {
      if (data['chatId'] == widget.chatId) {
        setState(() {
          _messages.add(data['message']);
        });
        _scrollToBottom();
      }
    });

    // Listen for errors
    _socketService.errorStream.listen((error) {
      _showError(error);
    });
  }

  Future<void> _loadMessages() async {
    if (!_hasMore) return;

    setState(() {
      _isLoading = true;
    });

    final result = await _chatApiService.getMessages(
      baseUrl: widget.baseUrl,
      chatId: widget.chatId,
      page: _currentPage,
      limit: 50,
    );

    setState(() {
      _isLoading = false;
    });

    if (result['success']) {
      final messages = result['data']['messages'] as List;
      final pagination = result['data']['pagination'];

      setState(() {
        _messages.insertAll(0, messages.cast<Map<String, dynamic>>());
        _hasMore = pagination['hasMore'] ?? false;
        _currentPage++;
      });

      if (_currentPage == 2) {
        _scrollToBottom();
      }
    } else {
      _showError(result['error']);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final content = _messageController.text.trim();
    if (content.isEmpty || _isSending) return;

    setState(() {
      _isSending = true;
    });

    _messageController.clear();

    // Send via Socket.IO
    _socketService.sendMessage(
      chatId: widget.chatId,
      content: content,
    );

    setState(() {
      _isSending = false;
    });
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  Widget _buildMessage(Map<String, dynamic> message) {
    final sender = message['sender'];
    final isMe = sender != null && sender['id'] == _authService.user?['id'];
    final content = message['content'] ?? '';
    final timestamp = message['timestamp'] != null
        ? DateTime.parse(message['timestamp'])
        : DateTime.now();

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
        decoration: BoxDecoration(
          color: isMe ? Colors.blue : Colors.grey[300],
          borderRadius: BorderRadius.circular(16),
        ),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.7,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isMe && sender != null)
              Text(
                sender['username'] ?? 'Unknown',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: isMe ? Colors.white70 : Colors.black54,
                ),
              ),
            const SizedBox(height: 4),
            Text(
              content,
              style: TextStyle(
                color: isMe ? Colors.white : Colors.black87,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}',
              style: TextStyle(
                fontSize: 10,
                color: isMe ? Colors.white70 : Colors.black54,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Column(
        children: [
          // Messages list
          Expanded(
            child: _isLoading && _messages.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    controller: _scrollController,
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      return _buildMessage(_messages[index]);
                    },
                  ),
          ),
          // Message input
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  offset: const Offset(0, -2),
                  blurRadius: 4,
                  color: Colors.black.withOpacity(0.1),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _isSending ? null : _sendMessage,
                  icon: _isSending
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.send),
                  color: Colors.blue,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _socketService.leaveChat(widget.chatId);
    super.dispose();
  }
}
