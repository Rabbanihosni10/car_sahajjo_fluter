import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(AppConfig.tokenKey);
  }

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConfig.tokenKey, token);
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConfig.tokenKey);
  }

  Map<String, String> _getHeaders({bool needsAuth = true}) {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (needsAuth && _token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    
    return headers;
  }

  Future<Map<String, dynamic>> _handleResponse(http.Response response) async {
    final body = json.decode(response.body);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else {
      throw ApiException(
        message: body['message'] ?? 'An error occurred',
        statusCode: response.statusCode,
      );
    }
  }

  // GET request
  Future<Map<String, dynamic>> get(
    String endpoint, {
    Map<String, dynamic>? queryParams,
    bool needsAuth = true,
  }) async {
    try {
      String url = '${AppConfig.baseUrl}$endpoint';
      
      if (queryParams != null && queryParams.isNotEmpty) {
        final query = queryParams.entries
            .map((e) => '${e.key}=${Uri.encodeComponent(e.value.toString())}')
            .join('&');
        url += '?$query';
      }
      
      final response = await http.get(
        Uri.parse(url),
        headers: _getHeaders(needsAuth: needsAuth),
      );
      
      return await _handleResponse(response);
    } catch (e) {
      rethrow;
    }
  }

  // POST request
  Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> data, {
    bool needsAuth = true,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}$endpoint'),
        headers: _getHeaders(needsAuth: needsAuth),
        body: json.encode(data),
      );
      
      return await _handleResponse(response);
    } catch (e) {
      rethrow;
    }
  }

  // PUT request
  Future<Map<String, dynamic>> put(
    String endpoint,
    Map<String, dynamic> data, {
    bool needsAuth = true,
  }) async {
    try {
      final response = await http.put(
        Uri.parse('${AppConfig.baseUrl}$endpoint'),
        headers: _getHeaders(needsAuth: needsAuth),
        body: json.encode(data),
      );
      
      return await _handleResponse(response);
    } catch (e) {
      rethrow;
    }
  }

  // DELETE request
  Future<Map<String, dynamic>> delete(
    String endpoint, {
    bool needsAuth = true,
  }) async {
    try {
      final response = await http.delete(
        Uri.parse('${AppConfig.baseUrl}$endpoint'),
        headers: _getHeaders(needsAuth: needsAuth),
      );
      
      return await _handleResponse(response);
    } catch (e) {
      rethrow;
    }
  }

  // Upload file
  Future<Map<String, dynamic>> uploadFile(
    String endpoint,
    String fieldName,
    String filePath, {
    Map<String, dynamic>? data,
  }) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${AppConfig.baseUrl}$endpoint'),
      );
      
      request.headers.addAll(_getHeaders());
      request.files.add(await http.MultipartFile.fromPath(fieldName, filePath));
      
      if (data != null) {
        data.forEach((key, value) {
          request.fields[key] = value.toString();
        });
      }
      
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      
      return await _handleResponse(response);
    } catch (e) {
      rethrow;
    }
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException({required this.message, required this.statusCode});

  @override
  String toString() => message;
}
