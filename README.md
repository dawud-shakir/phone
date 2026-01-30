# ParkSpot - Parking Spot Reservation App

A mobile application similar to Uber, but for parking spot reservations. Drivers physically hold parking spots for users by parking their cars in those spots until the user arrives to swap.

## Features

### User Side
- **Request Parking Spots**: Request a parking spot at your desired location
- **Find Available Drivers**: See drivers who can hold spots nearby
- **Real-time Updates**: Get live status updates on your reservation
- **Track Spot Status**: Know when your spot is secured
- **Easy Swap**: Indicate arrival and complete the swap seamlessly

### Driver Side
- **Accept Requests**: Accept parking spot reservation requests
- **Navigate to Spot**: Get directions to the requested location
- **Confirm Secured Spot**: Mark when you've parked and secured the spot
- **Wait for User**: Stay in the spot until the user arrives
- **Earn Money**: Track earnings from completed reservations
- **Availability Toggle**: Control when you're available for requests

### Core Features
- User authentication (signup/login)
- Dual role support (users and drivers)
- Real-time reservation status tracking
- In-app messaging capabilities
- Rating and review system
- Payment tracking
- Mobile-friendly interface
- WebSocket-based real-time updates

## Architecture

This project consists of two parts:
1. **Backend Server** (Node.js/Express with Socket.IO): Handles authentication, reservations, real-time updates, and API endpoints
2. **Frontend App** (React Native): Cross-platform mobile application for iOS and Android

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm** or **yarn**: Package manager
- **React Native CLI**: Installed globally or use npx
- **For iOS Development**:
  - macOS
  - Xcode (latest version)
  - CocoaPods
- **For Android Development**:
  - Android Studio
  - Android SDK
  - Java Development Kit (JDK)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Start the parking reservation server:
```bash
node parking-server.js
```

The server will run on `http://localhost:3000` with WebSocket support. Keep this running in a separate terminal.

### Frontend Setup

1. From the project root, install frontend dependencies:
```bash
npm install
```

2. For iOS, install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

## Running the Application

**Important**: Make sure the backend server is running before starting the app!

### iOS (iPhone)

```bash
npm run ios
```

To run on a specific simulator:
```bash
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Android (Google)

Make sure you have an Android emulator running or a device connected.

```bash
npm run android
```

**Note for Android Emulator**: The app is configured to connect to `localhost:3000`. If the backend is running on your host machine, you may need to update the API URL in `src/services/api.ts` to use `10.0.2.2:3000` instead of `localhost:3000`.

**Note for Physical Devices**: Update the `API_BASE_URL` in `src/services/api.ts` to use your computer's local network IP address (e.g., `http://192.168.1.100:3000/api`).

### Metro Bundler

Start the Metro bundler separately (optional):
```bash
npm start
```

## Usage

1. **Start Backend**: Run `node parking-server.js` in the `backend/` directory
2. **Start App**: Run `npm run ios` or `npm run android` from the project root
3. **Sign Up**: Create an account as either a user or driver
4. **For Users**:
   - Request a parking spot at your desired location
   - Wait for a driver to accept your request
   - Get real-time updates on spot status
   - Navigate to the spot when secured
   - Indicate arrival to complete the swap
5. **For Drivers**:
   - Toggle availability to receive requests
   - Accept parking requests
   - Navigate to and secure the spot
   - Wait for user arrival
   - Complete the swap and earn money

## API Configuration

The app connects to the backend server at `http://localhost:3000/api` by default.

To change this (e.g., for physical devices):
1. Open `src/services/parkingApi.ts`
2. Update the `API_BASE_URL` and `WS_URL` constants with your server's address

Examples:
- Android Emulator: `http://10.0.2.2:3000/api`
- Physical Device: `http://YOUR_COMPUTER_IP:3000/api` (e.g., `http://192.168.1.100:3000/api`)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/dawud-shakir/phone.git
cd phone
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. For iOS, install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

## Running the Application

### iOS (iPhone)

```bash
npm run ios
# or
yarn ios
```

To run on a specific simulator:
```bash
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Android (Google)

Make sure you have an Android emulator running or a device connected.

```bash
npm run android
# or
yarn android
```

### Metro Bundler

Start the Metro bundler separately (optional):
```bash
npm start
# or
yarn start
```

## Development

### Linting

```bash
npm run lint
# or
yarn lint
```

### Testing

```bash
npm test
# or
yarn test
```

## Project Structure

```
phone/
├── backend/                      # Backend server
│   ├── parking-server.js         # Express + Socket.IO server with API endpoints
│   ├── server.js                 # Legacy dog voting server
│   ├── package.json              # Backend dependencies
│   ├── data/                     # JSON data storage
│   │   ├── users.json            # User accounts
│   │   ├── reservations.json     # Parking reservations
│   │   ├── drivers.json          # Driver profiles
│   │   ├── reviews.json          # User reviews
│   │   └── messages.json         # In-app messages
│   └── README.md                 # Backend documentation
├── src/                          # Frontend source code
│   ├── components/               # React Native components
│   │   ├── LoginScreen.tsx       # Authentication screens
│   │   ├── UserDashboard.tsx     # User interface
│   │   └── DriverDashboard.tsx   # Driver interface
│   ├── services/                 # API services
│   │   ├── parkingApi.ts         # Parking API client
│   │   └── api.ts                # Legacy API client
│   └── types/                    # TypeScript definitions
│       ├── parking.ts            # Parking app types
│       └── index.ts              # Legacy types
├── android/                      # Android-specific code
├── ios/                          # iOS-specific code
├── __tests__/                    # Test files
├── App.tsx                       # Main application component
├── index.js                      # Application entry point
├── package.json                  # Frontend dependencies
└── README.md                     # This file
```

## Backend API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login to existing account

### User Profile
- `GET /api/users/profile` - Get current user profile

### Driver Operations
- `GET /api/drivers/nearby` - Get available drivers near location
- `PUT /api/drivers/location` - Update driver location
- `PUT /api/drivers/availability` - Toggle driver availability
- `PUT /api/drivers/vehicle` - Update vehicle information
- `GET /api/drivers/profile` - Get driver profile

### Reservations
- `POST /api/reservations` - Create a parking reservation request
- `GET /api/reservations` - Get user's reservations
- `GET /api/reservations/active` - Get active reservations
- `PUT /api/reservations/:id/status` - Update reservation status
- `POST /api/reservations/:id/accept` - Accept a reservation (driver)

### Messaging
- `POST /api/messages` - Send a message
- `GET /api/messages/:reservationId` - Get messages for a reservation

### Reviews
- `POST /api/reviews` - Submit a review
- `GET /api/reviews/user/:userId` - Get reviews for a user

### WebSocket Events
- `new-reservation` - Emitted when a new reservation is created
- `reservation-updated` - Emitted when a reservation status changes
- `driver-location-updated` - Emitted when a driver's location updates
- `new-message` - Emitted when a new message is sent

## Development