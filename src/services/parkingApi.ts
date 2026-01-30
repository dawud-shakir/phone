import { User, UserRole, ParkingReservation, Driver, Message, Review, Location } from '../types/parking';
import io, { Socket } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3000/api';
const WS_URL = 'http://localhost:3000';

let authToken: string | null = null;
let socket: Socket | null = null;

export const parkingApiService = {
  // ========== Authentication ==========
  
  setAuthToken(token: string) {
    authToken = token;
  },

  getAuthToken(): string | null {
    return authToken;
  },

  async signup(
    email: string,
    password: string,
    name: string,
    phone: string,
    role: UserRole
  ): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      authToken = data.token;
      return data;
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      authToken = data.token;
      return data;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  },

  logout() {
    authToken = null;
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // ========== User Profile ==========

  async getUserProfile(): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // ========== Driver Operations ==========

  async getNearbyDrivers(latitude: number, longitude: number, radius = 5000): Promise<Driver[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/drivers/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch nearby drivers');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching nearby drivers:', error);
      throw error;
    }
  },

  async updateDriverLocation(latitude: number, longitude: number): Promise<Driver> {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver location');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  },

  async updateDriverAvailability(isAvailable: boolean): Promise<Driver> {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ isAvailable }),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver availability');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating driver availability:', error);
      throw error;
    }
  },

  async updateDriverVehicle(
    make: string,
    model: string,
    color: string,
    licensePlate: string
  ): Promise<Driver> {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/vehicle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ make, model, color, licensePlate }),
      });

      if (!response.ok) {
        throw new Error('Failed to update vehicle info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating vehicle info:', error);
      throw error;
    }
  },

  async getDriverProfile(): Promise<Driver> {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching driver profile:', error);
      throw error;
    }
  },

  // ========== Reservations ==========

  async createReservation(
    latitude: number,
    longitude: number,
    address?: string
  ): Promise<ParkingReservation> {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ latitude, longitude, address }),
      });

      if (!response.ok) {
        throw new Error('Failed to create reservation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },

  async getReservations(): Promise<ParkingReservation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  },

  async getActiveReservations(): Promise<ParkingReservation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/active`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active reservations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching active reservations:', error);
      throw error;
    }
  },

  async updateReservationStatus(
    reservationId: string,
    status: string
  ): Promise<ParkingReservation> {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reservation status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }
  },

  async acceptReservation(reservationId: string): Promise<ParkingReservation> {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept reservation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error accepting reservation:', error);
      throw error;
    }
  },

  // ========== Messaging ==========

  async sendMessage(reservationId: string, text: string): Promise<Message> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ reservationId, text }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getMessages(reservationId: string): Promise<Message[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${reservationId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // ========== Reviews ==========

  async submitReview(
    reservationId: string,
    reviewedUserId: string,
    rating: number,
    comment?: string
  ): Promise<Review> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ reservationId, reviewedUserId, rating, comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/user/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  // ========== WebSocket ==========

  connectSocket(): Socket {
    if (!socket) {
      socket = io(WS_URL);
      
      socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });
    }

    return socket;
  },

  disconnectSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket(): Socket | null {
    return socket;
  },
};
