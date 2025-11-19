/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

// Types based on backend models
export interface AdminStation {
  _id: string;
  name: string;
  address?: string;
  city: string;
  geo: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  totalSlots: number;
  amenities: string[];
  fastCharging: boolean;
  rating: {
    avg: number;
    count: number;
  };
  operatingHours: {
    mon_fri?: string;
    weekend?: string;
    holiday?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  manager_id?: string;
  staff_ids: string[];
  metrics: {
    vehicles_total: number;
    vehicles_available: number;
    vehicles_in_use: number;
    utilization_rate: number;
  };
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStationRequest {
  name: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  capacity?: number;
  operatingHours?: {
    open?: string;
    close?: string;
  };
  amenities?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

export interface UpdateStationRequest {
  name?: string;
  address?: string;
  city?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  capacity?: number;
  operatingHours?: {
    open?: string;
    close?: string;
  };
  amenities?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  isActive?: boolean;
}

export interface StationSearchFilters {
  search?: string;
  city?: string;
  status?: string;
  limit?: number;
  page?: number;
  sort?: string;
}

export interface NearbyStationRequest {
  lng: number;
  lat: number;
  radiusKm?: number;
}

export interface StationListResponse {
  success: boolean;
  data: AdminStation[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StationResponse {
  success: boolean;
  data: AdminStation;
}

export const adminStationService = {
  // Get all stations with filters
  async getAllStations(filters: StationSearchFilters = {}): Promise<StationListResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/stations?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stations:', error);
      throw error;
    }
  },

  // Get station by ID
  async getStationById(id: string): Promise<StationResponse> {
    try {
      const response = await api.get(`/stations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching station:', error);
      throw error;
    }
  },

  // Create new station
  async createStation(stationData: CreateStationRequest): Promise<StationResponse> {
    try {
      // Backend expects body.geo.coordinates as array [lng, lat]
      // But validation middleware checks body.coordinates first
      const requestBody: any = {
        name: stationData.name,
        address: stationData.address,
        city: stationData.city,
        totalSlots: stationData.capacity || 10,
        amenities: stationData.amenities || []
      };
      
      // Extract coordinates from either format
      let lng: number, lat: number;
      
      if ((stationData as any).geo && (stationData as any).geo.coordinates) {
        // Format: geo.coordinates = [lng, lat]
        [lng, lat] = (stationData as any).geo.coordinates;
      } else if (stationData.coordinates && stationData.coordinates.lat && stationData.coordinates.lng) {
        // Format: coordinates = { lat, lng }
        lng = stationData.coordinates.lng;
        lat = stationData.coordinates.lat;
      } else {
        console.error('Missing coordinates in stationData:', stationData);
        throw new Error('Coordinates (lat, lng) are required');
      }
      
      // Send BOTH formats to satisfy validation middleware AND controller
      requestBody.coordinates = { lat, lng };  // For validation middleware
      requestBody.geo = {
        type: 'Point',           // GeoJSON type (required)
        coordinates: [lng, lat]  // For controller (GeoJSON format: [longitude, latitude])
      };
      
      // Add operating hours if provided
      if (stationData.operatingHours) {
        requestBody.operatingHours = {
          mon_fri: `${stationData.operatingHours.open || '06:00'} - ${stationData.operatingHours.close || '22:00'}`
        };
      }
      
      // Add optional fields
      if ((stationData as any).image) requestBody.image = (stationData as any).image;
      if ((stationData as any).description) requestBody.description = (stationData as any).description;
      
      console.log('Creating station with data:', requestBody);
      const response = await api.post('/stations', requestBody);
      return response.data;
    } catch (error) {
      console.error('Error creating station:', error);
      throw error;
    }
  },

  // Update station
  async updateStation(id: string, stationData: UpdateStationRequest): Promise<StationResponse> {
    try {
      const transformedData: any = {};
      
      // Only include fields that are provided
      if (stationData.name) transformedData.name = stationData.name;
      if (stationData.address) transformedData.address = stationData.address;
      if (stationData.city) transformedData.city = stationData.city;
      if (stationData.capacity) transformedData.totalSlots = stationData.capacity;
      if (stationData.amenities) transformedData.amenities = stationData.amenities;
      if (stationData.isActive !== undefined) {
        transformedData.status = stationData.isActive ? 'ACTIVE' : 'INACTIVE';
      }
      
      // Transform coordinates if provided - backend expects geo.coordinates = [lng, lat]
      // Check if geo is already provided (from StationManagement)
      if ((stationData as any).geo && (stationData as any).geo.coordinates) {
        transformedData.geo = (stationData as any).geo;
      } else if (stationData.coordinates && stationData.coordinates.lat && stationData.coordinates.lng) {
        transformedData.geo = {
          coordinates: [stationData.coordinates.lng, stationData.coordinates.lat]
        };
      }
      
      // Transform operating hours if provided
      if (stationData.operatingHours) {
        transformedData.operatingHours = {
          mon_fri: `${stationData.operatingHours.open || '06:00'} - ${stationData.operatingHours.close || '22:00'}`
        };
      }
      
      // Add optional fields
      if ((stationData as any).image) transformedData.image = (stationData as any).image;
      if ((stationData as any).description) transformedData.description = (stationData as any).description;
      
      console.log('Updating station with data:', transformedData);
      const response = await api.patch(`/stations/${id}`, transformedData);
      return response.data;
    } catch (error) {
      console.error('Error updating station:', error);
      throw error;
    }
  },

  // Delete station
  async deleteStation(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/stations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting station:', error);
      throw error;
    }
  },

  // Find nearby stations
  async findNearbyStations(params: NearbyStationRequest): Promise<StationListResponse> {
    try {
      const queryParams = new URLSearchParams({
        lng: params.lng.toString(),
        lat: params.lat.toString(),
        ...(params.radiusKm && { radiusKm: params.radiusKm.toString() })
      });

      const response = await api.get(`/stations/nearby?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error finding nearby stations:', error);
      throw error;
    }
  },

  // Get stations by city
  async getStationsByCity(city: string): Promise<StationListResponse> {
    try {
      const response = await api.get(`/stations/city/${encodeURIComponent(city)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stations by city:', error);
      throw error;
    }
  },

  // Get vehicles at station
  async getStationVehicles(stationId: string): Promise<any> {
    try {
      const response = await api.get(`/stations/${stationId}/vehicles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching station vehicles:', error);
      throw error;
    }
  },

  // Update station status
  async updateStationStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE'): Promise<StationResponse> {
    try {
      const response = await api.patch(`/stations/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating station status:', error);
      throw error;
    }
  },

  // Bulk operations
  async bulkUpdateStatus(stationIds: string[], status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE'): Promise<{ success: boolean; updated: number }> {
    try {
      const promises = stationIds.map(id => 
        this.updateStationStatus(id, status)
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      return {
        success: successful > 0,
        updated: successful
      };
    } catch (error) {
      console.error('Error bulk updating stations:', error);
      throw error;
    }
  },

  // Get station statistics
  async getStationStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    maintenance: number;
    totalVehicles: number;
    totalSlots: number;
  }> {
    try {
      const response = await this.getAllStations({ limit: 1000 });
      const stations = response.data;
      
      return {
        total: stations.length,
        active: stations.filter(s => s.status === 'ACTIVE').length,
        inactive: stations.filter(s => s.status === 'INACTIVE').length,
        maintenance: stations.filter(s => s.status === 'UNDER_MAINTENANCE').length,
        totalVehicles: stations.reduce((sum, s) => sum + s.metrics.vehicles_total, 0),
        totalSlots: stations.reduce((sum, s) => sum + s.totalSlots, 0),
      };
    } catch (error) {
      console.error('Error fetching station stats:', error);
      throw error;
    }
  },

  // Update station metrics (typically called by background jobs)
  async updateStationMetrics(stationId: string): Promise<StationResponse> {
    try {
      // This would typically call a specific endpoint for updating metrics
      // For now, we'll use the general update endpoint
      const response = await api.patch(`/stations/${stationId}/metrics`, {});
      return response.data;
    } catch (error) {
      console.error('Error updating station metrics:', error);
      throw error;
    }
  },

  // Search functionality
  async searchStations(query: string): Promise<StationListResponse> {
    try {
      const response = await this.getAllStations({
        search: query,
        limit: 50
      });
      return response;
    } catch (error) {
      console.error('Error searching stations:', error);
      throw error;
    }
  }
};

export default adminStationService;