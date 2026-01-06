import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;
  String _baseUrl = 'http://localhost:6000/api';

  void setToken(String token) {
    _token = token;
  }

  void setBaseUrl(String url) {
    _baseUrl = url;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _token = data['token'];
      return data;
    } else {
      throw Exception('Login failed: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      _token = data['token'];
      return data;
    } else {
      throw Exception('Registration failed: ${response.body}');
    }
  }

  Future<List<dynamic>> getChats() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/chat'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load chats: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> createChat(List<String> participants, {String? name, String type = 'private'}) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/chat'),
      headers: _headers,
      body: jsonEncode({
        'participants': participants,
        'name': name,
        'type': type,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create chat: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> getMessages(String chatId, {int page = 1, int limit = 50}) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/chat/$chatId/messages?page=$page&limit=$limit'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load messages: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> postMessage(String chatId, String content, {List<Map<String, dynamic>>? attachments}) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/chat/$chatId/messages'),
      headers: _headers,
      body: jsonEncode({
        'content': content,
        'attachments': attachments ?? [],
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to send message: ${response.body}');
    }
  }
}
