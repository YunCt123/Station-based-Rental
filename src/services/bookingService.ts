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

// Types matching backend models
export interface BookingRequest {
  vehicleId: string;
  stationId: string;
  startAt: string; // ISO date string
  endAt: string; // ISO date string
  agreement: boolean;
  insuranceOption?: boolean;
}

export interface PriceCalculationRequest {
  vehicleId: string;
  startAt: string;
  endAt: string;
  insurancePremium?: boolean;
}

export interface PriceBreakdown {
  basePrice: number;
  insurancePrice: number;
  taxes: number;
  deposit: number;
  totalPrice: number;
  currency: string;
  details: {
    rawBase: number;
    peakMultiplier: number;
    weekendMultiplier: number;
    hours: number;
  };
}

export interface Booking {
  _id: string;
  user_id: string;
  vehicle_id: string;
  station_id: string;
  start_at: string;
  end_at: string;
  status: 'HELD' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  hold_expires_at?: string;
  agreement_accepted: boolean;
  insurance_option?: boolean;
  pricing_snapshot?: PriceBreakdown;
  vehicle_snapshot?: {
    _id: string;
    name: string;
    type: string;
    brand: string;
    licensePlate: string;
  };
  station_snapshot?: {
    _id: string;
    name: string;
    address: string;
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Rental {
  _id: string;
  booking_id: string;
  user_id: string;
  vehicle_id: string;
  station_id: string;
  start_at: string;
  end_at: string;
  actual_start_at?: string;
  actual_end_at?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  mileage_start?: number;
  mileage_end?: number;
  damage_report?: {
    has_damage: boolean;
    description?: string;
    photos?: string[];
  };
  pricing_snapshot?: PriceBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  booking_id?: string;
  rental_id?: string;
  type: 'DEPOSIT' | 'RENTAL' | 'EXTRA' | 'REFUND';
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  provider: 'VNPAY_SANDBOX' | 'PAYOS';
  transaction_ref?: string;
  provider_payment_id?: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentCreateRequest {
  bookingId: string;
  amount: number;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResponse {
  paymentId: string;
  paymentUrl: string;
  providerPaymentId: string;
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

// Main booking service class
export class BookingService {
  // Calculate booking price before creating booking
  async calculatePrice(request: PriceCalculationRequest): Promise<PriceBreakdown> {
    try {
      console.log('[BookingService] Calculating price:', request);
      
      const response = await api.post<ApiResponse<PriceBreakdown>>('/bookings/calculate-price', request);
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] Price calculated:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to calculate price');
    } catch (error: any) {
      console.error('[BookingService] Price calculation error:', error);
      
      // Fallback price calculation for development
      const fallback = this.calculateFallbackPrice(request);
      console.log('[BookingService] Using fallback price:', fallback);
      return fallback;
    }
  }

  // Create a new booking (HELD status)
  async createBooking(request: BookingRequest): Promise<Booking> {
    try {
      console.log('[BookingService] Creating booking:', request);
      
      // Format request to match backend expectations
      const backendRequest = {
        vehicleId: request.vehicleId,
        stationId: request.stationId,
        startAt: request.startAt,
        endAt: request.endAt,
        agreement: request.agreement,
        insuranceOption: request.insuranceOption || false
      };
      
      const response = await api.post<ApiResponse<Booking>>('/bookings', backendRequest);
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] Booking created:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to create booking');
    } catch (error: any) {
      console.error('[BookingService] Create booking error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create booking');
    }
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<Booking> {
    try {
      console.log('[BookingService] Getting booking:', bookingId);
      
      const response = await api.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] Booking retrieved:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Booking not found');
    } catch (error: any) {
      console.error('[BookingService] Get booking error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get booking');
    }
  }

  // Get user's bookings
  async getUserBookings(): Promise<Booking[]> {
    try {
      console.log('[BookingService] Getting user bookings');
      
      const response = await api.get<ApiResponse<Booking[]>>('/bookings');
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] User bookings retrieved:', response.data.data.length);
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('[BookingService] Get user bookings error:', error);
      return [];
    }
  }

  // Create deposit payment for booking
  async createDepositPayment(request: PaymentCreateRequest): Promise<PaymentResponse> {
    try {
      console.log('[BookingService] Creating deposit payment:', request);
      
      const response = await api.post<ApiResponse<PaymentResponse>>(`/payments/${request.bookingId}/deposit`, {
        amount: request.amount,
        returnUrl: request.returnUrl,
        cancelUrl: request.cancelUrl
      });
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] Payment created:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to create payment');
    } catch (error: any) {
      console.error('[BookingService] Create payment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create payment');
    }
  }

  // Create PayOS payment
  async createPayOSPayment(request: PaymentCreateRequest): Promise<PaymentResponse> {
    try {
      console.log('[BookingService] Creating PayOS payment:', request);
      
      const response = await api.post<ApiResponse<PaymentResponse>>('/payments/payos/create', request);
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] PayOS payment created:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to create PayOS payment');
    } catch (error: any) {
      console.error('[BookingService] Create PayOS payment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create PayOS payment');
    }
  }

  // Check payment status
  async checkPaymentStatus(paymentId: string): Promise<Payment> {
    try {
      console.log('[BookingService] Checking payment status:', paymentId);
      
      const response = await api.get<ApiResponse<Payment>>(`/payments/payos/${paymentId}/status`);
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] Payment status:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to check payment status');
    } catch (error: any) {
      console.error('[BookingService] Check payment status error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to check payment status');
    }
  }

  // Get booking payments
  async getBookingPayments(bookingId: string): Promise<Payment[]> {
    try {
      console.log('[BookingService] Getting booking payments:', bookingId);
      
      const response = await api.get<ApiResponse<Payment[]>>(`/payments/bookings/${bookingId}`);
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] Booking payments:', response.data.data);
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('[BookingService] Get booking payments error:', error);
      return [];
    }
  }

  // Confirm booking (transition from HELD to CONFIRMED, then to RENTAL)
  async confirmBooking(bookingId: string): Promise<Booking> {
    try {
      console.log('[BookingService] Confirming booking:', bookingId);
      
      const response = await api.post<ApiResponse<Booking>>(`/bookings/${bookingId}/confirm`);
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] Booking confirmed:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to confirm booking');
    } catch (error: any) {
      console.error('[BookingService] Confirm booking error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to confirm booking');
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    try {
      console.log('[BookingService] Cancelling booking:', bookingId, reason);
      
      const response = await api.post<ApiResponse<Booking>>(`/bookings/${bookingId}/cancel`, {
        reason: reason || 'User cancelled'
      });
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] Booking cancelled:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to cancel booking');
    } catch (error: any) {
      console.error('[BookingService] Cancel booking error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to cancel booking');
    }
  }

  // Get user rentals
  async getUserRentals(): Promise<Rental[]> {
    try {
      console.log('[BookingService] Getting user rentals');
      
      // This would be implemented when rental endpoints are available
      // const response = await api.get<ApiResponse<Rental[]>>('/rentals');
      // return response.data.data || [];
      
      return [];
    } catch (error: any) {
      console.error('[BookingService] Get user rentals error:', error);
      return [];
    }
  }

  // Return vehicle (end rental)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async returnVehicle(rentalId: string, _mileageEnd: number, _damageReport?: any): Promise<Rental> {
    try {
      console.log('[BookingService] Returning vehicle:', rentalId);
      
      // This would be implemented when rental endpoints are available
      throw new Error('Return vehicle endpoint not yet implemented');
    } catch (error: any) {
      console.error('[BookingService] Return vehicle error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to return vehicle');
    }
  }

  // Check vehicle availability for booking dates
  async checkVehicleAvailability(vehicleId: string, startAt: string, endAt: string): Promise<boolean> {
    try {
      console.log('[BookingService] Checking vehicle availability:', { vehicleId, startAt, endAt });
      
      // For now, return true (would need specific endpoint)
      return true;
    } catch (error: any) {
      console.error('[BookingService] Check availability error:', error);
      return false;
    }
  }

  // Helper: Format booking request for API
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
      agreement: formData.agreement.accepted,
      insuranceOption: formData.insurance.premium
    };
  }

  // Helper: Format booking for display
  formatBookingForDisplay(booking: Booking) {
    return {
      id: booking._id,
      vehicleId: booking.vehicle_id,
      stationId: booking.station_id,
      startAt: new Date(booking.start_at),
      endAt: new Date(booking.end_at),
      status: booking.status,
      holdExpiresAt: booking.hold_expires_at ? new Date(booking.hold_expires_at) : undefined,
      agreement: booking.agreement_accepted,
      insuranceOption: booking.insurance_option || false,
      pricing: booking.pricing_snapshot,
      vehicleName: booking.vehicle_snapshot?.name || 'Unknown Vehicle',
      stationName: booking.station_snapshot?.name || 'Unknown Station',
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
      totalAmount: booking.pricing_snapshot?.totalPrice || 0,
      currency: booking.pricing_snapshot?.currency || 'USD',
      deposit: booking.pricing_snapshot?.deposit || 0,
      canConfirm: booking.status === 'HELD' && this.isWithinHoldPeriod(booking),
      canCancel: ['HELD', 'CONFIRMED'].includes(booking.status)
    };
  }

  // Helper: Check if booking is still within hold period
  private isWithinHoldPeriod(booking: Booking): boolean {
    if (!booking.hold_expires_at) return false;
    return new Date() < new Date(booking.hold_expires_at);
  }

  // Fallback price calculation for development/offline mode
  private calculateFallbackPrice(request: PriceCalculationRequest): PriceBreakdown {
    console.log('[BookingService] Using fallback price calculation');
    
    const start = new Date(request.startAt);
    const end = new Date(request.endAt);
    const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
    
    const baseHourlyRate = 50; // $50/hour fallback
    const basePrice = hours * baseHourlyRate;
    const insurancePrice = request.insurancePremium ? basePrice * 0.1 : 0;
    const taxes = (basePrice + insurancePrice) * 0.1;
    const total = basePrice + insurancePrice + taxes;
    const deposit = total * 0.2;
    
    return {
      basePrice: Number(basePrice.toFixed(2)),
      insurancePrice: Number(insurancePrice.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      deposit: Number(deposit.toFixed(2)),
      totalPrice: Number(total.toFixed(2)),
      currency: 'USD',
      details: {
        rawBase: basePrice,
        peakMultiplier: 1,
        weekendMultiplier: 1,
        hours
      }
    };
  }
}

// Export singleton instance
export const bookingService = new BookingService();

// Export default instance
export default bookingService;