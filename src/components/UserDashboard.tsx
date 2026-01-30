import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { parkingApiService } from '../services/parkingApi';
import { ParkingReservation, User } from '../types/parking';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout }) => {
  const [reservations, setReservations] = useState<ParkingReservation[]>([]);
  const [activeReservation, setActiveReservation] = useState<ParkingReservation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReservations();
    const socket = parkingApiService.connectSocket();

    socket?.on('reservation-updated', (reservation: ParkingReservation) => {
      if (reservation.userId === user.id) {
        setActiveReservation(reservation);
        loadReservations();
      }
    });

    return () => {
      socket?.off('reservation-updated');
    };
  }, [user.id]);

  const loadReservations = async () => {
    try {
      const data = await parkingApiService.getReservations();
      setReservations(data);
      const active = data.find(
        r => r.status !== 'completed' && r.status !== 'cancelled'
      );
      setActiveReservation(active || null);
    } catch {
      console.error('Error loading reservations');
    }
  };

  const handleRequestSpot = async () => {
    setLoading(true);
    try {
      // Mock location - in a real app, use actual geolocation
      const mockLatitude = 37.7749 + (Math.random() - 0.5) * 0.1;
      const mockLongitude = -122.4194 + (Math.random() - 0.5) * 0.1;
      const mockAddress = '123 Main St, San Francisco, CA';

      const reservation = await parkingApiService.createReservation(
        mockLatitude,
        mockLongitude,
        mockAddress
      );

      setActiveReservation(reservation);
      Alert.alert('Success', 'Parking spot request sent! Waiting for a driver...');
      loadReservations();
    } catch {
      Alert.alert('Error', 'Failed to request parking spot');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!activeReservation) return;

    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await parkingApiService.updateReservationStatus(
                activeReservation.id,
                'cancelled'
              );
              setActiveReservation(null);
              loadReservations();
            } catch {
              Alert.alert('Error', 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  const handleConfirmArrival = async () => {
    if (!activeReservation) return;

    try {
      await parkingApiService.updateReservationStatus(activeReservation.id, 'swapping');
      Alert.alert('Arrival Confirmed', 'The driver will now proceed with the swap');
    } catch {
      Alert.alert('Error', 'Failed to confirm arrival');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Looking for a driver...',
      accepted: 'Driver accepted! Heading to spot...',
      navigating: 'Driver is on the way...',
      secured: 'Spot secured! Navigate to location',
      waiting: 'Driver is waiting for you',
      swapping: 'Swap in progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: '#F39C12',
      accepted: '#3498DB',
      navigating: '#3498DB',
      secured: '#27AE60',
      waiting: '#27AE60',
      swapping: '#9B59B6',
      completed: '#95A5A6',
      cancelled: '#E74C3C',
    };
    return colorMap[status] || '#95A5A6';
  };

  const renderReservationItem = ({ item }: { item: ParkingReservation }) => (
    <View style={styles.reservationCard}>
      <View style={styles.reservationHeader}>
        <Text style={styles.reservationDate}>
          {new Date(item.requestedAt).toLocaleDateString()}
        </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
        >
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.reservationLocation}>{item.location.address || 'Location'}</Text>
      {item.driverName && (
        <Text style={styles.driverName}>Driver: {item.driverName}</Text>
      )}
      <Text style={styles.price}>${item.price.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user.name}!</Text>
          <Text style={styles.subtitle}>Find your parking spot</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {activeReservation ? (
        <View style={styles.activeReservationContainer}>
          <Text style={styles.sectionTitle}>Active Reservation</Text>
          <View style={styles.activeCard}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(activeReservation.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {activeReservation.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.statusDescription}>
              {getStatusText(activeReservation.status)}
            </Text>
            <Text style={styles.activeLocation}>
              {activeReservation.location.address || 'Your requested location'}
            </Text>
            {activeReservation.driverName && (
              <Text style={styles.driverInfo}>
                Driver: {activeReservation.driverName}
              </Text>
            )}
            <Text style={styles.activePrice}>
              ${activeReservation.price.toFixed(2)}
            </Text>

            <View style={styles.actionButtons}>
              {activeReservation.status === 'secured' && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleConfirmArrival}
                >
                  <Text style={styles.buttonText}>I've Arrived</Text>
                </TouchableOpacity>
              )}
              {activeReservation.status !== 'completed' &&
                activeReservation.status !== 'cancelled' && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleCancelReservation}
                  >
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.requestContainer}>
          <Text style={styles.requestTitle}>Need a parking spot?</Text>
          <TouchableOpacity
            style={[styles.requestButton, loading && styles.buttonDisabled]}
            onPress={handleRequestSpot}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.requestButtonText}>Request Parking Spot</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Reservation History</Text>
        {reservations.length === 0 ? (
          <Text style={styles.emptyText}>No reservations yet</Text>
        ) : (
          <FlatList
            data={reservations}
            renderItem={renderReservationItem}
            keyExtractor={item => item.id}
            style={styles.list}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#3498DB',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeReservationContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  activeLocation: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 10,
  },
  driverInfo: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 10,
  },
  activePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 20,
  },
  actionButtons: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#27AE60',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
  },
  requestContainer: {
    padding: 20,
    alignItems: 'center',
  },
  requestTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
  },
  requestButton: {
    backgroundColor: '#3498DB',
    borderRadius: 10,
    padding: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#95A5A6',
  },
  historyContainer: {
    flex: 1,
    padding: 20,
  },
  list: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#95A5A6',
    fontSize: 16,
    marginTop: 20,
  },
  reservationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reservationDate: {
    fontSize: 12,
    color: '#95A5A6',
  },
  reservationLocation: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 5,
  },
  driverName: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
  },
});

export default UserDashboard;
