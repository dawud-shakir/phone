import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { DogPhoto, VoteType } from '../types';
import { apiService } from '../services/api';
import ResultsOverlay from './ResultsOverlay';

const { width, height } = Dimensions.get('window');

interface VotingScreenProps {
  onNavigateToUpload: () => void;
}

const VotingScreen: React.FC<VotingScreenProps> = ({ onNavigateToUpload }) => {
  const [currentPhoto, setCurrentPhoto] = useState<DogPhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [votedPhoto, setVotedPhoto] = useState<DogPhoto | null>(null);

  const loadRandomPhoto = async () => {
    try {
      setLoading(true);
      setError(null);
      const photo = await apiService.getRandomPhoto();
      setCurrentPhoto(photo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRandomPhoto();
  }, []);

  const handleVote = async (vote: VoteType) => {
    if (!currentPhoto) return;

    try {
      const updatedPhoto = await apiService.submitVote(currentPhoto.id, vote);
      setVotedPhoto(updatedPhoto);
      setShowResults(true);

      // Auto-hide results and load next photo after 2.5 seconds
      setTimeout(() => {
        setShowResults(false);
        loadRandomPhoto();
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  };

  const calculatePercentage = (photo: DogPhoto) => {
    const total = photo.likes + photo.dislikes;
    if (total === 0) return { likePercent: 0, dislikePercent: 0 };
    
    const likePercent = Math.round((photo.likes / total) * 100);
    const dislikePercent = 100 - likePercent;
    
    return { likePercent, dislikePercent };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRandomPhoto}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={onNavigateToUpload}>
          <Text style={styles.uploadButtonText}>Upload a Photo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentPhoto) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dog or Not</Text>
      
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: apiService.getImageUrl(currentPhoto.imageUrl) }}
          style={styles.photo}
          resizeMode="cover"
        />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.dislikeButton]}
          onPress={() => handleVote('dislike')}
        >
          <Text style={styles.buttonText}>👎 Dislike</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.likeButton]}
          onPress={() => handleVote('like')}
        >
          <Text style={styles.buttonText}>👍 Like</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.uploadLinkButton} onPress={onNavigateToUpload}>
        <Text style={styles.uploadLinkText}>Upload Your Dog Photo</Text>
      </TouchableOpacity>

      {showResults && votedPhoto && (
        <ResultsOverlay
          photo={votedPhoto}
          percentages={calculatePercentage(votedPhoto)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 60,
    marginBottom: 20,
  },
  photoContainer: {
    width: width - 40,
    height: height * 0.5,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  dislikeButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  uploadLinkButton: {
    marginTop: 20,
    padding: 10,
  },
  uploadLinkText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VotingScreen;
