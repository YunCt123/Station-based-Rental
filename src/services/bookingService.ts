/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Backend booking interfaces
export interface BookingRequest {
  vehicleId: string;
  stationId: string;
  startAt: string; // ISO date string
  endAt: string; // ISO date string
  agreement: {
    accepted: boolean;
  };
  insuranceOption?: {
    premium: boolean;
    note?: string;
  };
}

export interface Booking {
  _id: string;
  user_id: string;
  vehicle_id: string;
  station_id: string;
  rental_id?: string;
  start_at: string;
  end_at: string;
  status: 'HELD' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  hold_expires_at?: string;
  pricing_snapshot: {
    hourly_rate: number;
    daily_rate: number;
    currency: string;
    deposit: number;
    policy_version: string;
  };
  vehicle_snapshot: {
    name: string;
    brand: string;
    model: string;
    type: string;
    seats: number;
    battery_kWh: number;
  };
  station_snapshot: {
    name: string;
    address: string;
    city: string;
  };
  payment: {
    deposit_required: boolean;
    method: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    deposit_payment_id?: string;
  };
  agreement: {
    accepted: boolean;
    accepted_at?: string;
    terms_version: string;
  };
  insurance_option: {
    premium: boolean;
    note?: string;
  };
  notes?: string;
  cancel_reason?: string;
  cancelled_by?: 'USER' | 'STAFF' | 'SYSTEM';
  source: 'WEB' | 'APP' | 'STAFF_PORTAL';
  createdAt: string;
  updatedAt: string;
}

export interface Rental {
  _id: string;
  booking_id: string;
  user_id: string;
  vehicle_id: string;
  station_id: string;
  pickup: {
    at: string;
    photos: string[];
    odo_km: number;
    soc: number;
    contract_id?: string;
  };
  return?: {
    at: string;
    photos: string[];
    odo_km: number;
    soc: number;
  };
  status: 'ONGOING' | 'COMPLETED' | 'DISPUTED';
  pricing_snapshot: {
    hourly_rate: number;
    daily_rate: number;
    currency: string;
    deposit: number;
  };
  charges: {
    rental_fee: number;
    late_fee: number;
    damage_fee: number;
    total: number;
  };
  closed_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  booking_id?: string;
  rental_id?: string;
  type: 'DEPOSIT' | 'RENTAL' | 'REFUND';
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  provider: string;
  transaction_ref: string;
  idempotency_key: string;
  createdAt: string;
  updatedAt: string;
}

// Frontend booking interface for forms
export interface BookingFormData {
  vehicleId: string;
  stationId: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    driversLicense: string;
  };
  insurance: {
    premium: boolean;
    note?: string;
  };
  agreement: {
    accepted: boolean;
  };
  specialRequests?: string;
}

// Price calculation request/response
export interface PriceCalculationRequest {
  vehicleId: string;
  startAt: string;
  endAt: string;
  insurancePremium: boolean;
}

export interface PriceCalculation {
  basePrice: number;
  insurancePrice: number;
  deposit: number;
  taxes: number;
  totalPrice: number;
  durationHours: number;
  durationDays: number;
  breakdown: {
    hourlyRate: number;
    dailyRate: number;
    currency: string;
  };
}

export const bookingService = {
  /**
   * Test connection to booking API
   */
  async testConnection(): Promise<unknown> {
    try {
      console.log('🔗 Testing booking API connection...');
      const response = await api.get('/bookings?limit=1');
      console.log('Booking API connection test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Booking API connection test failed:', error);
      throw error;
    }
  },

  /**
   * Create a new booking (HELD status)
   * POST /v1/bookings
   */
  async createBooking(bookingData: BookingRequest): Promise<Booking> {
    try {
      console.log('📝 Creating booking:', bookingData);
      
      const response = await api.post<ApiResponse<Booking>>('/bookings', bookingData);
      
      console.log('✅ Booking created successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error creating booking:', error);
      if (error.response) {
        console.error('📄 Error response data:', error.response.data);
        console.error('📊 Error status:', error.response.status);
      }
      throw error;
    }
  },

  /**
   * Confirm booking (convert HELD to CONFIRMED and start rental)
   * POST /v1/bookings/{id}/confirm
   */
  async confirmBooking(bookingId: string): Promise<Booking> {
    try {
      console.log('✅ Confirming booking:', bookingId);
      
      const response = await api.post<ApiResponse<Booking>>(`/bookings/${bookingId}/confirm`);
      
      console.log('✅ Booking confirmed successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error confirming booking:', error);
      throw error;
    }
  },

  /**
   * Cancel booking
   * POST /v1/bookings/{id}/cancel
   */
  async cancelBooking(bookingId: string, reason: string, cancelledBy: 'USER' | 'STAFF' | 'SYSTEM' = 'USER'): Promise<Booking> {
    try {
      console.log('❌ Cancelling booking:', { bookingId, reason, cancelledBy });
      
      const response = await api.post<ApiResponse<Booking>>(`/bookings/${bookingId}/cancel`, {
        reason,
        cancelledBy
      });
      
      console.log('✅ Booking cancelled successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error cancelling booking:', error);
      throw error;
    }
  },

  /**
   * Get user's rentals
   * GET /v1/rentals
   */
  async getUserRentals(page = 1, limit = 20): Promise<{ rentals: Rental[]; meta?: any }> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      
      console.log('📋 Getting user rentals...');
      const response = await api.get<ApiResponse<Rental[]>>(`/rentals?${params.toString()}`);
      
      return {
        rentals: response.data.data,
        meta: response.data.meta
      };
    } catch (error: any) {
      console.error('❌ Error getting user rentals:', error);
      throw error;
    }
  },

  /**
   * Get specific rental by ID
   * GET /v1/rentals/{id}
   */
  async getRentalById(rentalId: string): Promise<Rental> {
    try {
      console.log('🎯 Getting rental by ID:', rentalId);
      
      const response = await api.get<ApiResponse<Rental>>(`/rentals/${rentalId}`);
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error getting rental:', error);
      throw error;
    }
  },

  /**
   * Return vehicle
   * POST /v1/rentals/{id}/return
   */
  async returnVehicle(
    rentalId: string, 
    returnData: {
      photos: string[];
      odo_km: number;
      soc: number;
      extraFees?: Array<{
        type: 'DAMAGE' | 'CLEANING' | 'LATE' | 'OTHER';
        amount: number;
        description?: string;
      }>;
    }
  ): Promise<Rental> {
    try {
      console.log('🔄 Returning vehicle:', { rentalId, returnData });
      
      const response = await api.post<ApiResponse<Rental>>(`/rentals/${rentalId}/return`, returnData);
      
      console.log('✅ Vehicle returned successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error returning vehicle:', error);
      throw error;
    }
  },

  /**
   * Create deposit payment for booking
   * POST /v1/bookings/{id}/payments/deposit
   */
  async createDepositPayment(bookingId: string, amount: number): Promise<Payment> {
    try {
      console.log('💳 Creating deposit payment:', { bookingId, amount });
      
      const response = await api.post<ApiResponse<Payment>>(`/bookings/${bookingId}/payments/deposit`, {
        amount
      });
      
      console.log('✅ Deposit payment created:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error creating deposit payment:', error);
      throw error;
    }
  },

  /**
   * Get payments for a booking
   * GET /v1/bookings/{id}/payments
   */
  async getBookingPayments(bookingId: string): Promise<Payment[]> {
    try {
      console.log('💰 Getting booking payments:', bookingId);
      
      const response = await api.get<ApiResponse<Payment[]>>(`/bookings/${bookingId}/payments`);
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error getting booking payments:', error);
      throw error;
    }
  },

  /**
   * Get payments for a rental
   * GET /v1/rentals/{id}/payments
   */
  async getRentalPayments(rentalId: string): Promise<Payment[]> {
    try {
      console.log('💰 Getting rental payments:', rentalId);
      
      const response = await api.get<ApiResponse<Payment[]>>(`/rentals/${rentalId}/payments`);
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error getting rental payments:', error);
      throw error;
    }
  },

  /**
   * Calculate booking price (if backend has this endpoint)
   * POST /v1/bookings/calculate-price
   */
  async calculatePrice(priceRequest: PriceCalculationRequest): Promise<PriceCalculation> {
    try {
      console.log('💲 Calculating price:', priceRequest);
      
      // Note: This endpoint might not exist in current backend
      // We'll implement client-side calculation as fallback
      const response = await api.post<ApiResponse<PriceCalculation>>('/bookings/calculate-price', priceRequest);
      
      return response.data.data;
    } catch {
      console.warn('⚠️ Price calculation endpoint not available, using fallback');
      
      // Fallback: Simple client-side calculation
      const startDate = new Date(priceRequest.startAt);
      const endDate = new Date(priceRequest.endAt);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
      const durationDays = Math.ceil(durationHours / 24);
      
      // Default rates (should come from vehicle data)
      const hourlyRate = 50000; // 50k VND per hour
      const dailyRate = 800000; // 800k VND per day
      
      const basePrice = durationDays > 1 ? durationDays * dailyRate : durationHours * hourlyRate;
      const insurancePrice = priceRequest.insurancePremium ? basePrice * 0.1 : 0;
      const deposit = basePrice * 0.2; // 20% deposit
      const taxes = basePrice * 0.1; // 10% tax
      const totalPrice = basePrice + insurancePrice + taxes;
      
      return {
        basePrice,
        insurancePrice,
        deposit,
        taxes,
        totalPrice,
        durationHours,
        durationDays,
        breakdown: {
          hourlyRate,
          dailyRate,
          currency: 'VND'
        }
      };
    }
  },

  /**
   * Check vehicle availability for given time period
   * This might be part of vehicle service, but related to booking
   */
  async checkVehicleAvailability(
    vehicleId: string,
    startAt: string,
    endAt: string
  ): Promise<{ available: boolean; conflicts?: Booking[] }> {
    try {
      console.log('🔍 Checking vehicle availability:', { vehicleId, startAt, endAt });
      
      // This endpoint might not exist, implement as utility function
      const response = await api.post<ApiResponse<{ available: boolean; conflicts?: Booking[] }>>(
        '/vehicles/check-availability',
        { vehicleId, startAt, endAt }
      );
      
      return response.data.data;
    } catch {
      console.warn('⚠️ Availability check endpoint not available');
      // Default to available for now
      return { available: true };
    }
  },

  /**
   * Helper function to convert frontend form data to backend format
   */
  formatBookingRequest(formData: BookingFormData): BookingRequest {
    const startAt = new Date(formData.startDate);
    startAt.setHours(parseInt(formData.startTime.split(':')[0]), parseInt(formData.startTime.split(':')[1]));
    
    const endAt = new Date(formData.endDate);
    endAt.setHours(parseInt(formData.endTime.split(':')[0]), parseInt(formData.endTime.split(':')[1]));
    
    return {
      vehicleId: formData.vehicleId,
      stationId: formData.stationId,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      agreement: {
        accepted: formData.agreement.accepted
      },
      insuranceOption: {
        premium: formData.insurance.premium,
        note: formData.insurance.note
      }
    };
  },

  /**
   * Helper function to format booking for display
   */
  formatBookingForDisplay(booking: Booking) {
    return {
      id: booking._id,
      vehicleName: booking.vehicle_snapshot.name,
      stationName: booking.station_snapshot.name,
      startDate: new Date(booking.start_at),
      endDate: new Date(booking.end_at),
      status: booking.status,
      totalAmount: booking.pricing_snapshot.hourly_rate || 0,
      currency: booking.pricing_snapshot.currency,
      canCancel: booking.status === 'HELD' || booking.status === 'CONFIRMED',
      canConfirm: booking.status === 'HELD' && booking.payment.status === 'SUCCESS',
      holdExpiresAt: booking.hold_expires_at ? new Date(booking.hold_expires_at) : null
    };
  }
};

// Export individual functions for backward compatibility
export const {
  createBooking,
  confirmBooking,
  cancelBooking,
  getUserRentals,
  getRentalById,
  returnVehicle,
  createDepositPayment,
  getBookingPayments,
  getRentalPayments,
  calculatePrice,
  checkVehicleAvailability,
  formatBookingRequest,
  formatBookingForDisplay
} = bookingService;

// Default export
export default bookingService;