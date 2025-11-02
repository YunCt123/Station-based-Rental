/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

// Types for rental data
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
  }
};

// Export default service
export default rentalService;