import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { parkingApiService } from '../services/parkingApi';
import { ParkingReservation, Driver, User } from '../types/parking';

interface DriverDashboardProps {
  user: User;
  onLogout: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, onLogout }) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [availableReservations, setAvailableReservations] = useState<ParkingReservation[]>([]);
  const [activeReservation, setActiveReservation] = useState<ParkingReservation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDriverProfile();
    loadReservations();
    const socket = parkingApiService.connectSocket();

    socket?.on('new-reservation', (reservation: ParkingReservation) => {
      if (driver?.isAvailable) {
        setAvailableReservations(prev => [...prev, reservation]);
      }
    });

    socket?.on('reservation-updated', (reservation: ParkingReservation) => {
      if (reservation.driverId === user.id) {
        setActiveReservation(reservation);
      }
      loadReservations();
    });

    return () => {
      socket?.off('new-reservation');
      socket?.off('reservation-updated');
    };
  }, [user.id, driver?.isAvailable]);

  const loadDriverProfile = async () => {
    try {
      const driverData = await parkingApiService.getDriverProfile();
      setDriver(driverData);
    } catch (error: any) {
      console.error('Error loading driver profile:', error);
    }
  };

  const loadReservations = async () => {
    try {
      const data = await parkingApiService.getActiveReservations();
      const myActive = data.find(
        r => r.driverId === user.id && r.status !== 'completed' && r.status !== 'cancelled'
      );
      setActiveReservation(myActive || null);
      
      const available = data.filter(r => r.status === 'pending');
      setAvailableReservations(available);
    } catch (error: any) {
      console.error('Error loading reservations:', error);
    }
  };

  const toggleAvailability = async (value: boolean) => {
    try {
      const updatedDriver = await parkingApiService.updateDriverAvailability(value);
      setDriver(updatedDriver);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const handleAcceptReservation = async (reservationId: string) => {
    setLoading(true);
    try {
      const reservation = await parkingApiService.acceptReservation(reservationId);
      setActiveReservation(reservation);
      setAvailableReservations(prev => prev.filter(r => r.id !== reservationId));
      Alert.alert('Success', 'Reservation accepted! Navigate to the location.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!activeReservation) return;

    try {
      await parkingApiService.updateReservationStatus(activeReservation.id, status);
      const statusMessages: Record<string, string> = {
        navigating: 'Status updated: On the way',
        secured: 'Great! You secured the spot',
        waiting: 'Status updated: Waiting for user',
        completed: 'Reservation completed!',
      };
      Alert.alert('Success', statusMessages[status] || 'Status updated');
      
      if (status === 'completed') {
        setActiveReservation(null);
        await toggleAvailability(true);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderAvailableReservation = ({ item }: { item: ParkingReservation }) => (
    <View style={styles.reservationCard}>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.location}>{item.location.address || 'Location'}</Text>
      <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAcceptReservation(item.id)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.acceptButtonText}>Accept</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const getNextAction = () => {
    if (!activeReservation) return null;

    const actions: Record<string, { label: string; status: string; color: string }> = {
      accepted: { label: 'Start Navigation', status: 'navigating', color: '#3498DB' },
      navigating: { label: 'Spot Secured', status: 'secured', color: '#27AE60' },
      secured: { label: 'User Arriving...', status: 'waiting', color: '#95A5A6' },
      waiting: { label: 'User Arriving...', status: 'waiting', color: '#95A5A6' },
      swapping: { label: 'Complete Swap', status: 'completed', color: '#9B59B6' },
    };

    return actions[activeReservation.status];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Driver Dashboard</Text>
          <Text style={styles.subtitle}>{user.name}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {driver && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${driver.earnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>⭐ {driver.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.availabilityCard}>
            <Text style={styles.statLabel}>Available</Text>
            <Switch
              value={driver.isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: '#E0E0E0', true: '#27AE60' }}
              thumbColor={driver.isAvailable ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>
      )}

      {activeReservation ? (
        <View style={styles.activeContainer}>
          <Text style={styles.sectionTitle}>Active Reservation</Text>
          <View style={styles.activeCard}>
            <Text style={styles.activeName}>{activeReservation.userName}</Text>
            <Text style={styles.activeLocation}>
              {activeReservation.location.address || 'Location'}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {activeReservation.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.activePrice}>${activeReservation.price.toFixed(2)}</Text>

            {getNextAction() && activeReservation.status !== 'waiting' && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: getNextAction()?.color || '#3498DB' },
                ]}
                onPress={() => handleUpdateStatus(getNextAction()?.status || '')}
              >
                <Text style={styles.actionButtonText}>{getNextAction()?.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.availableContainer}>
          <Text style={styles.sectionTitle}>Available Requests</Text>
          {availableReservations.length === 0 ? (
            <Text style={styles.emptyText}>
              {driver?.isAvailable
                ? 'No requests available. Waiting for new requests...'
                : 'Turn on availability to see requests'}
            </Text>
          ) : (
            <FlatList
              data={availableReservations}
              renderItem={renderAvailableReservation}
              keyExtractor={item => item.id}
              style={styles.list}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#27AE60',
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  availabilityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#95A5A6',
  },
  activeContainer: {
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
  activeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  activeLocation: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 15,
  },
  statusBadge: {
    backgroundColor: '#3498DB',
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
  activePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  availableContainer: {
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
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 10,
  },
  acceptButton: {
    backgroundColor: '#27AE60',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DriverDashboard;
