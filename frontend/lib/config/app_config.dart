import 'package:flutter/foundation.dart';

class AppConfig {
  // API Configuration
  // NOTE: Update these URLs based on your environment:
  // - For Android Emulator: use http://10.0.2.2:6000/api
  // - For iOS Simulator: use http://localhost:6000/api  
  // - For Physical Device: use http://YOUR_COMPUTER_IP:6000/api
  // - For Production: use your production API URL
  static const String baseUrl = kDebugMode 
      ? 'http://10.0.2.2:6000/api'  // Default for Android Emulator
      : 'https://your-production-api.com/api';
  
  static const String socketUrl = kDebugMode
      ? 'http://10.0.2.2:6000'
      : 'https://your-production-api.com';
  
  // API Endpoints
  static const String authEndpoint = '/auth';
  static const String usersEndpoint = '/users';
  static const String jobsEndpoint = '/jobs';
  static const String carsEndpoint = '/cars';
  static const String bookingsEndpoint = '/bookings';
  static const String productsEndpoint = '/products';
  static const String ordersEndpoint = '/orders';
  static const String paymentsEndpoint = '/payments';
  static const String reviewsEndpoint = '/reviews';
  static const String servicesEndpoint = '/services';
  static const String postsEndpoint = '/posts';
  static const String notificationsEndpoint = '/notifications';
  static const String chatEndpoint = '/chat';
  static const String supportEndpoint = '/support';
  static const String adminEndpoint = '/admin';
  
  // App Info
  static const String appName = 'Car Sahajjo';
  static const String appVersion = '1.0.0';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String themeKey = 'theme_mode';
  
  // Pagination
  static const int pageSize = 20;
  
  // File Upload
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  
  // Map Configuration
  static const double defaultLatitude = 23.8103;
  static const double defaultLongitude = 90.4125;
  static const double defaultZoom = 15.0;
}
