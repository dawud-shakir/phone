/**
 * ParkSpot - Parking Spot Reservation App
 * Similar to Uber, but for parking spot reservations
 *
 * @format
 */

import React, { useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen, { SignupScreen } from './src/components/LoginScreen';
import UserDashboard from './src/components/UserDashboard';
import DriverDashboard from './src/components/DriverDashboard';
import { User } from './src/types/parking';

type Screen = 'login' | 'signup' | 'user-dashboard' | 'driver-dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    if (user.role === 'driver') {
      setCurrentScreen('driver-dashboard');
    } else {
      setCurrentScreen('user-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToSignup={() => setCurrentScreen('signup')}
          />
        );
      case 'signup':
        return (
          <SignupScreen
            onSignupSuccess={handleLoginSuccess}
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'user-dashboard':
        return currentUser ? (
          <UserDashboard user={currentUser} onLogout={handleLogout} />
        ) : null;
      case 'driver-dashboard':
        return currentUser ? (
          <DriverDashboard user={currentUser} onLogout={handleLogout} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      {renderScreen()}
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
