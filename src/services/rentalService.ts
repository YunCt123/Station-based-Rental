/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
import type { Rental } from './customerService';

// Types for handover operations
export interface AcceptHandoverPayload {
  action: "accept";
  photos: string[];
  odo_km?: number;
  soc?: number;
  notes?: string;
}

export interface RejectHandoverPayload {
  action: "reject";
  rejectReason: string;
  photos?: string[];
  odo_km?: number;
  soc?: number;
  notes?: string;
}

export type HandoverPayload = AcceptHandoverPayload | RejectHandoverPayload;

export interface HandoverResponse {
  success: boolean;
  data: {
    rental: {
      _id: string;
      status: "ONGOING" | "REJECTED";
      pickup: any;
    };
    photos: Array<{
      _id: string;
      url: string;
      phase: "PICKUP" | "PICKUP_REJECT";
      taken_at: string;
    }>;
    message: string;
  };
}

// Common reject reasons for quick selection
export const COMMON_REJECT_REASONS = [
  "Xe gặp vấn đề kỹ thuật",
  "Pin quá yếu để cho thuê",
  "Phát hiện hư hỏng rõ ràng",
  "Vấn đề về vệ sinh",
  "Lo ngại về an toàn",
  "Xe không có sẵn tại trạm",
  "Tài liệu của khách hàng không hợp lệ",
  "Khách hàng không đủ tuổi lái xe",
  "Khách hàng không đồng ý với điều khoản thuê",
  "Lý do khác (vui lòng ghi rõ bên dưới)",
] as const;

export interface RentalCustomer {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
}

export interface RentalVehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  batteryLevel: number;
  image: string;
  seats: number;
  status: string;
  licensePlate?: string;
  year?: number;
  battery_kWh?: number;
  odo_km?: number;
}

export interface RentalStation {
  id: string;
  name: string;
  address: string;
  city: string;
}

export interface RentalPricing {
  deposit: number;
  total_price: number;
  base_price: number;
  taxes: number;
  currency: string;
  hourly_rate?: number;
  daily_rate?: number;
  insurance_price?: number;
  policy_version?: string;
  details?: {
    rawBase: number;
    rentalType: 'hourly' | 'daily';
    hours: number;
    days: number;
  };
}

export interface RentalCharges {
  rental_fee: number;
  cleaning_fee: number;
  damage_fee: number;
  late_fee: number;
  other_fees: number;
  extra_fees: number;
  total: number;
}

export interface PickupInfo {
  at?: string;
  photos?: Array<{
    _id: string;
    url: string;
    phase: string;
    taken_at: string;
  }>;
  notes?: string;
  odo_km?: number;
  soc?: number;
  staff_id?: string;
  rejected?: {
    at?: string;
    reason?: string;
    photos?: Array<{
      _id: string;
      url: string;
      phase: string;
      taken_at: string;
    }>;
  };
}

export interface ReturnInfo {
  at?: string;
  photos?: Array<{
    _id: string;
    url: string;
    phase: string;
    taken_at: string;
  }>;
  odo_km?: number;
  soc?: number;
  staff_id?: string;
}

export interface PendingReturnRental {
  _id: string;
  booking_id: {
    _id: string;
    start_at: string;
    end_at: string;
    status: string;
    pricing_snapshot: RentalPricing;
  };
  user_id: RentalCustomer | null;
  vehicle_id: RentalVehicle;
  station_id: RentalStation;
  status: 'RETURN_PENDING';
  pickup: PickupInfo;
  return: ReturnInfo;
  pricing_snapshot: RentalPricing;
  charges: RentalCharges;
  createdAt: string;
  updatedAt: string;
}

export interface StationRental {
  _id: string;
  booking_id: string;
  user_id: RentalCustomer;
  vehicle_id: RentalVehicle;
  station_id: RentalStation;
  status: 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  start_at: string;
  end_at: string;
  pickup?: {
    at?: string;
    photos?: string[];
    staff_id?: string;
    odo_km?: number;
    soc?: number;
    notes?: string;
  };
  return?: {
    at?: string;
    photos?: string[];
    odo_km?: number;
    soc?: number;
  };
  charges?: {
    rental_fee: number;
    late_fee: number;
    damage_fee: number;
    total: number;
  };
  pricing_snapshot: RentalPricing;
  createdAt: string;
  updatedAt: string;
}

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

export interface CheckinRequest {
  photos: string[];
  odo_km?: number;
  soc?: number;
  notes?: string;
}

export interface ReturnRequest {
  photos: string[];
  odo_km: number;
  soc: number;
  extraFees?: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
}

export interface ReturnResponse {
  rental: StationRental;
  photos: Array<{ _id: string; url: string; taken_at: string }>;
  vehicleStatus: string;
  payment: {
    totalCharges: number;
    depositPaid: number;
    finalAmount: number;
    finalPayment: Record<string, unknown> | null;
    needsPayment: boolean;
    needsRefund: boolean;
  };
  message: string;
}

export interface CashPaymentRequest {
  amount: number;
  note?: string;
}

export interface CashPaymentResponse {
  success: boolean;
  data: {
    rental: PendingReturnRental;
    payment: {
      id: string;
      transaction_ref: string;
      status: 'SUCCESS';
      type: 'CASH';
      amount: number;
    };
    message: string;
  };
}

export const rentalService = {
  /**
   * Get rentals by station (for staff)
   * GET /v1/rentals/station/{stationId}
   */
  async getStationRentals(
    stationId: string, 
    status: 'ONGOING' | 'COMPLETED' | 'CANCELLED' = 'ONGOING'
  ): Promise<StationRental[]> {
    try {
      console.log('[RentalService] Getting station rentals:', { stationId, status });
      
      const response = await api.get<ApiResponse<StationRental[]>>(
        `/rentals/station/${stationId}?status=${status}`
      );
      
      if (response.data.success && response.data.data) {
        console.log('[RentalService] Station rentals retrieved:', {
          count: response.data.data.length,
          rentals: response.data.data.map(r => ({
            id: r._id,
            status: r.status,
            startAt: r.start_at,
            endAt: r.end_at,
            vehicle: r.vehicle_id?.name || 'Unknown',
            hasPickupPhotos: (r.pickup?.photos?.length || 0) > 0
          }))
        });
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('[RentalService] Get station rentals error:', error);
      return [];
    }
  },

  /**
   * Get pending returns (for staff/admin dashboard)
   * GET /v1/rentals/pending-returns?search=&stationId=&limit=&page=
   */
  async getPendingReturns(
    options: {
      search?: string;
      stationId?: string;
      limit?: number;
      page?: number;
    } = {}
  ): Promise<ApiResponse<PendingReturnRental[]>> {
    try {
      console.log('[RentalService] Getting pending returns:', options);
      
      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.stationId) params.append('stationId', options.stationId);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.page) params.append('page', options.page.toString());
      
      const response = await api.get<ApiResponse<PendingReturnRental[]>>(
        `/rentals/pending-returns?${params.toString()}`
      );
      
      if (response.data.success) {
        console.log('[RentalService] Pending returns retrieved:', {
          count: response.data.data?.length || 0,
          total: response.data.meta?.total || 0,
          page: response.data.meta?.page || 1
        });
        return response.data;
      }
      
      return { success: false, data: [], meta: undefined };
    } catch (error: any) {
      console.error('[RentalService] Get pending returns error:', error);
      return { success: false, data: [], meta: undefined };
    }
  },

  /**
   * Process cash payment for pending return (only cash, disables other methods)
   * POST /v1/rentals/{id}/payment-cash
   */
  async paymentCash(
    rentalId: string,
    paymentData: CashPaymentRequest
  ): Promise<CashPaymentResponse> {
    try {
      
      const response = await api.post<CashPaymentResponse>(
        `/rentals/${rentalId}/complete-cash`,
        paymentData
      );
      
      if (response.data.success) {
        console.log('[RentalService] Cash payment processed successfully:', response.data);
        return response.data;
      }
      
      throw new Error('Failed to process cash payment');
    } catch (error: any) {
      console.error('[RentalService] Cash payment error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to process cash payment');
    }
  },

  /**
   * Checkin vehicle (when customer comes to collect)
   * POST /v1/rentals/{id}/checkin
   */
  async checkinVehicle(rentalId: string, checkinData: CheckinRequest): Promise<StationRental> {
    try {
      console.log('[RentalService] Checking in vehicle:', { rentalId, checkinData });
      
      const response = await api.post<ApiResponse<StationRental>>(
        `/rentals/${rentalId}/checkin`,
        checkinData
      );
      
      if (response.data.success && response.data.data) {
        console.log('[RentalService] Vehicle checked in successfully:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to checkin vehicle');
    } catch (error: any) {
      console.error('[RentalService] Checkin vehicle error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to checkin vehicle');
    }
  },

  /**
   * Return vehicle (when customer returns vehicle)
   * POST /v1/rentals/{id}/return
   */
  async returnVehicle(rentalId: string, returnData: ReturnRequest): Promise<ReturnResponse> {
    try {
      console.log('[RentalService] Returning vehicle:', { rentalId, returnData });
      
      const response = await api.post<ApiResponse<ReturnResponse>>(
        `/rentals/${rentalId}/return`,
        returnData
      );
      
      if (response.data.success && response.data.data) {
        console.log('[RentalService] Vehicle returned successfully:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Failed to return vehicle');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('[RentalService] Return vehicle error:', error);
      throw new Error(err.response?.data?.message || err.message || 'Failed to return vehicle');
    }
  },

  /**
   * Get rental by ID
   * GET /v1/rentals/{id}
   */
  async getRentalById(rentalId: string): Promise<StationRental> {
    try {
      console.log('[RentalService] Getting rental by ID:', rentalId);
      
      const response = await api.get<ApiResponse<StationRental>>(`/rentals/${rentalId}`);
      
      if (response.data.success && response.data.data) {
        console.log('[RentalService] Rental retrieved:', response.data.data);
        return response.data.data;
      }
      
      throw new Error('Rental not found');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('[RentalService] Get rental error:', error);
      throw new Error(err.response?.data?.message || err.message || 'Failed to get rental');
    }
  },

  /**
   * Get user's rentals
   * GET /v1/rentals
   */
  async getUserRentals(): Promise<StationRental[]> {
    try {
      console.log('[RentalService] Getting user rentals');
      
      const response = await api.get<ApiResponse<StationRental[]>>('/rentals');
      
      if (response.data.success && response.data.data) {
        console.log('[RentalService] User rentals retrieved:', response.data.data.length);
        return response.data.data;
      }
      
      return [];
    } catch (error: unknown) {
      console.error('[RentalService] Get user rentals error:', error);
      return [];
    }
  },

  // Vehicle Handover Operations
  // Process vehicle handover (accept or reject)
  async processHandover(rentalId: string, payload: HandoverPayload): Promise<HandoverResponse> {
    try {
      console.log(`🚗 [rentalService] Processing handover for rental ${rentalId}:`, payload);
      
      const response = await api.post(`/rentals/${rentalId}/checkin`, payload);
      
      if (response.data.success) {
        console.log("✅ [rentalService] Handover processed successfully:", response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || "Handover processing failed");
      }
    } catch (error: unknown) {
      console.error("❌ [rentalService] Handover processing failed:", error);
      
      let errorMessage = "Failed to process handover";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: { message?: string } } } };
        if (axiosError.response?.data?.error?.message) {
          errorMessage = axiosError.response.data.error.message;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Accept handover with photos
  async acceptHandover(
    rentalId: string, 
    photos: string[], 
    vehicleData?: { odo_km?: number; soc?: number; notes?: string }
  ): Promise<HandoverResponse> {
    const payload: AcceptHandoverPayload = {
      action: "accept",
      photos,
      ...vehicleData
    };
    
    return this.processHandover(rentalId, payload);
  },

  // Reject handover with reason
  async rejectHandover(
    rentalId: string,
    rejectReason: string,
    photos?: string[],
    vehicleData?: { odo_km?: number; soc?: number; notes?: string }
  ): Promise<HandoverResponse> {
    if (!rejectReason || rejectReason.trim().length < 5) {
      throw new Error("Reject reason must be at least 5 characters long");
    }

    const payload: RejectHandoverPayload = {
      action: "reject", 
      rejectReason: rejectReason.trim(),
      photos,
      ...vehicleData
    };
    
    return this.processHandover(rentalId, payload);
  },

  // Get rentals ready for handover at a station
  async getStationHandovers(stationId: string): Promise<Rental[]> {
    try {
      const response = await api.get(`/rentals/station/${stationId}?status=CONFIRMED`);
      return response.data.data || [];
    } catch (error) {
      console.error("❌ [rentalService] Failed to get station handovers:", error);
      throw new Error("Failed to load pending handovers");
    }
  },

  // Get all rentals (admin)
  async getAllRentals(): Promise<StationRental[]> {
    try {
      const response = await api.get<ApiResponse<StationRental[]>>('/rentals/all');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("❌ [rentalService] Failed to get all rentals:", error);
      throw new Error("Failed to load rentals");
    }
  }
};

// Export default service
export default rentalService;