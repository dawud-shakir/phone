const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('WARNING: Using auto-generated JWT secret. Set JWT_SECRET environment variable in production!');
  return require('crypto').randomBytes(32).toString('hex');
})();

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');
const DRIVERS_FILE = path.join(DATA_DIR, 'drivers.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json());

// Initialize data files
function initializeDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const files = {
    [USERS_FILE]: { users: [] },
    [RESERVATIONS_FILE]: { reservations: [] },
    [DRIVERS_FILE]: { drivers: [] },
    [REVIEWS_FILE]: { reviews: [] },
    [MESSAGES_FILE]: { messages: [] }
  };

  for (const [file, initialData] of Object.entries(files)) {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(initialData, null, 2));
    }
  }
}

// Helper functions to read/write data
function readData(file) {
  const data = fs.readFileSync(file, 'utf8');
  return JSON.parse(data);
}

function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate password strength
function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}

// Helper function to validate coordinates
function validateCoordinates(latitude, longitude) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lon)) {
    return 'Invalid coordinates';
  }
  if (lat < -90 || lat > 90) {
    return 'Latitude must be between -90 and 90';
  }
  if (lon < -180 || lon > 180) {
    return 'Longitude must be between -180 and 180';
  }
  return null;
}

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ========== Authentication Endpoints ==========

// POST: User signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password || !name || !phone || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    if (role !== 'user' && role !== 'driver') {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "driver"' });
    }

    const usersData = readData(USERS_FILE);
    
    // Check if user already exists
    if (usersData.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      phone,
      role,
      rating: 5.0,
      totalRatings: 0,
      createdAt: new Date().toISOString()
    };

    usersData.users.push(newUser);
    writeData(USERS_FILE, usersData);

    // If driver, create driver profile
    if (role === 'driver') {
      const driversData = readData(DRIVERS_FILE);
      const newDriver = {
        id: uuidv4(),
        userId,
        name,
        rating: 5.0,
        currentLocation: { latitude: 0, longitude: 0 },
        isAvailable: true,
        vehicleInfo: {
          make: '',
          model: '',
          color: '',
          licensePlate: ''
        },
        earnings: 0
      };
      driversData.drivers.push(newDriver);
      writeData(DRIVERS_FILE, driversData);
    }

    const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
    
    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const usersData = readData(USERS_FILE);
    const user = usersData.users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== User Profile Endpoints ==========

// GET: Get user profile
app.get('/api/users/profile', authenticateToken, (req, res) => {
  try {
    const usersData = readData(USERS_FILE);
    const user = usersData.users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== Driver Endpoints ==========

// GET: Get available drivers near location
app.get('/api/drivers/nearby', authenticateToken, (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // radius in meters

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const driversData = readData(DRIVERS_FILE);
    const availableDrivers = driversData.drivers.filter(d => d.isAvailable);

    // Simple distance calculation (in a real app, use proper geospatial queries)
    const nearby = availableDrivers.filter(driver => {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        driver.currentLocation.latitude,
        driver.currentLocation.longitude
      );
      return distance <= parseFloat(radius);
    });

    res.json(nearby);
  } catch (error) {
    console.error('Error fetching nearby drivers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT: Update driver location
app.put('/api/drivers/location', authenticateToken, (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const coordError = validateCoordinates(latitude, longitude);
    if (coordError) {
      return res.status(400).json({ error: coordError });
    }

    const driversData = readData(DRIVERS_FILE);
    const driver = driversData.drivers.find(d => d.userId === req.user.id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    driver.currentLocation = { latitude, longitude };
    writeData(DRIVERS_FILE, driversData);

    // Emit location update via socket
    io.emit('driver-location-updated', { driverId: driver.id, location: driver.currentLocation });

    res.json(driver);
  } catch (error) {
    console.error('Error updating driver location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT: Update driver availability
app.put('/api/drivers/availability', authenticateToken, (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ error: 'isAvailable must be a boolean' });
    }

    const driversData = readData(DRIVERS_FILE);
    const driver = driversData.drivers.find(d => d.userId === req.user.id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    driver.isAvailable = isAvailable;
    writeData(DRIVERS_FILE, driversData);

    res.json(driver);
  } catch (error) {
    console.error('Error updating driver availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT: Update driver vehicle info
app.put('/api/drivers/vehicle', authenticateToken, (req, res) => {
  try {
    const { make, model, color, licensePlate } = req.body;

    const driversData = readData(DRIVERS_FILE);
    const driver = driversData.drivers.find(d => d.userId === req.user.id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    driver.vehicleInfo = { make, model, color, licensePlate };
    writeData(DRIVERS_FILE, driversData);

    res.json(driver);
  } catch (error) {
    console.error('Error updating vehicle info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get driver profile
app.get('/api/drivers/profile', authenticateToken, (req, res) => {
  try {
    const driversData = readData(DRIVERS_FILE);
    const driver = driversData.drivers.find(d => d.userId === req.user.id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    res.json(driver);
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== Reservation Endpoints ==========

// POST: Create a parking reservation request
app.post('/api/reservations', authenticateToken, (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const coordError = validateCoordinates(latitude, longitude);
    if (coordError) {
      return res.status(400).json({ error: coordError });
    }

    const usersData = readData(USERS_FILE);
    const user = usersData.users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const reservationsData = readData(RESERVATIONS_FILE);

    const newReservation = {
      id: uuidv4(),
      userId: req.user.id,
      userName: user.name,
      location: { latitude, longitude, address },
      status: 'pending',
      requestedAt: new Date().toISOString(),
      price: 10.00 // Base price, can be dynamic based on location/time
    };

    reservationsData.reservations.push(newReservation);
    writeData(RESERVATIONS_FILE, reservationsData);

    // Emit new reservation to available drivers
    io.emit('new-reservation', newReservation);

    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get user's reservations
app.get('/api/reservations', authenticateToken, (req, res) => {
  try {
    const reservationsData = readData(RESERVATIONS_FILE);
    const userReservations = reservationsData.reservations.filter(
      r => r.userId === req.user.id || r.driverId === req.user.id
    );

    res.json(userReservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get active reservations (for drivers)
app.get('/api/reservations/active', authenticateToken, (req, res) => {
  try {
    const reservationsData = readData(RESERVATIONS_FILE);
    const activeReservations = reservationsData.reservations.filter(
      r => r.status === 'pending' || (r.driverId === req.user.id && r.status !== 'completed' && r.status !== 'cancelled')
    );

    res.json(activeReservations);
  } catch (error) {
    console.error('Error fetching active reservations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT: Update reservation status
app.put('/api/reservations/:id/status', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'navigating', 'secured', 'waiting', 'swapping', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const reservationsData = readData(RESERVATIONS_FILE);
    const reservation = reservationsData.reservations.find(r => r.id === id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Authorization check
    if (reservation.userId !== req.user.id && reservation.driverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this reservation' });
    }

    reservation.status = status;

    if (status === 'accepted' && !reservation.acceptedAt) {
      reservation.acceptedAt = new Date().toISOString();
    } else if (status === 'secured' && !reservation.securedAt) {
      reservation.securedAt = new Date().toISOString();
    } else if (status === 'completed' && !reservation.completedAt) {
      reservation.completedAt = new Date().toISOString();
    }

    writeData(RESERVATIONS_FILE, reservationsData);

    // Emit status update via socket
    io.emit('reservation-updated', reservation);

    res.json(reservation);
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Accept a reservation (driver)
app.post('/api/reservations/:id/accept', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const driversData = readData(DRIVERS_FILE);
    const driver = driversData.drivers.find(d => d.userId === req.user.id);

    if (!driver) {
      return res.status(403).json({ error: 'Only drivers can accept reservations' });
    }

    const reservationsData = readData(RESERVATIONS_FILE);
    const reservation = reservationsData.reservations.find(r => r.id === id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ error: 'Reservation is no longer available' });
    }

    reservation.driverId = req.user.id;
    reservation.driverName = driver.name;
    reservation.status = 'accepted';
    reservation.acceptedAt = new Date().toISOString();

    driver.isAvailable = false;
    
    writeData(RESERVATIONS_FILE, reservationsData);
    writeData(DRIVERS_FILE, driversData);

    // Emit update to user
    io.emit('reservation-updated', reservation);

    res.json(reservation);
  } catch (error) {
    console.error('Error accepting reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== Messaging Endpoints ==========

// POST: Send a message
app.post('/api/messages', authenticateToken, (req, res) => {
  try {
    const { reservationId, text } = req.body;

    if (!reservationId || !text) {
      return res.status(400).json({ error: 'Reservation ID and text are required' });
    }

    const usersData = readData(USERS_FILE);
    const user = usersData.users.find(u => u.id === req.user.id);

    const messagesData = readData(MESSAGES_FILE);

    const newMessage = {
      id: uuidv4(),
      reservationId,
      senderId: req.user.id,
      senderName: user.name,
      text,
      timestamp: new Date().toISOString()
    };

    messagesData.messages.push(newMessage);
    writeData(MESSAGES_FILE, messagesData);

    // Emit message via socket
    io.emit('new-message', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get messages for a reservation
app.get('/api/messages/:reservationId', authenticateToken, (req, res) => {
  try {
    const { reservationId } = req.params;

    const messagesData = readData(MESSAGES_FILE);
    const messages = messagesData.messages.filter(m => m.reservationId === reservationId);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== Review Endpoints ==========

// POST: Submit a review
app.post('/api/reviews', authenticateToken, (req, res) => {
  try {
    const { reservationId, reviewedUserId, rating, comment } = req.body;

    if (!reservationId || !reviewedUserId || rating === undefined) {
      return res.status(400).json({ error: 'Reservation ID, reviewed user ID, and rating are required' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    const reviewsData = readData(REVIEWS_FILE);

    // Check if review already exists
    if (reviewsData.reviews.find(r => r.reservationId === reservationId && r.reviewerId === req.user.id)) {
      return res.status(400).json({ error: 'Review already submitted for this reservation' });
    }

    const newReview = {
      id: uuidv4(),
      reservationId,
      reviewerId: req.user.id,
      reviewedUserId,
      rating: numRating,
      comment: comment || '',
      createdAt: new Date().toISOString()
    };

    reviewsData.reviews.push(newReview);
    writeData(REVIEWS_FILE, reviewsData);

    // Update user's rating
    const usersData = readData(USERS_FILE);
    const user = usersData.users.find(u => u.id === reviewedUserId);
    
    if (user) {
      const totalRating = user.rating * user.totalRatings + numRating;
      user.totalRatings += 1;
      user.rating = totalRating / user.totalRatings;
      writeData(USERS_FILE, usersData);
    }

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get reviews for a user
app.get('/api/reviews/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const reviewsData = readData(REVIEWS_FILE);
    const userReviews = reviewsData.reviews.filter(r => r.reviewedUserId === userId);

    res.json(userReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== Utility Functions ==========

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Authenticate socket connection
  socket.on('authenticate', (token) => {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        socket.emit('auth-error', { error: 'Invalid token' });
        socket.disconnect();
      } else {
        socket.userId = user.id;
        socket.emit('authenticated', { userId: user.id });
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('join-reservation', (reservationId) => {
    // Only allow authenticated users to join
    if (!socket.userId) {
      socket.emit('error', { error: 'Not authenticated' });
      return;
    }
    
    // Verify user has access to this reservation
    const reservationsData = readData(RESERVATIONS_FILE);
    const reservation = reservationsData.reservations.find(r => r.id === reservationId);
    
    if (reservation && (reservation.userId === socket.userId || reservation.driverId === socket.userId)) {
      socket.join(reservationId);
      console.log(`Socket ${socket.id} joined reservation ${reservationId}`);
    } else {
      socket.emit('error', { error: 'Unauthorized to join this reservation' });
    }
  });
});

// Initialize and start server
initializeDataFiles();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`Data directory: ${DATA_DIR}`);
});
