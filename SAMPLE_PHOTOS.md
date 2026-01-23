# Adding Initial Dog Photos for Testing

There are several ways to add dog photos to the app for testing:

## Option 1: Upload via the App (Recommended)

1. Start the backend server: `cd backend && npm start`
2. Run the mobile app: `npm run ios` or `npm run android`
3. Tap "Upload Your Dog Photo" in the app
4. Select a dog photo from your device
5. Upload it to the server

## Option 2: Add Photos Using Public URLs

You can manually add photos from the internet to the database:

```bash
cd backend
node -e "
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const data = JSON.parse(fs.readFileSync('data/photos.json', 'utf8'));

// Add dog photo URLs (example: Unsplash)
const photoUrls = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400'
];

photoUrls.forEach(url => {
  data.photos.push({
    id: uuidv4(),
    imageUrl: url,
    likes: 0,
    dislikes: 0,
    uploadedAt: new Date().toISOString()
  });
});

fs.writeFileSync('data/photos.json', JSON.stringify(data, null, 2));
console.log('Added', photoUrls.length, 'photos');
"
```

## Option 3: Add Local Files

1. Copy dog photos to `backend/uploads/` directory
2. Manually edit `backend/data/photos.json`:

```json
{
  "photos": [
    {
      "id": "unique-id-1",
      "imageUrl": "/uploads/dog-photo-1.jpg",
      "likes": 0,
      "dislikes": 0,
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Option 4: Use the Helper Script

The `addSamplePhotos.js` script is provided as a template:

```bash
cd backend
# Edit addSamplePhotos.js to add your photo URLs or paths
node addSamplePhotos.js
```

## Getting Free Dog Photos

You can get free dog photos from:
- **Unsplash**: https://unsplash.com/s/photos/dog
- **Pexels**: https://www.pexels.com/search/dog/
- **Pixabay**: https://pixabay.com/images/search/dog/

Make sure to use the image URL (right-click on image → Copy Image Address).

## Testing the Backend

After adding photos, verify they're working:

```bash
# Get all photos
curl http://localhost:3000/api/photos

# Get a random photo
curl http://localhost:3000/api/photos/random
```
