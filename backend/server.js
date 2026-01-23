const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'photos.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize data file if it doesn't exist
function initializeDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      photos: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Read photos data
function readPhotosData() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Write photos data
function writePhotosData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// API Endpoints

// GET: Fetch random dog photo with current vote stats
app.get('/api/photos/random', (req, res) => {
  try {
    const data = readPhotosData();
    
    if (data.photos.length === 0) {
      return res.status(404).json({ error: 'No photos available' });
    }
    
    // Get random photo
    const randomIndex = Math.floor(Math.random() * data.photos.length);
    const photo = data.photos[randomIndex];
    
    res.json(photo);
  } catch (error) {
    console.error('Error fetching random photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Submit a vote for a photo
app.post('/api/photos/:id/vote', (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body; // 'like' or 'dislike'
    
    if (vote !== 'like' && vote !== 'dislike') {
      return res.status(400).json({ error: 'Invalid vote. Must be "like" or "dislike"' });
    }
    
    const data = readPhotosData();
    const photo = data.photos.find(p => p.id === id);
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // Update vote count
    if (vote === 'like') {
      photo.likes += 1;
    } else {
      photo.dislikes += 1;
    }
    
    writePhotosData(data);
    
    res.json(photo);
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Upload a new dog photo
app.post('/api/photos/upload', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const data = readPhotosData();
    
    const newPhoto = {
      id: uuidv4(),
      imageUrl: `/uploads/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      uploadedAt: new Date().toISOString()
    };
    
    data.photos.push(newPhoto);
    writePhotosData(data);
    
    res.status(201).json(newPhoto);
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get all photos (for debugging)
app.get('/api/photos', (req, res) => {
  try {
    const data = readPhotosData();
    res.json(data.photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize and start server
initializeDataFile();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Upload directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`Data file: ${DATA_FILE}`);
});
