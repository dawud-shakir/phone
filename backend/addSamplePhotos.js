const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'data', 'photos.json');

/**
 * Helper script to add sample photos to the database
 * Usage: node addSamplePhotos.js
 */

// You can add sample dog photo URLs from the internet for testing
const samplePhotos = [
  {
    id: uuidv4(),
    imageUrl: '/uploads/sample-dog-1.jpg', // Replace with actual uploaded file
    likes: 0,
    dislikes: 0,
    uploadedAt: new Date().toISOString()
  },
  // Add more sample photos here
];

function addSamplePhotos() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    console.log(`Current photos in database: ${data.photos.length}`);
    
    // Add sample photos
    samplePhotos.forEach(photo => {
      data.photos.push(photo);
      console.log(`Added photo: ${photo.id}`);
    });
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`\nTotal photos now: ${data.photos.length}`);
    console.log('Sample photos added successfully!');
    
  } catch (error) {
    console.error('Error adding sample photos:', error);
  }
}

console.log('Adding sample photos to database...\n');
addSamplePhotos();
