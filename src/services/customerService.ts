import api from './api';

export interface RentalStatus {
  CONFIRMED: 'CONFIRMED';
  ONGOING: 'ONGOING';
  RETURN_PENDING: 'RETURN_PENDING';
  COMPLETED: 'COMPLETED';
}

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
  photos?: string[];
  staff_id?: string;
  odo_km?: number;
  soc?: number;
  notes?: string;
}

export interface RentalReturn {
  at?: string | null;
  photos?: string[];
  odo_km?: number | null;
  soc?: number | null;
  staff_id?: string;
  notes?: string;
}

export interface PricingSnapshot {
  hourly_rate?: number;
  daily_rate?: number;
  currency: string;
  deposit?: number;
}

export interface Rental {
  _id: string;
  status: 'CONFIRMED' | 'ONGOING' | 'RETURN_PENDING' | 'COMPLETED';
  user_id: string;
  vehicle_id: Vehicle;
  station_id: Station;
  pickup?: RentalPickup;
  return?: RentalReturn;
  pricing_snapshot: PricingSnapshot;
  start_time: string;
  end_time: string;
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
  }
};