import api from './api';

// Types based on backend models
export interface AdminVehicle {
  _id: string;
  name: string;
  year: number;
  brand: string;
  model: string;
  type: string;
  image?: string;
  licensePlate?: string;
  station_id?: string;
  station_name?: string;
  status: 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE';
  status_reason?: string;
  lock_version: number;
  batteryLevel?: number;
  battery_soc?: number;
  battery_kWh?: number;
  range?: number;
  seats: number;
  pricePerHour?: number;
  pricePerDay?: number;
  pricing?: {
    hourly?: number;
    daily?: number;
    currency: string;
  };
  rating: number;
  reviewCount: number;
  trips: number;
  features?: string[];
  condition: string;
  lastMaintenance?: string;
  mileage?: number;
  odo_km?: number;
  fuelEfficiency?: string;
  consumption_wh_per_km?: number;
  inspectionDate?: string;
  inspection_due_at?: string;
  insuranceExpiry?: string;
  insurance_expiry_at?: string;
  description?: string;
  active: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleRequest {
  name: string;
  year: number;
  brand?: string;
  model?: string;
  type?: string;
  image?: string;
  licensePlate?: string;
  station_id?: string;
  station_name?: string;
  pricePerHour?: number;
  pricePerDay?: number;
  pricing?: {
    hourly?: number;
    daily?: number;
    currency?: string;
  };
  battery_kWh?: number;
  batteryLevel?: number;
  range?: number;
  odo_km?: number;
  seats?: number;
  features?: string[];
  condition?: 'excellent' | 'good' | 'fair';
  description?: string;
  tags?: string[];
  status?: 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE';
  active?: boolean;
}

export interface UpdateVehicleRequest {
  name?: string;
  year?: number;
  brand?: string;
  model?: string;
  type?: string;
  image?: string;
  licensePlate?: string;
  station_id?: string;
  station_name?: string;
  status?: 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE';
  batteryLevel?: number;
  battery_kWh?: number;
  pricePerHour?: number;
  pricePerDay?: number;
  pricing?: {
    hourly?: number;
    daily?: number;
    currency?: string;
  };
  range?: number;
  odo_km?: number;
  seats?: number;
  features?: string[];
  condition?: 'excellent' | 'good' | 'fair';
  description?: string;
  tags?: string[];
  active?: boolean;
}

export interface VehicleSearchFilters {
  search?: string;
  type?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  batteryLevel?: number;
  seats?: number;
  status?: string;
  active?: boolean;
  limit?: number;
  page?: number;
  sort?: string;
}

export interface VehicleListResponse {
  success: boolean;
  data: AdminVehicle[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VehicleResponse {
  success: boolean;
  data: AdminVehicle;
}

export const adminVehicleService = {
  // Get all vehicles with filters
  async getAllVehicles(filters: VehicleSearchFilters = {}): Promise<VehicleListResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      console.log(`[adminVehicleService] Getting vehicles with filters:`, filters);
      console.log(`[adminVehicleService] API URL: /vehicles?${params.toString()}`);
      
      const response = await api.get(`/vehicles?${params.toString()}`);
      console.log(`[adminVehicleService] Get vehicles response:`, response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  // Search vehicles
  async searchVehicles(filters: VehicleSearchFilters = {}): Promise<VehicleListResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/vehicles/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  },

  // Get vehicle by ID
  async getVehicleById(id: string): Promise<VehicleResponse> {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  },

  // Create new vehicle
  async createVehicle(vehicleData: CreateVehicleRequest | FormData): Promise<VehicleResponse> {
    try {
      const isFormData = vehicleData instanceof FormData;
      console.log('=== CREATE VEHICLE API CALL ===');
      console.log('Is FormData:', isFormData);
      
      if (isFormData) {
        console.log('FormData contents:');
        for (const pair of vehicleData.entries()) {
          console.log(pair[0] + ':', pair[1]);
        }
      } else {
        console.log('JSON data:', vehicleData);
      }
      
      const headers = isFormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };
        
      console.log('Request headers:', headers);
      
      const response = await api.post('/vehicles', vehicleData, { headers });
      
      console.log('=== CREATE RESPONSE ===');
      console.log('Response data:', response.data);
      console.log('Image URL in response:', response.data?.data?.image);
      
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  // Update vehicle
  async updateVehicle(id: string, vehicleData: UpdateVehicleRequest | FormData): Promise<VehicleResponse> {
    try {
      console.log(`=== UPDATE VEHICLE API CALL (${id}) ===`);
      const isFormData = vehicleData instanceof FormData;
      console.log('Is FormData:', isFormData);
      
      if (isFormData) {
        console.log('FormData contents:');
        for (const pair of vehicleData.entries()) {
          console.log(pair[0] + ':', pair[1]);
        }
      } else {
        console.log('JSON data:', vehicleData);
      }
      
      const headers = isFormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };
        
      console.log('Request headers:', headers);
      
      const response = await api.patch(`/vehicles/${id}`, vehicleData, { headers });
      
      console.log('=== UPDATE RESPONSE ===');
      console.log('Response data:', response.data);
      console.log('Image URL in response:', response.data?.data?.image);
      
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  },

  // Delete vehicle
  async deleteVehicle(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  // Get vehicles by station
  async getVehiclesByStation(stationId: string): Promise<VehicleListResponse> {
    try {
      const response = await api.get(`/vehicles/stations/${stationId}/available`);
      return response.data;
    } catch (error) {
      console.error('Error fetching station vehicles:', error);
      throw error;
    }
  },

  // Update vehicle status
  async updateVehicleStatus(id: string, status: 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE', reason?: string): Promise<VehicleResponse> {
    try {
      const response = await api.patch(`/vehicles/${id}`, { 
        status,
        ...(reason && { status_reason: reason })
      });
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw error;
    }
  },

  // Bulk operations
  async bulkUpdateStatus(vehicleIds: string[], status: 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE'): Promise<{ success: boolean; updated: number }> {
    try {
      const promises = vehicleIds.map(id => 
        this.updateVehicleStatus(id, status)
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      return {
        success: successful > 0,
        updated: successful
      };
    } catch (error) {
      console.error('Error bulk updating vehicles:', error);
      throw error;
    }
  },

  // Get vehicle statistics
  async getVehicleStats(): Promise<{
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    reserved: number;
  }> {
    try {
      // Get basic stats by fetching all vehicles and calculating
      const response = await this.getAllVehicles({ limit: 1000 });
      const vehicles = response.data;
      
      return {
        total: vehicles.length,
        available: vehicles.filter(v => v.status === 'AVAILABLE').length,
        rented: vehicles.filter(v => v.status === 'RENTED').length,
        maintenance: vehicles.filter(v => v.status === 'MAINTENANCE').length,
        reserved: vehicles.filter(v => v.status === 'RESERVED').length,
      };
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      throw error;
    }
  }
};

export default adminVehicleService;