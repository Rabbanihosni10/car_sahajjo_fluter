# Car Sahajjo Backend

Backend API for the Car Sahajjo Flutter application.

## Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Google Maps API Key (with Directions API enabled)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the backend directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=6000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
JWT_SECRET=your_jwt_secret_key
```

### Getting Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Directions API
   - Maps SDK for Android
   - Maps SDK for iOS
4. Create credentials (API Key)
5. **Important**: Enable billing for your Google Cloud project (required for Directions API)
6. Recommended: Restrict your API key by IP address or application

### Database Setup

Seed the database with sample service centers:

```bash
npm run seed
```

This will create sample service centers around Dhaka, Bangladesh.

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:6000` by default.

## API Endpoints

### Health Check
- **GET** `/health` - Check server status

### Services
- **GET** `/api/services/nearby?lat={latitude}&lng={longitude}&maxDistance={meters}` - Get nearby service centers
  - Query Parameters:
    - `lat`: Latitude (required)
    - `lng`: Longitude (required)
    - `maxDistance`: Maximum distance in meters (default: 5000)

### Directions
- **POST** `/api/directions` - Get directions between two points (Protected)
  - Headers:
    - `Authorization: Bearer {token}` (required)
  - Body:
    ```json
    {
      "origin": {
        "lat": 23.8103,
        "lng": 90.4125
      },
      "destination": {
        "lat": 23.7805,
        "lng": 90.4125
      }
    }
    ```
  - Response:
    ```json
    {
      "polyline": "encoded_polyline_string",
      "distance": {
        "text": "5.2 km",
        "value": 5234
      },
      "duration": {
        "text": "15 mins",
        "value": 900
      },
      "steps": [...]
    }
    ```

## Testing

Test the nearby services endpoint:
```bash
curl "http://localhost:6000/api/services/nearby?lat=23.8103&lng=90.4125&maxDistance=5000"
```

Test the directions endpoint (requires authentication token):
```bash
curl -X POST http://localhost:6000/api/directions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "origin": {"lat": 23.8103, "lng": 90.4125},
    "destination": {"lat": 23.7805, "lng": 90.4125}
  }'
```

## Project Structure

```
backend/
├── middleware/
│   └── authenticate.js      # JWT authentication middleware
├── models/
│   └── ServiceCenter.js     # ServiceCenter mongoose model
├── routes/
│   ├── directions.js        # Directions API routes
│   └── services.js          # Service center routes
├── scripts/
│   └── seed_service_centers.js  # Database seeding script
├── .env                     # Environment variables (not in git)
├── package.json             # Dependencies and scripts
├── server.js                # Main application entry point
└── README.md                # This file
```

## Notes

- The Directions API endpoint is protected and requires a valid JWT token
- The Google Maps API key is kept secret on the server side
- Service center locations use GeoJSON format with coordinates as [longitude, latitude]
- The geospatial index on the location field enables efficient nearby queries
