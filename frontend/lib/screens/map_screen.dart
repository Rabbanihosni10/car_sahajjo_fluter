import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import '../services/api_service.dart';
import '../services/map_service.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _servicecenters = [];
  dynamic _selectedCenter;
  
  late MapService _mapService;
  
  @override
  void initState() {
    super.initState();
    _mapService = MapService(ApiService());
    _initializeMap();
  }
  
  Future<void> _initializeMap() async {
    try {
      // Check and request location permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _errorMessage = 'Location permissions are denied';
            _isLoading = false;
          });
          return;
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _errorMessage = 'Location permissions are permanently denied';
          _isLoading = false;
        });
        return;
      }
      
      // Get current location
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      setState(() {
        _currentPosition = position;
      });
      
      // Load nearby service centers
      await _loadNearbyServices();
      
      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to get location: $e';
        _isLoading = false;
      });
    }
  }
  
  Future<void> _loadNearbyServices() async {
    if (_currentPosition == null) return;
    
    try {
      final services = await _mapService.getNearbyServices(
        _currentPosition!.latitude,
        _currentPosition!.longitude,
        maxDistance: 10000, // 10km
      );
      
      setState(() {
        _servicecenters = services;
        _updateMarkers();
      });
    } catch (e) {
      print('Error loading services: $e');
    }
  }
  
  void _updateMarkers() {
    _markers.clear();
    
    // Add current location marker
    if (_currentPosition != null) {
      _markers.add(
        Marker(
          markerId: const MarkerId('current_location'),
          position: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
          infoWindow: const InfoWindow(title: 'Your Location'),
        ),
      );
    }
    
    // Add service center markers
    for (var center in _servicecenters) {
      final location = center['location'];
      if (location != null && location['coordinates'] != null) {
        final coordinates = location['coordinates'] as List;
        final lng = coordinates[0];
        final lat = coordinates[1];
        
        _markers.add(
          Marker(
            markerId: MarkerId(center['_id']),
            position: LatLng(lat, lng),
            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
            infoWindow: InfoWindow(
              title: center['name'],
              snippet: center['address'],
            ),
            onTap: () => _onMarkerTapped(center),
          ),
        );
      }
    }
  }
  
  void _onMarkerTapped(dynamic center) {
    setState(() {
      _selectedCenter = center;
    });
    _showServiceCenterBottomSheet(center);
  }
  
  void _showServiceCenterBottomSheet(dynamic center) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                center['name'] ?? 'Service Center',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                center['address'] ?? '',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
              if (center['phone'] != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.phone, size: 16),
                    const SizedBox(width: 4),
                    Text(center['phone']),
                  ],
                ),
              ],
              if (center['rating'] != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.star, size: 16, color: Colors.amber),
                    const SizedBox(width: 4),
                    Text('${center['rating']} / 5.0'),
                  ],
                ),
              ],
              if (center['services'] != null && (center['services'] as List).isNotEmpty) ...[
                const SizedBox(height: 8),
                const Text(
                  'Services:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                Wrap(
                  spacing: 8,
                  children: (center['services'] as List)
                      .map((service) => Chip(
                            label: Text(service.toString()),
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ))
                      .toList(),
                ),
              ],
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    _navigateToCenter(center);
                  },
                  icon: const Icon(Icons.directions),
                  label: const Text('Navigate'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
  
  Future<void> _navigateToCenter(dynamic center) async {
    if (_currentPosition == null) return;
    
    try {
      setState(() {
        _isLoading = true;
      });
      
      final location = center['location'];
      final coordinates = location['coordinates'] as List;
      final destLng = coordinates[0] as double;
      final destLat = coordinates[1] as double;
      
      final directions = await _mapService.getDirections(
        {
          'lat': _currentPosition!.latitude,
          'lng': _currentPosition!.longitude,
        },
        {
          'lat': destLat,
          'lng': destLng,
        },
      );
      
      // Decode polyline
      final polylinePoints = PolylinePoints();
      final result = polylinePoints.decodePolyline(directions['polyline']);
      
      final polylineCoordinates = result
          .map((point) => LatLng(point.latitude, point.longitude))
          .toList();
      
      // Add polyline to map
      setState(() {
        _polylines.clear();
        _polylines.add(
          Polyline(
            polylineId: const PolylineId('route'),
            points: polylineCoordinates,
            color: Colors.blue,
            width: 5,
          ),
        );
        _isLoading = false;
      });
      
      // Adjust camera to show full route
      if (_mapController != null) {
        final bounds = _calculateBounds(polylineCoordinates);
        _mapController!.animateCamera(
          CameraUpdate.newLatLngBounds(bounds, 50),
        );
      }
      
      // Show route info
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Route: ${directions['distance']['text']} - ${directions['duration']['text']}',
            ),
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to get directions: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
  
  LatLngBounds _calculateBounds(List<LatLng> points) {
    double? minLat, maxLat, minLng, maxLng;
    
    for (var point in points) {
      minLat = minLat == null ? point.latitude : (point.latitude < minLat ? point.latitude : minLat);
      maxLat = maxLat == null ? point.latitude : (point.latitude > maxLat ? point.latitude : maxLat);
      minLng = minLng == null ? point.longitude : (point.longitude < minLng ? point.longitude : minLng);
      maxLng = maxLng == null ? point.longitude : (point.longitude > maxLng ? point.longitude : maxLng);
    }
    
    return LatLngBounds(
      southwest: LatLng(minLat!, minLng!),
      northeast: LatLng(maxLat!, maxLng!),
    );
  }
  
  void _clearRoute() {
    setState(() {
      _polylines.clear();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Service Centers'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          if (_polylines.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: _clearRoute,
              tooltip: 'Clear Route',
            ),
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: () {
              if (_currentPosition != null && _mapController != null) {
                _mapController!.animateCamera(
                  CameraUpdate.newLatLngZoom(
                    LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                    14,
                  ),
                );
              }
            },
            tooltip: 'My Location',
          ),
        ],
      ),
      body: Stack(
        children: [
          if (_isLoading)
            const Center(child: CircularProgressIndicator())
          else if (_errorMessage != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: Colors.red),
                    const SizedBox(height: 16),
                    Text(
                      _errorMessage!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 16),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _initializeMap,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            )
          else if (_currentPosition != null)
            GoogleMap(
              initialCameraPosition: CameraPosition(
                target: LatLng(
                  _currentPosition!.latitude,
                  _currentPosition!.longitude,
                ),
                zoom: 14,
              ),
              markers: _markers,
              polylines: _polylines,
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
              trafficEnabled: true,
              onMapCreated: (controller) {
                _mapController = controller;
              },
            ),
          if (_isLoading)
            Container(
              color: Colors.black.withOpacity(0.3),
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }
  
  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
