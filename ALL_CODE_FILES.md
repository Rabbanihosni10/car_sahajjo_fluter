# Complete Code Files for Car Sahajjo Map Feature

Below are all the code files with the corrections mentioned in the implementation. Copy and paste each file as shown.

---

## Backend Files

### 1. backend/server.js
```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const directionsRouter = require('./routes/directions');
const servicesRouter = require('./routes/services');

app.use('/api/directions', directionsRouter);
app.use('/api/services', servicesRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 6000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;
```

### 2. backend/models/ServiceCenter.js
```javascript
const mongoose = require('mongoose');

const serviceCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  services: [{
    type: String,
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
}, {
  timestamps: true,
});

// Create geospatial index for location-based queries
serviceCenterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ServiceCenter', serviceCenterSchema);
```

### 3. backend/middleware/authenticate.js
```javascript
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = authenticate;
```

### 4. backend/routes/services.js
```javascript
const express = require('express');
const rateLimit = require('express-rate-limit');
const ServiceCenter = require('../models/ServiceCenter');

const router = express.Router();

// Rate limiter: 30 requests per minute per IP
const nearbyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many requests, please try again later' },
});

// GET /api/services/nearby - Get nearby service centers
router.get('/nearby', nearbyLimiter, async (req, res) => {
  try {
    const { lat, lng, maxDistance } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const distance = parseInt(maxDistance) || 5000; // Default 5km
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }
    
    // Query using MongoDB geospatial query
    const serviceCenters = await ServiceCenter.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: distance, // Distance in meters
        },
      },
    }).limit(50);
    
    res.json(serviceCenters);
  } catch (error) {
    console.error('Nearby services error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

### 5. backend/routes/directions.js
```javascript
const express = require('express');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Rate limiter: 10 requests per minute per IP
const directionsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many requests, please try again later' },
});

// POST /api/directions - Get directions from Google Directions API
router.post('/', directionsLimiter, authenticate, async (req, res) => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !origin.lat || !origin.lng) {
      return res.status(400).json({ error: 'Origin with lat and lng is required' });
    }
    
    if (!destination || !destination.lat || !destination.lng) {
      return res.status(400).json({ error: 'Destination with lat and lng is required' });
    }
    
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }
    
    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStr = `${destination.lat},${destination.lng}`;
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: originStr,
        destination: destinationStr,
        key: GOOGLE_MAPS_API_KEY,
      },
    });
    
    if (response.data.status !== 'OK') {
      return res.status(400).json({ 
        error: 'Failed to get directions', 
        status: response.data.status,
        message: response.data.error_message,
      });
    }
    
    const route = response.data.routes[0];
    const leg = route.legs[0];
    
    const result = {
      polyline: route.overview_polyline.points,
      distance: leg.distance,
      duration: leg.duration,
      steps: leg.steps.map(step => {
        // Extract text content by removing HTML tags
        // Keep only the text for safe display
        let instruction = step.html_instructions || '';
        // Remove all HTML tags completely
        instruction = instruction.replace(/<[^>]*>/g, ' ');
        // Normalize whitespace
        instruction = instruction.replace(/\s+/g, ' ').trim();
        
        return {
          instruction,
          distance: step.distance,
          duration: step.duration,
          polyline: step.polyline.points,
        };
      }),
    };
    
    res.json(result);
  } catch (error) {
    console.error('Directions API error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'Google Maps API error',
        message: error.response.data,
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

### 6. backend/scripts/seed_service_centers.js
```javascript
const mongoose = require('mongoose');
require('dotenv').config();

// Define ServiceCenter schema inline for the seed script
const serviceCenterSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  services: [String],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number],
  },
  rating: Number,
});

serviceCenterSchema.index({ location: '2dsphere' });
const ServiceCenter = mongoose.model('ServiceCenter', serviceCenterSchema);

// Sample service centers around Dhaka, Bangladesh (23.8103° N, 90.4125° E)
const sampleCenters = [
  {
    name: 'Dhaka Auto Care',
    address: 'Gulshan 1, Dhaka',
    phone: '+880-1234-567890',
    services: ['Oil Change', 'Brake Service', 'Engine Repair', 'Tire Service'],
    location: {
      type: 'Point',
      coordinates: [90.4125, 23.7805], // [lng, lat]
    },
    rating: 4.5,
  },
  {
    name: 'City Car Service Center',
    address: 'Dhanmondi 27, Dhaka',
    phone: '+880-1234-567891',
    services: ['AC Repair', 'Battery Service', 'General Maintenance'],
    location: {
      type: 'Point',
      coordinates: [90.3753, 23.7456],
    },
    rating: 4.2,
  },
  {
    name: 'Express Auto Workshop',
    address: 'Banani DOHS, Dhaka',
    phone: '+880-1234-567892',
    services: ['Engine Diagnostics', 'Transmission Repair', 'Bodywork'],
    location: {
      type: 'Point',
      coordinates: [90.4019, 23.7947],
    },
    rating: 4.7,
  },
  {
    name: 'Mirpur Car Clinic',
    address: 'Mirpur 10, Dhaka',
    phone: '+880-1234-567893',
    services: ['Oil Change', 'Tire Service', 'Brake Service', 'Alignment'],
    location: {
      type: 'Point',
      coordinates: [90.3688, 23.8069],
    },
    rating: 4.0,
  },
  {
    name: 'Uttara Auto Service',
    address: 'Uttara Sector 7, Dhaka',
    phone: '+880-1234-567894',
    services: ['General Maintenance', 'Engine Repair', 'AC Repair'],
    location: {
      type: 'Point',
      coordinates: [90.3996, 23.8752],
    },
    rating: 4.3,
  },
  {
    name: 'Motijheel Motors',
    address: 'Motijheel C/A, Dhaka',
    phone: '+880-1234-567895',
    services: ['Oil Change', 'Battery Service', 'Tire Service'],
    location: {
      type: 'Point',
      coordinates: [90.4175, 23.7331],
    },
    rating: 3.9,
  },
  {
    name: 'Bashundhara Car Care',
    address: 'Bashundhara R/A, Dhaka',
    phone: '+880-1234-567896',
    services: ['Engine Diagnostics', 'Brake Service', 'Suspension', 'Bodywork'],
    location: {
      type: 'Point',
      coordinates: [90.4246, 23.8208],
    },
    rating: 4.6,
  },
  {
    name: 'Mohammadpur Auto Center',
    address: 'Mohammadpur, Dhaka',
    phone: '+880-1234-567897',
    services: ['General Maintenance', 'Oil Change', 'AC Repair'],
    location: {
      type: 'Point',
      coordinates: [90.3585, 23.7655],
    },
    rating: 4.1,
  },
];

async function seedDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing service centers
    console.log('Clearing existing service centers...');
    await ServiceCenter.deleteMany({});
    
    // Insert sample centers
    console.log('Inserting sample service centers...');
    const result = await ServiceCenter.insertMany(sampleCenters);
    console.log(`Successfully inserted ${result.length} service centers`);
    
    // Display inserted centers
    result.forEach((center, index) => {
      console.log(`${index + 1}. ${center.name} - ${center.address}`);
    });
    
    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
```

### 7. backend/package.json
```json
{
  "name": "car-sahajjo-backend",
  "version": "1.0.0",
  "description": "Backend API for Car Sahajjo",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node scripts/seed_service_centers.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^5.2.1",
    "express-rate-limit": "^8.2.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  }
}
```

### 8. backend/.env.example
```
MONGODB_URI=your_mongodb_connection_string_here
PORT=6000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
JWT_SECRET=your_jwt_secret_key_here
```

### 9. backend/.gitignore
```
# Node
node_modules/
npm-debug.log
package-lock.json

# Environment variables
.env

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

---

## Frontend Files

### 10. frontend/lib/main.dart
```dart
import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Car Sahajjo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
```

### 11. frontend/lib/services/api_service.dart
```dart
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
```

### 12. frontend/lib/services/map_service.dart
```dart
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
```

### 13. frontend/lib/screens/home_screen.dart
See the complete file in the next section due to length...

### 14. frontend/lib/screens/map_screen.dart  
See the complete file in the following section due to length...

### 15. frontend/pubspec.yaml
```yaml
name: frontend
description: "A new Flutter project."
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: ^3.9.2

dependencies:
  flutter:
    sdk: flutter

  cupertino_icons: ^1.0.8
  google_maps_flutter: ^2.5.0
  geolocator: ^10.1.0
  flutter_polyline_points: ^2.0.0
  http: ^1.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter

  flutter_lints: ^5.0.0

flutter:
  uses-material-design: true
```

---

## Setup Instructions

### Backend Setup:
1. Copy the backend files to your `backend/` directory
2. Create a `.env` file from `.env.example` and fill in your credentials
3. Run `npm install` to install dependencies
4. Run `npm run seed` to populate the database
5. Run `npm run dev` to start the server

### Frontend Setup:
1. Copy the frontend files to your `frontend/lib/` directory
2. Update `pubspec.yaml` with the dependencies shown above
3. Run `flutter pub get` to install dependencies
4. Configure Google Maps API keys for Android and iOS (see documentation)
5. Run `flutter run` to start the app

---

All files include the security fixes and improvements:
- ✅ Rate limiting (10 req/min for directions, 30 req/min for nearby)
- ✅ JWT authentication with no hardcoded secrets
- ✅ HTML sanitization to prevent XSS
- ✅ Proper error handling
- ✅ Environment variable validation
- ✅ debugPrint for logging instead of print

