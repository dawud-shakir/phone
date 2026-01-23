/**
 * Dog Voting App - "Dog or Not"
 * A Hot or Not style app for dog photos
 *
 * @format
 */

import React, { useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VotingScreen from './src/components/VotingScreen';
import UploadScreen from './src/components/UploadScreen';

type Screen = 'voting' | 'upload';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('voting');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {currentScreen === 'voting' ? (
        <VotingScreen onNavigateToUpload={() => setCurrentScreen('upload')} />
      ) : (
        <UploadScreen onNavigateToVoting={() => setCurrentScreen('voting')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

export default App;
