/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';
import type { ApiResponse } from './bookingService';

export interface RentalStatus {
  CONFIRMED: 'CONFIRMED';
  ONGOING: 'ONGOING';
  REJECTED: 'REJECTED';
  RETURN_PENDING: 'RETURN_PENDING';
  COMPLETED: 'COMPLETED';
}

// Active rental statuses (from BE docs)
export const ACTIVE_RENTAL_STATUSES = ['CONFIRMED', 'ONGOING', 'RETURN_PENDING'] as const;

export interface Vehicle {
  _id: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  seats: number;
  battery_kWh: number;
  batteryLevel: number;
  odo_km: number;
  image: string;
  year: number;
  licensePlate?: string;
}

export interface Station {
  _id: string;
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface RentalPickup {
  at?: string;
  photos?: (string | { url: string; _id?: string })[];
  staff_id?: string;
  odo_km?: number;
  soc?: number;
  notes?: string;
  rejected?: {
    at: string;
    reason: string;
    photos: (string | { url: string; _id?: string })[];
    staff_id: string;
  };
}

export interface RentalReturn {
  at?: string | null;
  photos?: (string | { url: string; _id?: string })[];
  odo_km?: number | null;
  soc?: number | null;
  staff_id?: string;
  notes?: string;
}

export interface PricingSnapshot {
  base_price: number;
  insurance_price: number;
  taxes: number;
  total_price: number;
  hourly_rate?: number;
  daily_rate?: number;
  currency: string;
  deposit?: number;
  details?: {
    rentalType?: string; // 'hourly' or 'daily'
    hours?: number;
    days?: number;
  };
}

export interface Rental {
  _id: string;
  status: 'CONFIRMED' | 'ONGOING' | 'REJECTED' | 'RETURN_PENDING' | 'COMPLETED';
  user_id: string;
  booking_id: {
    _id: string;
    start_at: string;
    end_at: string;
    status: string;
    pricing_snapshot?: PricingSnapshot;
    vehicle_snapshot?: any;
    station_snapshot?: any;
    createdAt: string;
  };
  vehicle_id: Vehicle;
  station_id: Station;
  pickup?: RentalPickup;
  return?: RentalReturn;
  pricing_snapshot: PricingSnapshot;
  createdAt: string;
  updatedAt: string;
  charges?: {
    total: number;
    rental_fee: number;
    extra_fees: number;
  };
}

export interface Payment {
  _id: string;
  rental_id: string;
  type: 'DEPOSIT' | 'RENTAL_FINAL' | 'REFUND';
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  provider?: string;
  vnpay_transaction_id?: string;
  created_at: string;
  metadata?: {
    totalCharges?: number;
    depositPaid?: number;
    finalAmount?: number;
    extraFees?: Array<{
      type: string;
      amount: number;
      description: string;
    }>;
  };
}

export interface FinalPaymentResponse {
  finalPayment: {
    amount: number;
    status: string;
  };
  payment?: {
    vnpay_checkout_url: string;
  };
}

export const customerService = {
  // Get user's rentals
  async getMyRentals(params: { limit?: number; page?: number } = {}): Promise<Rental[]> {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      const response = await api.get(`/rentals/?${queryString}`);
      
      // DEBUG: Log the actual API response
      console.log('🔍 [customerService] API Response:', response.data);
      console.log('🔍 [customerService] Rentals data:', response.data.data);
      if (response.data.data) {
        console.log('🔍 [customerService] Rental statuses:', response.data.data.map((r: any) => ({
          id: r._id,
          status: r.status,
          hasPickup: !!r.pickup,
          pickupData: r.pickup
        })));
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
      throw error;
    }
  },

  // Get rental detail
  async getRentalDetail(rentalId: string): Promise<Rental> {
    try {
      const response = await api.get(`/rentals/${rentalId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch rental detail:', error);
      throw error;
    }
  },

  // Get rental payments
  async getRentalPayments(rentalId: string): Promise<Payment[]> {
    try {
      const response = await api.get(`/payments/rentals/${rentalId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch rental payments:', error);
      throw error;
    }
  },

  async getBookingPayments(booking_id: string): Promise<Payment[]> {
    try {
      const response = await api.get(`/payments/bookings/${booking_id}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch rental payments:', error);
      throw error;
    }
  },


  // Complete return (customer final payment)
  async completeReturn(rentalId: string): Promise<FinalPaymentResponse> {
    try {
      const response = await api.post(`/rentals/${rentalId}/complete-return`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to complete return:', error);
      throw error;
    }
  },

  async revertCustomerReturnPayment(rentalId: string): Promise<{ message: string }> {
    try {
      const response = await api.post(`/rentals/${rentalId}/revert-payment`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to revert payment:', error);
      throw error;
    }
  },

  // Create final payment
  async createFinalPayment(rentalId: string, returnUrl: string): Promise<{ payment: { vnpay_checkout_url: string } }> {
    try {
      const response = await api.post(`/payments/rentals/${rentalId}/final`, {
        returnUrl
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to create final payment:', error);
      throw error;
    }
  },

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
    console.log('[BookingService] vnp_ResponseCode trong params:', params.vnp_ResponseCode);
    console.log('[BookingService] status trong params:', params.status);

    const response = await api.post<ApiResponse<{
      message: string;
      status: "SUCCESS" | "FAILED";
      bookingId?: string;
    }>>('/payments/vnpay/callback', params);

    console.log('[BookingService] Backend response:', response.data);
    console.log('[BookingService] Backend response.data.data:', response.data.data);

    if (response.data.success && response.data.data) {
      const responseData = response.data.data;
      
      // Handle different backend response formats
      let result: { status: "SUCCESS" | "FAILED"; bookingId?: string };
      
      if (responseData.status) {
        // New format: {status: "SUCCESS", bookingId: "..."}
        result = responseData;
      } else if (responseData.message === 'ok') {
        // Old format: {message: 'ok'} - consider as success
        result = {
          status: "SUCCESS",
          bookingId: responseData.bookingId || undefined
        };
      } else {
        // Unknown format - consider as failed
        result = {
          status: "FAILED"
        };
      }
      
      console.log('[BookingService] Normalized result:', result);
      return result;
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

};

// ==============================================================================
// ACTIVE RENTAL MANAGEMENT (One Active Rental Per User)  
// ==============================================================================

/**
 * Get user's active rental (CONFIRMED, ONGOING, RETURN_PENDING)
 * Based on BE endpoint: GET /api/v1/rentals/active
 */
export const getUserActiveRental = async (): Promise<Rental | null> => {
  try {
    console.log('🔍 [CustomerService] Checking user active rental...');
    
    const response = await api.get('/rentals/active');
    
    console.log('✅ [CustomerService] Active rental response:', response.data);
    
    if (response.data.success && response.data.data) {
      return response.data.data as Rental;
    }
    
    // No active rental
    return null;
  } catch (error: any) {
    console.error('💥 [CustomerService] Get active rental error:', error);
    
    // If 404 or no data, it means no active rental
    if (error.response?.status === 404) {
      return null;
    }
    
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Không thể kiểm tra trạng thái thuê xe'
    );
  }
};

/**
 * Check if user has any active rental
 * Returns the active rental or null
 */
export const checkUserActiveRental = async (): Promise<{
  hasActiveRental: boolean;
  activeRental: Rental | null;
  statusMessage?: string;
}> => {
  try {
    const activeRental = await getUserActiveRental();
    
    if (!activeRental) {
      return {
        hasActiveRental: false,
        activeRental: null
      };
    }
    
    // Generate user-friendly status message based on BE docs
    const statusMessages = {
      'CONFIRMED': 'đã được xác nhận và chờ nhận xe',
      'ONGOING': 'đang trong quá trình thuê xe', 
      'RETURN_PENDING': 'đã trả xe và chờ thanh toán'
    };
    
    const statusMessage = statusMessages[activeRental.status as keyof typeof statusMessages] || 'đang hoạt động';
    
    return {
      hasActiveRental: true,
      activeRental,
      statusMessage: `Bạn đã có một đơn thuê xe ${statusMessage}. Vui lòng hoàn thành đơn thuê hiện tại trước khi tạo đơn mới.`
    };
  } catch (error: any) {
    console.error('💥 [CustomerService] Check active rental error:', error);
    throw error;
  }
};