import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../config/app_config.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final ApiService _apiService = ApiService();

  User? _user;
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;

  Future<void> init() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.init();
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(AppConfig.tokenKey);

      if (token != null) {
        _user = await _authService.getCurrentUser();
        _isAuthenticated = true;
      }
    } catch (e) {
      _isAuthenticated = false;
      _user = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String role,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.register(
        name: name,
        email: email,
        password: password,
        phone: phone,
        role: role,
      );

      _user = User.fromJson(response['user']);
      _isAuthenticated = true;
      
      // Save user data
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConfig.userKey, _user!.toJson().toString());

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.login(
        email: email,
        password: password,
      );

      _user = User.fromJson(response['user']);
      _isAuthenticated = true;
      
      // Save user data
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConfig.userKey, _user!.toJson().toString());

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.logout();
      
      // Clear user data
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(AppConfig.userKey);
      
      _user = null;
      _isAuthenticated = false;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> refreshUser() async {
    try {
      _user = await _authService.getCurrentUser();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
