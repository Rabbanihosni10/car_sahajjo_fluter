import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class ChatApiService {
  static final ChatApiService _instance = ChatApiService._internal();
  factory ChatApiService() => _instance;
  ChatApiService._internal();

  final AuthService _authService = AuthService();

  /// Get all chats for the authenticated user
  Future<Map<String, dynamic>> getChats(String baseUrl) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/chat'),
        headers: _authService.getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to fetch chats'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Create a new chat
  Future<Map<String, dynamic>> createChat({
    required String baseUrl,
    required List<String> participantIds,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/chat'),
        headers: _authService.getHeaders(),
        body: jsonEncode({'participantIds': participantIds}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to create chat'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Get paginated messages for a chat
  Future<Map<String, dynamic>> getMessages({
    required String baseUrl,
    required String chatId,
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/chat/$chatId/messages?page=$page&limit=$limit'),
        headers: _authService.getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to fetch messages'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }

  /// Send a message via REST API
  Future<Map<String, dynamic>> sendMessage({
    required String baseUrl,
    required String chatId,
    required String content,
    List<Map<String, String>>? attachments,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/chat/$chatId/messages'),
        headers: _authService.getHeaders(),
        body: jsonEncode({
          'content': content,
          'attachments': attachments ?? [],
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to send message'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: $e'};
    }
  }
}
