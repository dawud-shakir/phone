import { DogPhoto, VoteType } from '../types';
import { Platform } from 'react-native';

// Update this to your server's IP address when running on a physical device
// For Android emulator: use 10.0.2.2
// For iOS simulator: use localhost
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

export const apiService = {
  async getRandomPhoto(): Promise<DogPhoto> {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/random`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No photos available. Please upload some photos first!');
        }
        throw new Error('Failed to fetch photo');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching random photo:', error);
      throw error;
    }
  },

  async submitVote(photoId: string, vote: VoteType): Promise<DogPhoto> {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/${photoId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  },

  async uploadPhoto(uri: string): Promise<DogPhoto> {
    try {
      const formData = new FormData();
      
      // React Native's FormData accepts uri-based file objects
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);
      
      const response = await fetch(`${API_BASE_URL}/photos/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  getImageUrl(imageUrl: string): string {
    // If it's already a full URL (http/https), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Otherwise, construct the full URL from our server
    return imageUrl.replace('/uploads/', `${API_BASE_URL.replace('/api', '')}/uploads/`);
  }
};
