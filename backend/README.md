# Dog Voting App - Backend Server

Backend API server for the dog photo voting application.

## Features

- RESTful API endpoints for photo voting
- File upload handling for dog photos
- Vote tracking and statistics
- Random photo selection
- JSON-based data persistence

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### 1. Get Random Photo
```
GET /api/photos/random
```

Returns a random dog photo with vote statistics.

**Response:**
```json
{
  "id": "uuid",
  "imageUrl": "/uploads/filename.jpg",
  "likes": 10,
  "dislikes": 5,
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Submit Vote
```
POST /api/photos/:id/vote
```

Submit a like or dislike vote for a photo.

**Request Body:**
```json
{
  "vote": "like" // or "dislike"
}
```

**Response:**
```json
{
  "id": "uuid",
  "imageUrl": "/uploads/filename.jpg",
  "likes": 11,
  "dislikes": 5,
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. Upload Photo
```
POST /api/photos/upload
```

Upload a new dog photo.

**Request:** Multipart form data with field name `photo`

**Response:**
```json
{
  "id": "uuid",
  "imageUrl": "/uploads/filename.jpg",
  "likes": 0,
  "dislikes": 0,
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Get All Photos (Debug)
```
GET /api/photos
```

Returns all photos in the database.

### 5. Health Check
```
GET /api/health
```

Server health check endpoint.

## Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── data/             # JSON data storage
│   └── photos.json   # Photos database
├── uploads/          # Uploaded images
└── README.md         # This file
```

## Adding Sample Photos

To add initial sample photos for testing:

1. Place dog photo images in the `uploads/` directory
2. Manually edit `data/photos.json` to add entries, or use the upload API endpoint

Example `photos.json`:
```json
{
  "photos": [
    {
      "id": "sample-1",
      "imageUrl": "/uploads/dog1.jpg",
      "likes": 0,
      "dislikes": 0,
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Configuration

- **Port**: Set via `PORT` environment variable (default: 3000)
- **Upload Limit**: 10MB per file
- **Allowed File Types**: JPEG, JPG, PNG, GIF

## CORS

CORS is enabled for all origins to allow the React Native app to connect from any device.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created (upload)
- `400`: Bad request
- `404`: Not found
- `500`: Server error
