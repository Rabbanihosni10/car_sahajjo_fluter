import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Update this URL based on your environment:
  // - Android Emulator: 'http://10.0.2.2:6000'
  // - iOS Simulator: 'http://localhost:6000'
  // - Physical Device: 'http://YOUR_MACHINE_IP:6000'
  static const String baseUrl = 'http://10.0.2.2:6000';
  
  String? _authToken;
  
  void setAuthToken(String token) {
    _authToken = token;
  }
  
  String? getAuthToken() {
    return _authToken;
  }
  
  Map<String, String> _getHeaders({bool includeAuth = false}) {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth && _authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    
    return headers;
  }
  
  Future<dynamic> get(String endpoint, {bool includeAuth = false}) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final response = await http.get(
        url,
        headers: _getHeaders(includeAuth: includeAuth),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load data: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
  
  Future<dynamic> post(String endpoint, Map<String, dynamic> data, {bool includeAuth = false}) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final response = await http.post(
        url,
        headers: _getHeaders(includeAuth: includeAuth),
        body: json.encode(data),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final errorBody = json.decode(response.body);
        throw Exception(errorBody['error'] ?? 'Request failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
