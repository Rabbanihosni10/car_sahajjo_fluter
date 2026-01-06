import 'package:flutter/material.dart';
import '../services/socket_service.dart';
import '../services/api_service.dart';

class ChatScreen extends StatefulWidget {
  final String chatId;
  final String token;
  final String serverUrl;

  const ChatScreen({
    super.key,
    required this.chatId,
    required this.token,
    this.serverUrl = 'http://localhost:6000',
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final SocketService _socketService = SocketService();
  final ApiService _apiService = ApiService();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isLoading = true;
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      // Set API token and base URL
      _apiService.setToken(widget.token);
      _apiService.setBaseUrl('${widget.serverUrl}/api');

      // Connect to Socket.IO
      _socketService.connect(widget.serverUrl, widget.token);

      // Join the chat room
      _socketService.joinChat(widget.chatId);

      // Listen for incoming messages
      _socketService.messages.listen((data) {
        if (data['chatId'] == widget.chatId) {
          setState(() {
            _messages.add(data['message']);
          });
          _scrollToBottom();
        }
      });

      // Load message history
      await _loadMessages();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _loadMessages() async {
    try {
      setState(() => _isLoading = true);

      final response = await _apiService.getMessages(widget.chatId);
      final messages = response['messages'] as List<dynamic>;

      setState(() {
        _messages.clear();
        _messages.addAll(messages.map((m) => m as Map<String, dynamic>));
        _isLoading = false;
      });

      _scrollToBottom();
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load messages: $e')),
        );
      }
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      });
    }
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty || _isSending) {
      return;
    }

    final content = _messageController.text.trim();
    _messageController.clear();

    setState(() => _isSending = true);

    try {
      // Send via Socket.IO for real-time delivery
      _socketService.sendMessage(widget.chatId, content);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send message: $e')),
        );
      }
    } finally {
      setState(() => _isSending = false);
    }
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
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _messages.isEmpty
                    ? const Center(child: Text('No messages yet'))
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(8),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final message = _messages[index];
                          return _buildMessageBubble(message);
                        },
                      ),
          ),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> message) {
    final content = message['content'] ?? '';
    final timestamp = message['timestamp'];
    final senderId = message['sender'];

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                content,
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 4),
              Text(
                timestamp != null
                    ? _formatTimestamp(timestamp)
                    : 'Just now',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, -3),
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
                  horizontal: 16,
                  vertical: 12,
                ),
              ),
              onSubmitted: (_) => _sendMessage(),
              enabled: !_isSending,
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: _isSending
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.send),
            onPressed: _isSending ? null : _sendMessage,
            color: Theme.of(context).colorScheme.primary,
          ),
        ],
      ),
    );
  }

  String _formatTimestamp(dynamic timestamp) {
    try {
      final DateTime dt = DateTime.parse(timestamp.toString());
      final now = DateTime.now();
      final diff = now.difference(dt);

      if (diff.inDays > 0) {
        return '${diff.inDays}d ago';
      } else if (diff.inHours > 0) {
        return '${diff.inHours}h ago';
      } else if (diff.inMinutes > 0) {
        return '${diff.inMinutes}m ago';
      } else {
        return 'Just now';
      }
    } catch (e) {
      return timestamp.toString();
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
