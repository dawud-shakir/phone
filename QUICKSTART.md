# ParkSpot - Quick Start Guide

Welcome to ParkSpot! This guide will help you get started with the parking spot reservation application.

## What is ParkSpot?

ParkSpot is a mobile application that connects drivers who need parking spots with drivers who can hold those spots. Similar to Uber, but for parking:

1. **User** requests a parking spot at their destination
2. **Driver** accepts the request and drives to the location
3. **Driver** parks in the spot and waits
4. **User** arrives and swaps places with the driver
5. **Driver** gets paid for holding the spot

## Getting Started

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Start the Backend Server

```bash
cd backend
node parking-server.js
```

You should see:
```
WARNING: Using auto-generated JWT secret. Set JWT_SECRET environment variable in production!
Server running on http://localhost:3000
WebSocket server ready
```

Keep this terminal window open.

### 3. Start the Mobile App

In a new terminal:

```bash
# For iOS
npm run ios

# For Android
npm run android
```

## Using the App

### Sign Up

1. When the app launches, you'll see the login screen
2. Tap "Don't have an account? Sign Up"
3. Fill in your details:
   - Full Name
   - Email
   - Phone Number
   - Password (min 8 chars, must include uppercase, lowercase, and number)
4. Choose your role:
   - **Find Parking**: You're looking for parking spots (User)
   - **Be a Driver**: You'll hold spots for others (Driver)
5. Tap "Sign Up"

### As a User (Looking for Parking)

1. After logging in, you'll see the User Dashboard
2. Tap "Request Parking Spot" to create a reservation
3. The app will automatically:
   - Use your current location (mock in demo)
   - Send the request to nearby available drivers
4. When a driver accepts:
   - You'll see their name and status
   - Track the reservation progress through statuses:
     - **ACCEPTED**: Driver is heading to the spot
     - **NAVIGATING**: Driver is on the way
     - **SECURED**: Driver has parked in your spot!
     - **WAITING**: Driver is waiting for you
5. When you arrive, tap "I've Arrived" to start the swap
6. After the swap is complete, the driver will mark it as **COMPLETED**

### As a Driver (Holding Spots)

1. After logging in, you'll see the Driver Dashboard
2. Toggle the "Available" switch to start receiving requests
3. When a user requests a spot:
   - You'll see it in "Available Requests"
   - View the location and price
   - Tap "Accept" to take the request
4. Update your status as you progress:
   - **Start Navigation**: Heading to the location
   - **Spot Secured**: You've parked in the spot
   - The app automatically sets to **WAITING** when spot is secured
   - When the user arrives, they'll indicate arrival
   - **Complete Swap**: Finish the reservation and get paid!
5. Your earnings will be tracked in the dashboard
6. Toggle "Available" off when you want to stop receiving requests

## Key Features

### Real-Time Updates
- Both users and drivers get instant updates via WebSocket
- See status changes immediately
- Know when the other party takes action

### Messaging (Backend Ready)
- The backend supports in-app messaging
- Send messages related to a reservation
- Future UI updates will expose this feature

### Ratings & Reviews (Backend Ready)
- The backend supports submitting reviews after completing a reservation
- Rate your experience from 1-5 stars
- Add optional comments
- Future UI updates will expose this feature

## Configuration

### For Physical Devices

Update the API endpoints in `src/services/parkingApi.ts`:

```typescript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api';
const WS_URL = 'http://YOUR_COMPUTER_IP:3000';
```

Replace `YOUR_COMPUTER_IP` with your computer's local IP address (e.g., `192.168.1.100`).

### For Android Emulator

```typescript
const API_BASE_URL = 'http://10.0.2.2:3000/api';
const WS_URL = 'http://10.0.2.2:3000';
```

## Troubleshooting

### "Cannot connect to server"
- Make sure the backend server is running (`node parking-server.js`)
- Check that the API URL is correct for your setup
- For physical devices, ensure your phone and computer are on the same network

### "WebSocket disconnected"
- The backend might have crashed, check the backend terminal
- Restart the backend server
- The app will automatically reconnect

### "No drivers available"
- In the demo, create a second account with the "Driver" role
- Toggle the driver's availability to "On"
- Make sure the driver has a valid location

## Security Notes

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Production Deployment
Before deploying to production:
1. Set a secure `JWT_SECRET` environment variable
2. Configure `ALLOWED_ORIGINS` for CORS
3. Add rate limiting to prevent abuse
4. Consider using a real database instead of JSON files
5. Implement actual payment processing
6. Add real-time GPS tracking
7. Implement push notifications

## Architecture

### Backend
- **Express.js**: REST API server
- **Socket.IO**: Real-time WebSocket communication
- **JWT**: Secure authentication
- **bcrypt**: Password hashing
- **JSON files**: Data storage (demo only)

### Frontend
- **React Native**: Cross-platform mobile framework
- **TypeScript**: Type-safe development
- **Socket.IO Client**: Real-time updates

## Data Storage

All data is stored in `backend/data/` as JSON files:
- `users.json`: User accounts and profiles
- `drivers.json`: Driver-specific information
- `reservations.json`: Parking reservations
- `messages.json`: In-app messages
- `reviews.json`: User reviews and ratings

## Next Steps

### Suggested Enhancements
1. **Map Integration**: Add real map view with react-native-maps
2. **Real GPS**: Use device geolocation API
3. **Push Notifications**: Alert users when status changes
4. **Payment Integration**: Stripe or similar payment processor
5. **Photo Upload**: Upload parking spot photos
6. **Messaging UI**: Expose the in-app messaging feature
7. **Review UI**: Add rating and review screens
8. **Driver Photos**: Upload and display driver photos
9. **Vehicle Photos**: Show driver's vehicle in the app
10. **Route Navigation**: Integrate Google Maps/Apple Maps for turn-by-turn directions

## Support

For issues or questions:
1. Check the backend logs in the terminal running `parking-server.js`
2. Check the React Native Metro bundler logs
3. Review the API documentation in `backend/PARKING_API_README.md`
4. Ensure all dependencies are installed correctly

## License

This is a demo application for educational purposes.

---

**Happy Parking! 🚗 🅿️**
