import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { DogPhoto } from '../types';

interface ResultsOverlayProps {
  photo: DogPhoto;
  percentages: {
    likePercent: number;
    dislikePercent: number;
  };
}

const ResultsOverlay: React.FC<ResultsOverlayProps> = ({ photo, percentages }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Results</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>👍</Text>
            <Text style={styles.statPercent}>{percentages.likePercent}%</Text>
            <Text style={styles.statCount}>{photo.likes} votes</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>👎</Text>
            <Text style={styles.statPercent}>{percentages.dislikePercent}%</Text>
            <Text style={styles.statCount}>{photo.dislikes} votes</Text>
          </View>
        </View>
        
        <Text style={styles.totalVotes}>
          Total: {photo.likes + photo.dislikes} votes
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  statPercent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  statCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  divider: {
    width: 1,
    height: 80,
    backgroundColor: '#E0E0E0',
  },
  totalVotes: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default ResultsOverlay;
