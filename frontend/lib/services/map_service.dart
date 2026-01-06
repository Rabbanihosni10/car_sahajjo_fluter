import 'api_service.dart';

class MapService {
  final ApiService _apiService;
  
  MapService(this._apiService);
  
  /// Get nearby service centers based on current location
  /// [lat] - Latitude of current location
  /// [lng] - Longitude of current location
  /// [maxDistance] - Maximum distance in meters (default: 5000)
  Future<List<dynamic>> getNearbyServices(
    double lat,
    double lng, {
    int maxDistance = 5000,
  }) async {
    try {
      final endpoint = '/api/services/nearby?lat=$lat&lng=$lng&maxDistance=$maxDistance';
      final response = await _apiService.get(endpoint);
      
      if (response is List) {
        return response;
      }
      return [];
    } catch (e) {
      throw Exception('Failed to get nearby services: $e');
    }
  }
  
  /// Get directions from origin to destination
  /// [origin] - Map with 'lat' and 'lng' keys
  /// [destination] - Map with 'lat' and 'lng' keys
  Future<Map<String, dynamic>> getDirections(
    Map<String, double> origin,
    Map<String, double> destination,
  ) async {
    try {
      final data = {
        'origin': origin,
        'destination': destination,
      };
      
      final response = await _apiService.post(
        '/api/directions',
        data,
        includeAuth: true,
      );
      
      return response as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to get directions: $e');
    }
  }
}
