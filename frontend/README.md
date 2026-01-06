# Car Sahajjo Frontend

Flutter mobile application for the Car Sahajjo service platform.

## Features

- **Map View**: Display nearby service centers on Google Maps
- **Traffic Overlay**: Real-time traffic information on the map
- **Location Services**: Get user's current location with permission handling
- **Service Center Markers**: View service center locations on the map
- **Directions**: Get turn-by-turn directions to service centers
- **Route Polyline**: Visual route display on the map
- **Service Details**: View service center information in a bottom sheet

## Prerequisites

- Flutter SDK (3.9.2 or higher)
- Dart SDK
- Android Studio / Xcode for platform-specific development
- Google Maps API Key

## Setup

### 1. Install Dependencies

```bash
flutter pub get
```

### 2. Configure Google Maps API Key

#### For Android:

1. Open `android/app/src/main/AndroidManifest.xml`
2. Add the following inside the `<application>` tag:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_ANDROID_API_KEY"/>
```

3. Make sure you have the following permissions in the manifest:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```

#### For iOS:

1. Open `ios/Runner/AppDelegate.swift`
2. Add the following import at the top:

```swift
import GoogleMaps
```

3. Add the following in the `application` method before `return`:

```swift
GMSServices.provideAPIKey("YOUR_IOS_API_KEY")
```

4. Open `ios/Runner/Info.plist` and add:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to your location to show nearby service centers.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>This app needs access to your location to show nearby service centers.</string>
```

### 3. Configure Backend URL

Update the backend URL in `lib/services/api_service.dart`:

```dart
static const String baseUrl = 'http://your-backend-url:6000';
```

For local development:
- Android Emulator: `http://10.0.2.2:6000`
- iOS Simulator: `http://localhost:6000`
- Physical Device: Use your computer's IP address, e.g., `http://192.168.1.100:6000`

### 4. Getting Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Directions API (for the backend)
4. Create credentials (API Key)
5. **Important**: Restrict your API keys:
   - For Android: Restrict by package name and SHA-1 certificate fingerprint
   - For iOS: Restrict by iOS bundle identifier
6. **Enable billing** for your Google Cloud project (required for API usage)

#### Getting Android SHA-1 Certificate Fingerprint:

For debug builds:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

For release builds, use your release keystore.

## Running the App

### Development Mode:

```bash
flutter run
```

### Build for Android:

```bash
flutter build apk
# or for release
flutter build apk --release
```

### Build for iOS:

```bash
flutter build ios
# or for release
flutter build ios --release
```

## Project Structure

```
lib/
├── main.dart                    # App entry point
├── screens/
│   ├── home_screen.dart        # Home screen with tabs and explore view
│   └── map_screen.dart         # Map screen with Google Maps integration
├── services/
│   ├── api_service.dart        # Base API service for HTTP requests
│   └── map_service.dart        # Map-specific API calls (nearby services, directions)
└── models/                      # Data models (future expansion)
```

## Testing

### Location Permissions

When testing the app, make sure to:
1. Grant location permissions when prompted
2. Enable location services on your device/emulator
3. For emulators, you can set a custom location in the emulator controls

### Testing with Backend

1. Make sure the backend server is running
2. Update the `baseUrl` in `api_service.dart` to point to your backend
3. For the directions feature, you'll need a valid JWT token (set via `ApiService.setAuthToken()`)

## Common Issues

### Map Not Showing
- Verify your Google Maps API key is correctly configured
- Check that the Maps SDK for your platform is enabled in Google Cloud Console
- Ensure billing is enabled for your Google Cloud project

### Location Permission Denied
- Check that location permissions are requested in AndroidManifest.xml and Info.plist
- Grant location permissions in device settings
- For emulators, ensure location services are enabled

### Backend Connection Failed
- Verify the backend URL is correct
- Check that the backend server is running
- For physical devices, ensure they're on the same network as your development machine
- Check firewall settings

### Directions Not Working
- Ensure you have a valid JWT token set
- Verify the Directions API is enabled in Google Cloud Console
- Check that the backend has the correct Google Maps API key configured

## Dependencies

- `google_maps_flutter`: ^2.5.0 - Google Maps integration
- `geolocator`: ^10.1.0 - Location services and permissions
- `flutter_polyline_points`: ^2.0.0 - Decode Google Maps polylines
- `http`: ^1.1.0 - HTTP requests to backend API

## License

This project is part of the Car Sahajjo application.

