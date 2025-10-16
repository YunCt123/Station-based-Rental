import api from "./api";
import type { Vehicle } from "@/types/vehicle";

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

// Backend station data structure
export interface BackendStation {
  _id: string;
  id?: string;
  name: string;
  address?: string;
  city?: string;
  geo: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  totalSlots?: number;
  amenities?: string[];
  fastCharging?: boolean;
  rating?: {
    avg: number;
    count: number;
  };
  operatingHours?: {
    mon_fri?: string;
    weekend?: string;
    holiday?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  manager_id?: string;
  staff_ids?: string[];
  metrics?: {
    vehicles_total: number;
    vehicles_available: number;
    vehicles_in_use: number;
    utilization_rate: number;
  };
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Frontend station interface
export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  totalSlots: number;
  availableVehicles: number;
  totalVehicles: number;
  amenities: string[];
  fastCharging: boolean;
  rating: number;
  reviewCount: number;
  operatingHours: {
    weekday?: string;
    weekend?: string;
    holiday?: string;
  };
  status: 'active' | 'inactive' | 'maintenance';
  image: string;
  utilizationRate: number;
  distance?: number; // For nearby searches
}

// Station search filters
export interface StationSearchFilters {
  city?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  fastCharging?: boolean;
  amenities?: string[];
  minRating?: number;
}

// Search options
export interface SearchOptions {
  limit?: number;
  page?: number;
  sort?: string;
}

// Nearby search options
export interface NearbySearchOptions {
  lng: number;
  lat: number;
  radiusKm?: number;
}

// Pagination meta information
export interface PaginationMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Mapping function to convert backend station data to frontend format
function mapBackendStationToFrontend(backendStation: BackendStation): Station {

  const mapped: Station = {
    id: backendStation._id || backendStation.id || "",
    name: backendStation.name,
    address: backendStation.address || "",
    city: backendStation.city || "",
    coordinates: {
      lat: backendStation.geo?.coordinates?.[1] || 0,
      lng: backendStation.geo?.coordinates?.[0] || 0,
    },
    totalSlots: backendStation.totalSlots || 0,
    availableVehicles: backendStation.metrics?.vehicles_available || 0,
    totalVehicles: backendStation.metrics?.vehicles_total || 0,
    amenities: backendStation.amenities || [],
    fastCharging: backendStation.fastCharging || false,
    rating: backendStation.rating?.avg || 0,
    reviewCount: backendStation.rating?.count || 0,
    operatingHours: {
      weekday: backendStation.operatingHours?.mon_fri,
      weekend: backendStation.operatingHours?.weekend,
      holiday: backendStation.operatingHours?.holiday,
    },
    status: mapBackendStatusToFrontend(backendStation.status),
    image: backendStation.image || "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop&crop=center",
    utilizationRate: backendStation.metrics?.utilization_rate || 0,
  };

  return mapped;
}

// Map backend status to frontend status
function mapBackendStatusToFrontend(backendStatus: string): "active" | "inactive" | "maintenance" {
  switch (backendStatus) {
    case 'ACTIVE':
      return 'active';
    case 'INACTIVE':
      return 'inactive';
    case 'UNDER_MAINTENANCE':
      return 'maintenance';
    default:
      return 'active';
  }
}

export const stationService = {
  /**
   * Test connection to backend
   */
  async testConnection(): Promise<unknown> {
    try {
      console.log('🔗 Testing station API connection...');
      const response = await api.get('/stations?limit=1');
      console.log('Station API connection test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Station API connection test failed:', error);
      throw error;
    }
  },

  /**
   * Get all stations with optional filtering
   * GET /v1/stations
   */
  async getAllStations(
    filters: StationSearchFilters = {},
    options: SearchOptions = {}
  ): Promise<{ stations: Station[]; meta?: PaginationMeta }> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      // Add options to query params
      if (options.limit) params.append('limit', String(options.limit));
      if (options.page) params.append('page', String(options.page));
      if (options.sort) params.append('sort', options.sort);
      
      const url = `/stations?${params.toString()}`;
      console.log('🚀 Making station API request to:', url);
      console.log('🔍 Filters:', filters);
      console.log('⚙️ Options:', options);
      
      const response = await api.get<ApiResponse<BackendStation[]>>(url);
      
      console.log('✅ Station API Response:', response.data);
      console.log('📊 Raw station data:', response.data.data);
      
      const stations = response.data.data.map(mapBackendStationToFrontend);
      
      console.log('🔄 Mapped stations:', stations);
      
      return {
        stations,
        meta: response.data.meta
      };
    } catch (error: any) {
      console.error('❌ Error fetching stations:', error);
      if (error.response) {
        console.error('📄 Error response data:', error.response.data);
        console.error('📊 Error status:', error.response.status);
      }
      throw error;
    }
  },

  /**
   * Find nearby stations
   * GET /v1/stations/nearby
   */
  async findNearbyStations(
    searchOptions: NearbySearchOptions
  ): Promise<Station[]> {
    try {
      const { lng, lat, radiusKm = 10 } = searchOptions;
      
      const params = new URLSearchParams({
        lng: String(lng),
        lat: String(lat),
        radiusKm: String(radiusKm)
      });
      
      const url = `/stations/nearby?${params.toString()}`;
      console.log('🌍 Finding nearby stations:', url);
      
      const response = await api.get<ApiResponse<BackendStation[]>>(url);
      
      const stations = response.data.data.map(mapBackendStationToFrontend);
      
      // Calculate distance for each station (approximate)
      stations.forEach(station => {
        station.distance = calculateDistance(
          lat, lng,
          station.coordinates.lat, station.coordinates.lng
        );
      });
      
      return stations.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      console.error('❌ Error finding nearby stations:', error);
      throw error;
    }
  },

  /**
   * Get station by ID
   * GET /v1/stations/{id}
   */
  async getStationById(id: string, includeVehicles = false): Promise<Station> {
    try {
      const params = new URLSearchParams();
      if (includeVehicles) params.append('includeVehicles', 'true');
      
      const url = `/stations/${id}${params.toString() ? '?' + params.toString() : ''}`;
      console.log('🎯 Getting station by ID:', url);
      
      const response = await api.get<ApiResponse<BackendStation>>(url);
      return mapBackendStationToFrontend(response.data.data);
    } catch (error) {
      console.error('❌ Error getting station by ID:', error);
      throw error;
    }
  },

  /**
   * Get stations by city
   * GET /v1/stations/city/{city}
   */
  async getStationsByCity(city: string): Promise<Station[]> {
    try {
      console.log('🏙️ Getting stations by city:', city);
      
      const response = await api.get<ApiResponse<BackendStation[]>>(`/stations/city/${encodeURIComponent(city)}`);
      return response.data.data.map(mapBackendStationToFrontend);
    } catch (error) {
      console.error('❌ Error getting stations by city:', error);
      throw error;
    }
  },

  /**
   * Get vehicles at a specific station
   * GET /v1/stations/{id}/vehicles
   */
  async getStationVehicles(stationId: string, status?: string): Promise<{
    station: { id: string; name: string; address: string };
    vehicles: Vehicle[];
    count: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      const url = `/stations/${stationId}/vehicles${params.toString() ? '?' + params.toString() : ''}`;
      console.log('🚗 Getting station vehicles:', url);
      
      const response = await api.get<ApiResponse<{
        station: { id: string; name: string; address: string };
        vehicles: Vehicle[];
        count: number;
      }>>(url);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error getting station vehicles:', error);
      throw error;
    }
  },

  /**
   * Create new station (Admin only)
   * POST /v1/stations
   */
  async createStation(stationData: Partial<BackendStation>): Promise<Station> {
    try {
      console.log('➕ Creating station:', stationData);
      
      const response = await api.post<ApiResponse<BackendStation>>('/stations', stationData);
      return mapBackendStationToFrontend(response.data.data);
    } catch (error) {
      console.error('❌ Error creating station:', error);
      throw error;
    }
  },

  /**
   * Update station (Admin/Staff only)
   * PATCH /v1/stations/{id}
   */
  async updateStation(id: string, updateData: Partial<BackendStation>): Promise<Station> {
    try {
      console.log('📝 Updating station:', id, updateData);
      
      const response = await api.patch<ApiResponse<BackendStation>>(`/stations/${id}`, updateData);
      return mapBackendStationToFrontend(response.data.data);
    } catch (error) {
      console.error('❌ Error updating station:', error);
      throw error;
    }
  },

  /**
   * Delete station (Admin only)
   * DELETE /v1/stations/{id}
   */
  async deleteStation(id: string): Promise<void> {
    try {
      console.log('🗑️ Deleting station:', id);
      
      await api.delete(`/stations/${id}`);
    } catch (error) {
      console.error('❌ Error deleting station:', error);
      throw error;
    }
  },

  /**
   * Helper function to get active stations only
   */
  async getActiveStations(
    additionalFilters: Omit<StationSearchFilters, 'status'> = {},
    options: SearchOptions = {}
  ): Promise<{ stations: Station[]; meta?: PaginationMeta }> {
    return this.getAllStations(
      { ...additionalFilters, status: 'ACTIVE' },
      options
    );
  },

  /**
   * Helper function to search stations by amenities
   */
  async searchStationsByAmenities(
    amenities: string[],
    additionalFilters: StationSearchFilters = {},
    options: SearchOptions = {}
  ): Promise<{ stations: Station[]; meta?: PaginationMeta }> {
    return this.getAllStations(
      {
        ...additionalFilters,
        amenities,
        status: 'ACTIVE'
      },
      options
    );
  },

  /**
   * Helper function to find stations with fast charging
   */
  async getFastChargingStations(
    additionalFilters: StationSearchFilters = {},
    options: SearchOptions = {}
  ): Promise<{ stations: Station[]; meta?: PaginationMeta }> {
    return this.getAllStations(
      {
        ...additionalFilters,
        fastCharging: true,
        status: 'ACTIVE'
      },
      options
    );
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Export individual functions for backward compatibility
export const {
  getAllStations,
  findNearbyStations,
  getStationById,
  getStationsByCity,
  getStationVehicles,
  createStation,
  updateStation,
  deleteStation,
  getActiveStations,
  searchStationsByAmenities,
  getFastChargingStations
} = stationService;

// Default export
export default stationService;
