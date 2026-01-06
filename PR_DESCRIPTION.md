# PR: Add MapScreen with nearby services, traffic overlay, and directions (server proxy)

## Overview
This PR implements a complete map feature for the Car Sahajjo Flutter application, including:
- MapScreen with Google Maps integration
- Backend API for service centers and directions
- Traffic overlay on the map
- Directions from user location to service centers
- Server-side proxy for Google Directions API

## Changes Made

### Backend

#### New Files
1. **backend/server.js** - Main Express server with MongoDB connection
2. **backend/models/ServiceCenter.js** - Mongoose model for service centers with geospatial indexing
3. **backend/routes/services.js** - API endpoint for nearby service centers (`GET /api/services/nearby`)
4. **backend/routes/directions.js** - Protected API endpoint for directions (`POST /api/directions`)
5. **backend/middleware/authenticate.js** - JWT authentication middleware
6. **backend/scripts/seed_service_centers.js** - Script to populate sample service centers around Dhaka
7. **backend/.env.example** - Environment variables template
8. **backend/.gitignore** - Ignore node_modules, .env, and other generated files
9. **backend/README.md** - Complete setup and usage documentation

#### Modified Files
- **backend/package.json** - Added dependencies: axios, mongoose, jsonwebtoken, dotenv

### Frontend

#### New Files
1. **frontend/lib/screens/map_screen.dart** - MapScreen widget with:
   - Google Maps integration
   - Current location tracking
   - Nearby service center markers
   - Traffic overlay
   - Direction polyline drawing
   - Bottom sheet for service details
   
2. **frontend/lib/screens/home_screen.dart** - HomeScreen with bottom navigation and ExploreTab

3. **frontend/lib/services/api_service.dart** - Base API service for HTTP requests with JWT support

4. **frontend/lib/services/map_service.dart** - Map-specific API methods:
   - `getNearbyServices()` - Fetch nearby service centers
   - `getDirections()` - Get directions with route polyline

#### Modified Files
- **frontend/lib/main.dart** - Updated to use HomeScreen instead of demo counter app
- **frontend/pubspec.yaml** - Added dependencies:
  - google_maps_flutter: ^2.5.0
  - geolocator: ^10.1.0
  - flutter_polyline_points: ^2.0.0
  - http: ^1.1.0
- **frontend/README.md** - Complete setup documentation with API key configuration

## API Endpoints

### GET /api/services/nearby
Get nearby service centers based on location.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `maxDistance` (optional): Maximum distance in meters (default: 5000)

**Response:**
```json
[
  {
    "_id": "...",
    "name": "Dhaka Auto Care",
    "address": "Gulshan 1, Dhaka",
    "phone": "+880-1234-567890",
    "services": ["Oil Change", "Brake Service", ...],
    "location": {
      "type": "Point",
      "coordinates": [90.4125, 23.7805]
    },
    "rating": 4.5
  }
]
```

### POST /api/directions (Protected)
Get directions from origin to destination via Google Directions API.

**Headers:**
- `Authorization: Bearer {jwt_token}` (required)

**Request Body:**
```json
{
  "origin": {"lat": 23.8103, "lng": 90.4125},
  "destination": {"lat": 23.7805, "lng": 90.4125}
}
```

**Response:**
```json
{
  "polyline": "encoded_polyline_string",
  "distance": {"text": "5.2 km", "value": 5234},
  "duration": {"text": "15 mins", "value": 900},
  "steps": [...]
}
```

## Testing Steps

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   Create `backend/.env` with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=6000
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Seed the database:**
   ```bash
   npm run seed
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

5. **Test endpoints:**
   ```bash
   # Test nearby services
   curl "http://localhost:6000/api/services/nearby?lat=23.8103&lng=90.4125&maxDistance=5000"
   
   # Test directions (requires JWT token)
   curl -X POST http://localhost:6000/api/directions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"origin": {"lat": 23.8103, "lng": 90.4125}, "destination": {"lat": 23.7805, "lng": 90.4125}}'
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   flutter pub get
   ```

2. **Configure Google Maps API Key:**

   **For Android:**
   Edit `android/app/src/main/AndroidManifest.xml` and add inside `<application>`:
   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_ANDROID_API_KEY"/>
   ```
   
   Add permissions:
   ```xml
   <uses-permission android:name="android.permission.INTERNET"/>
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
   ```

   **For iOS:**
   Edit `ios/Runner/AppDelegate.swift` and add:
   ```swift
   import GoogleMaps
   
   // In application method:
   GMSServices.provideAPIKey("YOUR_IOS_API_KEY")
   ```
   
   Edit `ios/Runner/Info.plist` and add:
   ```xml
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>This app needs access to your location to show nearby service centers.</string>
   ```

3. **Update backend URL:**
   Edit `frontend/lib/services/api_service.dart`:
   ```dart
   static const String baseUrl = 'http://10.0.2.2:6000'; // For Android Emulator
   // OR
   static const String baseUrl = 'http://localhost:6000'; // For iOS Simulator
   ```

4. **Run the app:**
   ```bash
   flutter run
   ```

5. **Test the map feature:**
   - Open the app
   - Navigate to Explore tab
   - Tap on "Find Service Centers" card
   - Allow location permissions when prompted
   - Verify markers appear for service centers
   - Tap a marker to see details
   - Press "Navigate" to draw route (requires JWT token set in app)

## Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. **Enable APIs:**
   - Maps SDK for Android
   - Maps SDK for iOS
   - Directions API
4. **Create API Keys:**
   - One for Android (restricted by package name and SHA-1)
   - One for iOS (restricted by bundle identifier)
   - One for backend server (restricted by IP or no restrictions for development)
5. **Enable billing** (required for Directions API)

### Getting Android SHA-1:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

## Features Implemented

✅ **Backend:**
- Express server with MongoDB
- ServiceCenter model with geospatial indexing
- GET /api/services/nearby endpoint
- POST /api/directions endpoint (protected with JWT)
- Seed script for sample data (8 service centers around Dhaka)
- Server-side Google Directions API proxy
- JWT authentication middleware

✅ **Frontend:**
- MapScreen with Google Maps
- Current location tracking with permissions
- Nearby service center markers
- Traffic overlay enabled
- Marker tap to show bottom sheet with details
- Navigate button to draw route
- Polyline rendering for directions
- Camera animation to show full route
- Error handling and loading states

## Security Considerations

- Google Maps API key is kept secret on server side
- Directions endpoint is protected with JWT authentication
- Environment variables used for sensitive data
- API key restrictions recommended for production

## Notes

- The traffic overlay is client-side via Google Maps
- For real-time traffic incident data, a paid provider would be needed
- Sample service centers are around Dhaka, Bangladesh (23.8103° N, 90.4125° E)
- The app requires location permissions to function
- Billing must be enabled in Google Cloud Console for Directions API

## Future Improvements

- Implement user authentication system
- Add more service centers
- Implement booking functionality
- Add reviews and ratings system
- Real-time traffic incident alerts
- Push notifications for booking updates
- Service center filtering by service type
- Distance and ETA display on markers
