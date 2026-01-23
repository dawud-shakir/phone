import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { apiService } from '../services/api';

interface UploadScreenProps {
  onNavigateToVoting: () => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onNavigateToVoting }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to pick image');
        return;
      }

      if (result.assets && result.assets[0] && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open image picker');
      console.error('Image picker error:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    try {
      setUploading(true);
      await apiService.uploadPhoto(selectedImage);
      
      Alert.alert(
        'Success!',
        'Your dog photo has been uploaded successfully!',
        [
          {
            text: 'Upload Another',
            onPress: () => setSelectedImage(null),
          },
          {
            text: 'Start Voting',
            onPress: onNavigateToVoting,
          },
        ]
      );
    } catch (error) {
      Alert.alert('Upload Failed', 'Failed to upload photo. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Dog Photo</Text>
      
      <View style={styles.previewContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderEmoji}>🐕</Text>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.pickButton}
        onPress={handlePickImage}
        disabled={uploading}
      >
        <Text style={styles.pickButtonText}>
          {selectedImage ? '📸 Choose Different Photo' : '📸 Select Photo'}
        </Text>
      </TouchableOpacity>

      {selectedImage && (
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.uploadButtonText}>⬆️ Upload Photo</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={onNavigateToVoting}
        disabled={uploading}
      >
        <Text style={styles.backButtonText}>← Back to Voting</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  pickButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pickButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 15,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default UploadScreen;
