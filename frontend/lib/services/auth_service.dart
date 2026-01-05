import '../models/user.dart';
import '../config/app_config.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String role,
  }) async {
    try {
      final response = await _api.post(
        '${AppConfig.authEndpoint}/register',
        {
          'name': name,
          'email': email,
          'password': password,
          'phone': phone,
          'role': role,
        },
        needsAuth: false,
      );
      
      if (response['success'] == true) {
        await _api.setToken(response['token']);
        return response;
      } else {
        throw Exception(response['message'] ?? 'Registration failed');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _api.post(
        '${AppConfig.authEndpoint}/login',
        {
          'email': email,
          'password': password,
        },
        needsAuth: false,
      );
      
      if (response['success'] == true) {
        await _api.setToken(response['token']);
        return response;
      } else {
        throw Exception(response['message'] ?? 'Login failed');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<User> getCurrentUser() async {
    try {
      final response = await _api.get('${AppConfig.authEndpoint}/me');
      
      if (response['success'] == true) {
        return User.fromJson(response['user']);
      } else {
        throw Exception(response['message'] ?? 'Failed to get user');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    await _api.clearToken();
  }

  Future<String> refreshToken() async {
    try {
      final response = await _api.post('${AppConfig.authEndpoint}/refresh', {});
      
      if (response['success'] == true) {
        await _api.setToken(response['token']);
        return response['token'];
      } else {
        throw Exception('Token refresh failed');
      }
    } catch (e) {
      rethrow;
    }
  }
}
