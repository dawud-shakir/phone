import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { parkingApiService } from '../services/parkingApi';
import { UserRole } from '../types/parking';

interface LoginScreenProps {
  onLoginSuccess: (user: any, token: string) => void;
  onNavigateToSignup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await parkingApiService.login(email, password);
      onLoginSuccess(user, token);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>ParkSpot</Text>
          <Text style={styles.subtitle}>Reserve your parking spot</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onNavigateToSignup} style={styles.linkButton}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

interface SignupScreenProps {
  onSignupSuccess: (user: any, token: string) => void;
  onNavigateToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onSignupSuccess,
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !name || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await parkingApiService.signup(email, password, name, phone, role);
      onSignupSuccess(user, token);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join ParkSpot today</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.roleLabel}>I want to:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'user' && styles.roleButtonActive]}
              onPress={() => setRole('user')}
            >
              <Text style={[styles.roleButtonText, role === 'user' && styles.roleButtonTextActive]}>
                Find Parking
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'driver' && styles.roleButtonActive]}
              onPress={() => setRole('driver')}
            >
              <Text style={[styles.roleButtonText, role === 'driver' && styles.roleButtonTextActive]}>
                Be a Driver
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onNavigateToLogin} style={styles.linkButton}>
            <Text style={styles.linkText}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#3498DB',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#95A5A6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#3498DB',
    fontSize: 14,
  },
  roleLabel: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 10,
    fontWeight: '600',
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: {
    borderColor: '#3498DB',
    backgroundColor: '#3498DB',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default LoginScreen;
