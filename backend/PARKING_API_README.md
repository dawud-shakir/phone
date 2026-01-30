# ParkSpot Backend Server

Express.js server with Socket.IO for real-time updates, supporting the ParkSpot parking spot reservation application.

## Features

- User authentication (signup/login) with JWT
- Driver and user profile management
- Parking spot reservation system
- Real-time updates via WebSocket
- In-app messaging
- Review and rating system
- Geolocation-based driver matching

## Prerequisites

- Node.js >= 20
- npm

## Installation

```bash
npm install
```

## Running the Server

### Development Mode

```bash
node parking-server.js
```

The server will run on `http://localhost:3000` with WebSocket support.

### Production Mode

Set environment variables:

```bash
PORT=3000 JWT_SECRET=your-secret-key node parking-server.js
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create a new user account
  - Body: `{ email, password, name, phone, role }`
  - Returns: `{ user, token }`

- `POST /api/auth/login` - Login to existing account
  - Body: `{ email, password }`
  - Returns: `{ user, token }`

### User Profile

- `GET /api/users/profile` - Get current user profile (requires auth)
  - Headers: `Authorization: Bearer <token>`
  - Returns: User object

### Driver Operations

- `GET /api/drivers/nearby` - Get available drivers near location
  - Query: `latitude, longitude, radius`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of nearby drivers

- `PUT /api/drivers/location` - Update driver location
  - Body: `{ latitude, longitude }`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Updated driver object

- `PUT /api/drivers/availability` - Toggle driver availability
  - Body: `{ isAvailable: boolean }`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Updated driver object

- `PUT /api/drivers/vehicle` - Update vehicle information
  - Body: `{ make, model, color, licensePlate }`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Updated driver object

- `GET /api/drivers/profile` - Get driver profile
  - Headers: `Authorization: Bearer <token>`
  - Returns: Driver object

### Reservations

- `POST /api/reservations` - Create a parking reservation request
  - Body: `{ latitude, longitude, address }`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Created reservation

- `GET /api/reservations` - Get user's reservations
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of reservations

- `GET /api/reservations/active` - Get active reservations
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of active reservations

- `PUT /api/reservations/:id/status` - Update reservation status
  - Body: `{ status }`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Updated reservation

- `POST /api/reservations/:id/accept` - Accept a reservation (driver)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Updated reservation

### Messaging

- `POST /api/messages` - Send a message
  - Body: `{ reservationId, text }`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Created message

- `GET /api/messages/:reservationId` - Get messages for a reservation
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of messages

### Reviews

- `POST /api/reviews` - Submit a review
  - Body: `{ reservationId, reviewedUserId, rating, comment }`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Created review

- `GET /api/reviews/user/:userId` - Get reviews for a user
  - Returns: Array of reviews

### Health Check

- `GET /api/health` - Server health check
  - Returns: `{ status, timestamp }`

## WebSocket Events

### Client -> Server

- `join-reservation` - Join a reservation room
  - Payload: `reservationId`

### Server -> Client

- `new-reservation` - Emitted when a new reservation is created
  - Payload: Reservation object

- `reservation-updated` - Emitted when a reservation status changes
  - Payload: Updated reservation object

- `driver-location-updated` - Emitted when a driver's location updates
  - Payload: `{ driverId, location }`

- `new-message` - Emitted when a new message is sent
  - Payload: Message object

## Data Storage

Data is stored in JSON files in the `data/` directory:

- `users.json` - User accounts
- `reservations.json` - Parking reservations
- `drivers.json` - Driver profiles
- `reviews.json` - User reviews
- `messages.json` - In-app messages

## Environment Variables

- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT tokens (default: development key)

**Important**: Change the JWT_SECRET in production!

## Security Notes

- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt with salt rounds of 10
- All authenticated endpoints require a valid JWT token
- CORS is enabled for all origins (configure for production)

## Development

The server uses file-based JSON storage for simplicity. For production, consider migrating to a proper database like PostgreSQL or MongoDB.
