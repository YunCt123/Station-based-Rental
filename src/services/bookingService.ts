/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
import { convertToVND } from "../lib/currency";

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
  agreement: {
    accepted: boolean;
  };
  insuranceOption?: {
    premium: boolean;
  };
}

export interface PriceCalculationRequest {
  vehicleId: string;
  startAt: string;
  endAt: string;
  insurancePremium?: boolean;
}

export interface PriceBreakdown {
  // Backend fields (new format)
  hourly_rate?: number;
  daily_rate?: number;
  currency: string;
  deposit: number;
  policy_version?: string;
  
  // Legacy/calculated fields (for compatibility)
  basePrice?: number;
  insurancePrice?: number;
  taxes?: number;
  totalPrice?: number;
  details?: {
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
  currency?: string; // Optional currency field for VNPAY
  returnUrl: string;
  cancelUrl: string;
  requestId?: string; // Optional unique identifier for duplicate prevention
}

export interface PaymentResponse {
  paymentId?: string;
  paymentUrl?: string;
  providerPaymentId?: string;
  // VNPAY specific fields
  checkoutUrl?: string;
  transaction_ref?: string;
  payment?: {
    _id: string;
    [key: string]: unknown;
  };
}

// Frontend booking interface for forms
export interface BookingFormData {
  vehicleId?: string;
  stationId?: string;
  rental_period?: any[]; // Array of dayjs objects from DatePicker.RangePicker
  rental_start_time?: any; // dayjs object from TimePicker
  rental_end_time?: any; // dayjs object from TimePicker
  // Fallback fields
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  // Customer info
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  drivers_license?: string;
  // Legacy structure
  customerInfo?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    driversLicense: string;
  };
  // Insurance
  insurance_premium?: boolean;
  insurance?: {
    premium: boolean;
    note?: string;
  };
  // Agreement
  terms_agreement?: boolean;
  agreement?: {
    accepted: boolean;
  };
  specialRequests?: string;
}


export interface PayOSCallbackParams {
  transaction_ref: string;
  status: "SUCCESS" | "FAILED";
  provider: string;
  amount: number;
  provider_payment_id?: string | null;

  // PayOS specific params
  id?: string;
  orderCode?: string;
  paymentAmount?: string; // Renamed to avoid conflict
  paymentStatus?: string; // Renamed to avoid conflict
  code?: string;
  cancel?: string;
  bookingId?: string;
  paymentLinkId?: string;
  desc?: string;
  counterAccountBankId?: string;
  counterAccountBankName?: string;
  counterAccountNumber?: string;
  counterAccountName?: string;
  virtualAccountNumber?: string;
  virtualAccountName?: string;
  transactionDate?: string;
  paymentDate?: string;

  [key: string]: any;
}

export interface PaymentCallbackResponse {
  status: "SUCCESS" | "FAILED";
  bookingId?: string;
}


// Main booking service class
export class BookingService {
  // ✅ FIXED: Helper function to validate and debug price calculation
  private validatePriceCalculation(request: PriceCalculationRequest, response: PriceBreakdown): void {
    console.log('🔍 [Frontend] Validating price calculation:');
    console.log('📤 Request:', request);
    console.log('📥 Response:', response);
    
    // Basic validation
    if (!response.basePrice || response.basePrice < 0) {
      console.warn('⚠️ Invalid base price:', response.basePrice);
    }
    
    if (!response.totalPrice || response.totalPrice < (response.basePrice || 0)) {
      console.warn('⚠️ Invalid total price:', response.totalPrice);
    }
    
    // Calculate time difference
    const startTime = new Date(request.startAt);
    const endTime = new Date(request.endAt);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const days = hours / 24;
    
    console.log(`⏰ Time analysis: ${hours.toFixed(2)}h (${days.toFixed(2)} days)`);
    
    // Expected pricing analysis
    if (response.hourly_rate && response.daily_rate && response.basePrice) {
      const expectedHourly = hours * response.hourly_rate;
      const expectedDaily = Math.ceil(days) * response.daily_rate;
      
      console.log(`💰 Expected pricing:`);
      console.log(`   Hourly: ${hours.toFixed(2)}h × $${response.hourly_rate} = $${expectedHourly.toFixed(2)}`);
      console.log(`   Daily: ${Math.ceil(days)} days × $${response.daily_rate} = $${expectedDaily.toFixed(2)}`);
      console.log(`   Actual base: $${response.basePrice}`);
      
      // Flag potential issues
      const tolerance = 50; // $50 tolerance for multipliers
      if (hours >= 24 && Math.abs(response.basePrice - expectedDaily) > tolerance) {
        console.warn(`⚠️ Daily pricing mismatch: expected ~$${expectedDaily}, got $${response.basePrice}`);
      } else if (hours < 24 && Math.abs(response.basePrice - expectedHourly) > tolerance) {
        console.warn(`⚠️ Hourly pricing mismatch: expected ~$${expectedHourly}, got $${response.basePrice}`);
      }
    }
  }

  // Calculate booking price before creating booking
  async calculatePrice(request: PriceCalculationRequest): Promise<PriceBreakdown> {
    try {
      console.log('🚀 [Frontend] Original request (USD):', {
        ...request,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substr(2, 9)
      });
      
      // 💱 Convert USD amounts to VND for backend
      const testUsdAmount = 1; // Test with $1  
      const vndEquivalent = convertToVND(testUsdAmount); // Get VND for $1
      const usdToVndRate = vndEquivalent; // This is the current rate
      
      console.log('💱 [Frontend] Currency rate USD→VND:', usdToVndRate);
      
      // Send request with converted VND values (if needed)
      const vndRequest = {
        ...request,
        currency: 'VND' // Tell backend we're working with VND
      };
      
      console.log('� [Frontend] Sending request to backend (VND):', vndRequest);
      
      const response = await api.post<ApiResponse<PriceBreakdown>>('/bookings/calculate-price', vndRequest);
      
      if (response.data.success && response.data.data) {
        let pricing = response.data.data;
        
        console.log('📥 [Frontend] Raw backend response:', pricing);
        
        // 💱 Convert VND response back to USD for frontend display
        if (pricing.currency === 'VND' || !pricing.currency) {
          console.log('🔄 [Frontend] Converting VND response to USD for display');
          
          pricing = {
            ...pricing,
            // Convert all VND amounts to USD for frontend display
            basePrice: pricing.basePrice ? Math.round(pricing.basePrice / usdToVndRate) : 0,
            insurancePrice: pricing.insurancePrice ? Math.round(pricing.insurancePrice / usdToVndRate) : 0,
            taxes: pricing.taxes ? Math.round(pricing.taxes / usdToVndRate) : 0,
            totalPrice: pricing.totalPrice ? Math.round(pricing.totalPrice / usdToVndRate) : 0,
            deposit: pricing.deposit ? Math.round(pricing.deposit / usdToVndRate) : 0,
            currency: 'USD' // Frontend always displays USD
          };
          
          console.log('✅ [Frontend] Converted to USD for display:', pricing);
        }
        
        // ✅ Validate and debug pricing
        this.validatePriceCalculation(request, pricing);
        
        console.log('✅ [Frontend] Price calculation successful (converted to USD):', pricing);
        return pricing;
      } else {
        throw new Error('Price calculation failed: Invalid response');
      }
    } catch (error: any) {
      console.error('💥 [Frontend] Price calculation error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Vehicle not found');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid booking parameters');
      }
      
      // ✅ Fallback calculation for development
      console.warn('⚠️ [Frontend] Using fallback price calculation');
      const fallbackPrice = this.calculateFallbackPrice(request);
      this.validatePriceCalculation(request, fallbackPrice);
      return fallbackPrice;
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
        insuranceOption: request.insuranceOption,
        useTransaction: false // Disable transactions to avoid replica set error
      };
      
      console.log('[BookingService] Backend request:', JSON.stringify(backendRequest, null, 2));
      
      const response = await api.post<ApiResponse<Booking>>('/bookings', backendRequest);
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] Booking created:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to create booking');
        } catch (error: any) {
      console.error('[BookingService] Create booking error:', error);
      
      // Handle specific MongoDB transaction error
      if (error?.response?.data?.message?.includes('Transaction numbers are only allowed on a replica set member or mongos')) {
        throw new Error('Database configuration error. Please contact support or try again later.');
      }
      
      // Handle other validation errors
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Failed to create booking. Please try again.');
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

  // ✅ NEW: Get bookings by station (for staff)
  async getStationBookings(
    stationId: string, 
    status: 'HELD' | 'CONFIRMED' | 'CANCELLED' = 'CONFIRMED'
  ): Promise<Booking[]> {
    try {
      console.log('[BookingService] Getting station bookings:', { stationId, status });
      
      const response = await api.get<ApiResponse<Booking[]>>(
        `/bookings/station/${stationId}?status=${status}`
      );
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] Station bookings retrieved:', {
          count: response.data.data.length,
          bookings: response.data.data.map(b => ({
            id: b._id,
            status: b.status,
            startAt: b.start_at,
            endAt: b.end_at,
            vehicle: b.vehicle_snapshot?.name || 'Unknown',
            user: 'Customer' // Will be populated by backend
          }))
        });
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('[BookingService] Get station bookings error:', error);
      return [];
    }
  }

  // Create deposit payment for booking
  async createDepositPayment(request: PaymentCreateRequest): Promise<PaymentResponse> {
    try {
      console.log('[BookingService] Creating deposit payment (VNPAY):', request);
      
      const response = await api.post<ApiResponse<PaymentResponse>>(`/payments/${request.bookingId}/deposit`, {
        amount: request.amount,
        returnUrl: request.returnUrl,
        cancelUrl: request.cancelUrl
      });
      
      console.log('[BookingService] Full VNPAY API response:', response);
      console.log('[BookingService] Response data:', response.data);
      console.log('[BookingService] Response data.data:', response.data.data);
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] VNPAY payment created successfully:', response.data.data);
        return response.data.data;
      }
      
      console.error('[BookingService] VNPAY API response missing success or data');
      throw new Error('Failed to create payment - invalid response structure');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('[BookingService] Create VNPAY payment error:', error);
      console.error('[BookingService] Error response:', err.response);
      throw new Error(err.response?.data?.message || err.message || 'Failed to create payment');
    }
  }

  // Create PayOS payment
  async createPayOSPayment(request: PaymentCreateRequest): Promise<PaymentResponse> {
    try {
      console.log('[BookingService] Creating PayOS payment:', request);
      
      const response = await api.post<ApiResponse<PaymentResponse>>('/payments/payos/create', request);
      
      console.log('[BookingService] Full API response:', response);
      console.log('[BookingService] Response data:', response.data);
      console.log('[BookingService] Response data.data:', response.data.data);
      console.log('[BookingService] Response status:', response.status);
      
      if (response.data.success && response.data.data) {
        console.log('[BookingService] PayOS payment created successfully:', response.data.data);
        console.log('[BookingService] Payment URL received:', response.data.data.paymentUrl);
        return response.data.data;
      }
      
      console.error('[BookingService] API response missing success or data');
      throw new Error('Failed to create PayOS payment - invalid response structure');
    } catch (error: any) {
      console.error('[BookingService] Create PayOS payment error:', error);
      console.error('[BookingService] Error response:', error.response);
      console.error('[BookingService] Error response data:', error.response?.data);
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

  async handleVnpayCallback(params: {
  transaction_ref: string;
  status: "SUCCESS" | "FAILED";
  provider: string;
  amount: number;
  provider_payment_id?: string | null;

  // TOÀN BỘ vnp_* Ở ROOT
  vnp_SecureHash: string;
  vnp_TxnRef: string;
  vnp_ResponseCode: string;
  vnp_Amount: string;
  vnp_TransactionNo?: string;
  vnp_BankCode?: string;
  vnp_OrderInfo?: string;
  vnp_PayDate?: string;
  vnp_TmnCode?: string;
  vnp_TransactionStatus?: string;
  vnp_CardType?: string;

  [key: string]: any; // Cho phép tất cả vnp_*
}): Promise<{
  status: "SUCCESS" | "FAILED";
  bookingId?: string;
}> {
  try {
    console.log('[BookingService] handleVnpayCallback - Payload:', params);

    const response = await api.post<ApiResponse<{
      status: "SUCCESS" | "FAILED";
      bookingId?: string;
    }>>('/payments/vnpay/callback', params);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error('Xử lý VNPay callback thất bại');
  } catch (error: any) {
    console.error('[BookingService] Lỗi:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Lỗi hệ thống'
    );
  }
}

 async handlePayOSCallback(
  params: PayOSCallbackParams
): Promise<PaymentCallbackResponse> {
  try {
    console.log('[BookingService] handlePayOSCallback - Payload:', params);

    const response = await api.post<ApiResponse<PaymentCallbackResponse>>(
      '/payments/payos/callback',
      params
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error('Xử lý PayOS callback thất bại');
  } catch (error: any) {
    console.error('[BookingService] Lỗi PayOS:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Lỗi hệ thống'
    );
  }
}

  async checkVnpayPaymentStatus(txnRef: string): Promise<Payment> {
    try {
      console.log('[BookingService] Checking VNPAY payment status for txnRef:', txnRef);

      const response = await api.get<ApiResponse<Payment>>(`/payments/vnpay/status/${txnRef}`);

      if (response.data.success && response.data.data) {
        console.log('[BookingService] VNPAY payment status:', response.data.data);
        return response.data.data;
      }

      throw new Error('Payment not found or still pending');
    } catch (error: any) {
      console.error('[BookingService] Check VNPAY status error:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Không thể kiểm tra trạng thái thanh toán'
      );
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

  // Helper: Format price calculation request from form data
  formatPriceCalculationRequest(formData: any): PriceCalculationRequest {
    console.log('💰 [formatPriceCalculationRequest] Processing form data:', formData);
    
    const vehicleId = formData.vehicleId || formData.vehicle_id;
    const rentalType = formData.rental_type;
    
    let startAt: string;
    let endAt: string;
    
    if (rentalType === "hourly") {
      // For hourly rental: use current date + start/end times
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startTime = formData.rental_start_time;
      const endTime = formData.rental_end_time;
      
      if (!startTime || !endTime) {
        throw new Error('Start time and end time are required for hourly rental');
      }
      
      const startDateTime = new Date(today);
      startDateTime.setHours(startTime.hour(), startTime.minute(), 0, 0);
      
      const endDateTime = new Date(today);
      endDateTime.setHours(endTime.hour(), endTime.minute(), 0, 0);
      
      startAt = startDateTime.toISOString();
      endAt = endDateTime.toISOString();
      
    } else if (rentalType === "daily") {
      // For daily rental: use rental_period + pickup time
      if (!formData.rental_period || !Array.isArray(formData.rental_period) || formData.rental_period.length !== 2) {
        throw new Error('Rental period is required for daily rental');
      }
      
      const [startDate, endDate] = formData.rental_period;
      const pickupTime = formData.rental_start_time;
      
      if (!pickupTime) {
        throw new Error('Pickup time is required for daily rental');
      }
      
      const startDateTime = new Date(startDate.toDate());
      startDateTime.setHours(pickupTime.hour(), pickupTime.minute(), 0, 0);
      
      const endDateTime = new Date(endDate.toDate());
      endDateTime.setHours(pickupTime.hour(), pickupTime.minute(), 0, 0);
      
      startAt = startDateTime.toISOString();
      endAt = endDateTime.toISOString();
      
    } else {
      // Fallback - direct startAt/endAt if provided
      startAt = formData.startAt;
      endAt = formData.endAt;
    }
    
    const request = {
      vehicleId,
      startAt,
      endAt,
      insurancePremium: formData.insurance?.premium || formData.insurance_premium || false
    };
    
    console.log('🔍 [formatPriceCalculationRequest] Insurance debug:', {
      'formData.insurance?.premium': formData.insurance?.premium,
      'formData.insurance_premium': formData.insurance_premium,
      'final insurancePremium': request.insurancePremium,
      'formData keys': Object.keys(formData)
    });
    
    console.log('✅ [formatPriceCalculationRequest] Final request:', request);
    return request;
  }

  // Helper: Format booking request for API
  formatBookingRequest(formData: any): BookingRequest {
    console.log('🔧 [formatBookingRequest] Processing form data:', formData);
    
    // Handle different field names from the form
    const vehicleId = formData.vehicleId || formData.vehicle_id;
    const stationId = formData.stationId || formData.station_id;
    const rentalType = formData.rental_type;
    
    // Handle date and time based on rental type
    let startAt: Date;
    let endAt: Date;
    
    if (rentalType === "hourly") {
      // For hourly rental: use current date + start/end times
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day
      
      const startTime = formData.rental_start_time;
      const endTime = formData.rental_end_time;
      
      if (!startTime || !endTime) {
        throw new Error('Start time and end time are required for hourly rental');
      }
      
      startAt = new Date(today);
      startAt.setHours(startTime.hour(), startTime.minute(), 0, 0);
      
      endAt = new Date(today);
      endAt.setHours(endTime.hour(), endTime.minute(), 0, 0);
      
      console.log('⏰ [formatBookingRequest] Hourly rental:', { startAt, endAt });
      
    } else if (rentalType === "daily") {
      // For daily rental: use rental_period + pickup time
      if (!formData.rental_period || !Array.isArray(formData.rental_period) || formData.rental_period.length !== 2) {
        throw new Error('Rental period is required for daily rental');
      }
      
      const [startDate, endDate] = formData.rental_period;
      const pickupTime = formData.rental_start_time;
      
      if (!pickupTime) {
        throw new Error('Pickup time is required for daily rental');
      }
      
      startAt = new Date(startDate.toDate());
      startAt.setHours(pickupTime.hour(), pickupTime.minute(), 0, 0);
      
      // For daily rental, end time is typically end of day or same pickup time on end date
      endAt = new Date(endDate.toDate());
      endAt.setHours(pickupTime.hour(), pickupTime.minute(), 0, 0);
      
      console.log('📅 [formatBookingRequest] Daily rental:', { startAt, endAt });
      
    } else {
      // Fallback to original logic for backward compatibility
      if (formData.rental_period && Array.isArray(formData.rental_period)) {
        // If using rental_period array from DatePicker.RangePicker
        const [startDate, endDate] = formData.rental_period;
        const startTime = formData.rental_start_time;
        const endTime = formData.rental_end_time || formData.rental_start_time; // Fallback to start time
        
        startAt = new Date(startDate.toDate());
        if (startTime) {
          startAt.setHours(startTime.hour(), startTime.minute(), 0, 0);
        }
        
        endAt = new Date(endDate.toDate());
        if (endTime) {
          endAt.setHours(endTime.hour(), endTime.minute(), 0, 0);
        }
      } else {
        // Fallback to individual fields
        startAt = new Date(formData.startDate);
        if (formData.startTime) {
          if (typeof formData.startTime === 'string') {
            const [hours, minutes] = formData.startTime.split(':');
            startAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          } else if (formData.startTime.hour) {
            // dayjs object
            startAt.setHours(formData.startTime.hour(), formData.startTime.minute(), 0, 0);
          }
        }
        
        endAt = new Date(formData.endDate);
        if (formData.endTime) {
          if (typeof formData.endTime === 'string') {
            const [hours, minutes] = formData.endTime.split(':');
            endAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          } else if (formData.endTime.hour) {
            // dayjs object
            endAt.setHours(formData.endTime.hour(), formData.endTime.minute(), 0, 0);
          }
        }
      }
      
      console.log('🔄 [formatBookingRequest] Fallback logic:', { startAt, endAt });
    }
    
    // Validate dates
    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      throw new Error('Invalid start or end date');
    }
    
    if (endAt <= startAt) {
      throw new Error('End date must be after start date');
    }
    
    const bookingRequest = {
      vehicleId,
      stationId,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      agreement: {
        accepted: formData.agreement?.accepted || formData.terms_agreement || false
      },
      insuranceOption: {
        premium: formData.insurance?.premium || formData.insurance_premium || false
      }
    };
    
    console.log('✅ [formatBookingRequest] Final booking request:', bookingRequest);
    return bookingRequest;
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

  // ✅ IMPROVED: Fallback price calculation for development/offline mode
  private calculateFallbackPrice(request: PriceCalculationRequest): PriceBreakdown {
    console.log('🔧 [Frontend] Calculating fallback price for:', request);
    
    const startTime = new Date(request.startAt);
    const endTime = new Date(request.endAt);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const days = hours / 24;
    
    // Default rates (should match backend)
    const defaultRates = {
      hourly: 20,  // $20/hour
      daily: 135,  // $135/day
      currency: 'USD'
    };
    
    let basePrice = 0;
    
    // ✅ Same logic as backend
    if (hours >= 24) {
      // Use daily pricing for 24+ hours
      const totalDays = Math.ceil(days);
      
      // Apply weekend multiplier
      for (let i = 0; i < totalDays; i++) {
        const dayDate = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000);
        const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
        const weekendMultiplier = isWeekend ? 1.2 : 1.0;
        basePrice += defaultRates.daily * weekendMultiplier;
      }
    } else {
      // Use hourly pricing for < 24 hours
      const totalHours = Math.ceil(hours);
      
      // Apply peak and weekend multipliers
      for (let i = 0; i < totalHours; i++) {
        const hourStart = new Date(startTime.getTime() + i * 60 * 60 * 1000);
        const hour = hourStart.getHours();
        const isWeekend = hourStart.getDay() === 0 || hourStart.getDay() === 6;
        
        // Peak hours: 7-9 AM and 5-7 PM
        const isPeakHour = (hour >= 7 && hour < 9) || (hour >= 17 && hour < 19);
        
        const peakMultiplier = isPeakHour ? 1.5 : 1.0;
        const weekendMultiplier = isWeekend ? 1.2 : 1.0;
        
        basePrice += defaultRates.hourly * peakMultiplier * weekendMultiplier;
      }
    }
    
    // Calculate additional costs
    const insurancePrice = request.insurancePremium ? basePrice * 0.1 : 0;
    const subtotal = basePrice + insurancePrice;
    const taxes = subtotal * 0.1;
    const total = subtotal + taxes;
    const deposit = total * 0.2;
    
    const breakdown: PriceBreakdown = {
      // Backend format
      hourly_rate: defaultRates.hourly,
      daily_rate: defaultRates.daily,
      currency: defaultRates.currency,
      deposit: Number(deposit.toFixed(2)),
      policy_version: 'fallback-v1.0',
      
      // Frontend format
      basePrice: Number(basePrice.toFixed(2)),
      insurancePrice: Number(insurancePrice.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      totalPrice: Number(total.toFixed(2)),
      details: {
        rawBase: Number(basePrice.toFixed(2)),
        peakMultiplier: 1,
        weekendMultiplier: 1,
        hours: Number(hours.toFixed(2))
      }
    };
    
    console.log('✅ [Frontend] Fallback calculation result:', breakdown);
    return breakdown;
  }
}

// Export singleton instance
export const bookingService = new BookingService();

// Export default instance
export default bookingService;