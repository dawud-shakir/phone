// Parking Spot Reservation App Types

export type UserRole = 'user' | 'driver';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  rating: number;
  totalRatings: number;
  createdAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export type ReservationStatus = 
  | 'pending'      // User requested, waiting for driver
  | 'accepted'     // Driver accepted request
  | 'navigating'   // Driver is navigating to spot
  | 'secured'      // Driver has secured the spot
  | 'waiting'      // Driver is waiting for user
  | 'swapping'     // User has arrived, swap in progress
  | 'completed'    // Reservation completed
  | 'cancelled';   // Reservation cancelled

export interface ParkingReservation {
  id: string;
  userId: string;
  driverId?: string;
  location: Location;
  status: ReservationStatus;
  requestedAt: string;
  acceptedAt?: string;
  securedAt?: string;
  completedAt?: string;
  price: number;
  userName: string;
  driverName?: string;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  rating: number;
  currentLocation: Location;
  isAvailable: boolean;
  vehicleInfo: {
    make: string;
    model: string;
    color: string;
    licensePlate: string;
  };
  earnings: number;
}

export interface Message {
  id: string;
  reservationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Review {
  id: string;
  reservationId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaymentInfo {
  id: string;
  reservationId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  processedAt?: string;
}
