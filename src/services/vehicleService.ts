import api from "./api";
import type { 
  Vehicle, 
  BackendVehicle, 
  ApiResponse, 
  PaginationMeta, 
  VehicleSearchFilters, 
  SearchOptions
} from "@/types/vehicle";

// Mapping function to convert backend vehicle data to frontend format
function mapBackendVehicleToFrontend(backendVehicle: BackendVehicle): Vehicle {
  
  const validTypes = ["SUV", "Sedan", "Hatchback", "Crossover", "Coupe", "Motorcycle", "Scooter", "Bike", "Bus", "Van", "Truck"];
  const validConditions = ["excellent", "good", "fair", "poor"];
  
  const mapped = {
    id: backendVehicle._id || backendVehicle.id || "",
    name: backendVehicle.name,
    lockVersion: backendVehicle.lock_version || 0,
    active: backendVehicle.active !== undefined ? backendVehicle.active : true,
    year: backendVehicle.year,
    brand: backendVehicle.brand || "",
    model: backendVehicle.model || "",
    type: (validTypes.includes(backendVehicle.type || "") ? backendVehicle.type : "SUV") as Vehicle["type"],
    image: backendVehicle.image || "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop&crop=center",
    batteryLevel: backendVehicle.batteryLevel || (backendVehicle.battery_soc ? backendVehicle.battery_soc * 100 : 0),
    batterykWh: backendVehicle.battery_kWh || 0,
    location: backendVehicle.station_name || "Unknown Location",
    availability: mapBackendStatusToFrontend(backendVehicle.status),
    pricePerHour: backendVehicle.pricePerHour || backendVehicle.pricing?.hourly || 0,
    pricePerDay: backendVehicle.pricePerDay || backendVehicle.pricing?.daily || 0,
    priceCurrency: backendVehicle.pricing?.currency || "VND",
    rating: backendVehicle.rating || 0,
    reviewCount: backendVehicle.reviewCount || 0,
    trips: backendVehicle.trips || 0,
    range: backendVehicle.range || 0,
    seats: backendVehicle.seats || 2,
    features: backendVehicle.features || [],
    status: backendVehicle.status || "AVAILABLE",
    condition: (validConditions.includes(backendVehicle.condition || "") ? backendVehicle.condition : "good") as Vehicle["condition"],
    lastMaintenance: backendVehicle.lastMaintenance || backendVehicle.updatedAt || "",
    mileage: backendVehicle.odo_km || 0,
    fuelEfficiency: backendVehicle.fuelEfficiency || `${backendVehicle.consumption_wh_per_km || 150} Wh/km`,
    inspectionDate: backendVehicle.inspectionDate || backendVehicle.inspection_due_at || "",
    insuranceExpiry: backendVehicle.insuranceExpiry || backendVehicle.insurance_expiry_at || "",
    description: backendVehicle.description || "",
    tags: backendVehicle.tags || []
  };
  
  return mapped;
}

// Map backend status to frontend availability
function mapBackendStatusToFrontend(backendStatus: string): "available" | "rented" | "maintenance" {
  switch (backendStatus) {
    case 'AVAILABLE':
      return 'available';
    case 'RENTED':
    case 'RESERVED':
      return 'rented';
    case 'MAINTENANCE':
      return 'maintenance';
    default:
      return 'available';
  }
}

export const vehicleService = {
  /**
   * Test connection to backend
   */
  async testConnection(): Promise<unknown> {
    try {
      const response = await api.get('/vehicles/search?limit=1');
      return response.data;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  },

  /**
   * Search vehicles with filters and pagination
   * GET /v1/vehicles/search
   */
  async searchVehicles(
    filters: VehicleSearchFilters = {},
    options: SearchOptions = {}
  ): Promise<{ vehicles: Vehicle[]; meta?: PaginationMeta }> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      // Add options to query params
      if (options.limit) params.append('limit', String(options.limit));
      if (options.page) params.append('page', String(options.page));
      if (options.sort) params.append('sort', options.sort);
      
      const url = `/vehicles/search?${params.toString()}`;
      
      const response = await api.get<ApiResponse<BackendVehicle[]>>(url);
      
      
      const vehicles = response.data.data.map(mapBackendVehicleToFrontend);
      
      
      return {
        vehicles,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('❌ Error searching vehicles:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } };
        console.error('Error response data:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
      }
      throw error;
    }
  },

  /**
   * Get all vehicles (Admin/Staff only)
   * GET /v1/vehicles
   */
    async getAllVehicles(options: SearchOptions = {}): Promise<{ vehicles: Vehicle[]; meta?: PaginationMeta }> {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', String(options.limit));
      if (options.page) params.append('page', String(options.page));
      if (options.sort) params.append('sort', options.sort);
      
      const response = await api.get<ApiResponse<BackendVehicle[]>>(`/vehicles?${params.toString()}`);
      
      const vehicles = response.data.data.map(mapBackendVehicleToFrontend);
      
      return {
        vehicles,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('Error getting all vehicles:', error);
      throw error;
    }
  },

  /**
   * Get vehicle by ID
   * GET /v1/vehicles/{id}
   */
  async getVehicleById(id: string): Promise<Vehicle> {
    try {
      const response = await api.get<ApiResponse<BackendVehicle>>(`/vehicles/${id}`);
      return mapBackendVehicleToFrontend(response.data.data);
    } catch (error) {
      console.error('Error getting vehicle by ID:', error);
      throw error;
    }
  },

  /**
   * Get available vehicles at a specific station
   * GET /v1/vehicles/stations/{stationId}/available
   */
  async getAvailableVehiclesByStation(stationId: string, filters: VehicleSearchFilters = {}): Promise<Vehicle[]> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      const response = await api.get<ApiResponse<BackendVehicle[]>>(`/vehicles/stations/${stationId}/available?${params.toString()}`);
      
      return response.data.data.map(mapBackendVehicleToFrontend);
    } catch (error) {
      console.error('Error getting available vehicles by station:', error);
      throw error;
    }
  },

  /**
   * Get reserved vehicles at a specific station
   * GET /v1/stations/{stationId}/vehicles?status=RESERVED
   */
  async getReservedVehiclesByStation(stationId: string, filters: VehicleSearchFilters = {}): Promise<Vehicle[]> {
    try {
      const params = new URLSearchParams();

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await api.get<ApiResponse<any>>(`/stations/${stationId}/vehicles?status=RESERVED`);

      // Lấy danh sách xe từ data.data.vehicles
      const vehicles = response.data.data?.vehicles || [];
      return vehicles.map(mapBackendVehicleToFrontend);
    } catch (error) {
      console.error('Error getting reserved vehicles by station:', error);
      throw error;
    }
  },

  async getRentedVehiclesByStation(stationId: string, filters: VehicleSearchFilters = {}): Promise<Vehicle[]> {
    try {
      const params = new URLSearchParams();
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await api.get<ApiResponse<any>>(`/stations/${stationId}/vehicles?status=RENTED`);
      const vehicles = response.data.data?.vehicles || [];
      return vehicles.map(mapBackendVehicleToFrontend);
    } catch (error) {
      console.error('Error getting rented vehicles by station:', error);
      throw error;
    }
  },

  /**
   * Create new vehicle (Admin only)
   * POST /v1/vehicles
   */
  async createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const response = await api.post<ApiResponse<BackendVehicle>>('/vehicles', vehicleData);
      return mapBackendVehicleToFrontend(response.data.data);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  /**
   * Update vehicle (Admin/Staff only)
   * PATCH /v1/vehicles/{id}
   */
  async updateVehicle(id: string, updateData: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const response = await api.patch<ApiResponse<BackendVehicle>>(`/vehicles/${id}`, updateData);
      return mapBackendVehicleToFrontend(response.data.data);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  },

  /**
   * Delete vehicle (Admin only)
   * DELETE /v1/vehicles/{id}
   */
  async deleteVehicle(id: string): Promise<void> {
    try {
      await api.delete(`/vehicles/${id}`);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  /**
   * Helper function to get available vehicles with comprehensive search
   * This is a convenience method that uses searchVehicles with status filter
   */
  async getAvailableVehicles(
    filters: Omit<VehicleSearchFilters, 'status'> = {},
    options: SearchOptions = {}
  ): Promise<{ vehicles: Vehicle[]; meta?: PaginationMeta }> {
    return this.searchVehicles(
      { ...filters, status: 'AVAILABLE' },
      options
    );
  },

  /**
   * Helper function for location-based search
   */
  async searchVehiclesByLocation(
    locationQuery: string,
    additionalFilters: VehicleSearchFilters = {},
    options: SearchOptions = {}
  ): Promise<{ vehicles: Vehicle[]; meta?: PaginationMeta }> {
    return this.searchVehicles(
      {
        ...additionalFilters,
        search: locationQuery, // Backend should handle location search in general search
        status: 'AVAILABLE'
      },
      options
    );
  },

  /**
   * Helper function for type-based filtering
   */
  async getVehiclesByType(
    type: string,
    additionalFilters: VehicleSearchFilters = {},
    options: SearchOptions = {}
  ): Promise<{ vehicles: Vehicle[]; meta?: PaginationMeta }> {
    return this.searchVehicles(
      {
        ...additionalFilters,
        type,
        status: 'AVAILABLE'
      },
      options
    );
  }
};

// Export individual functions for backward compatibility
export const {
  searchVehicles,
  getAllVehicles,
  getVehicleById,
  getAvailableVehiclesByStation,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  searchVehiclesByLocation,
  getVehiclesByType
} = vehicleService;

// Default export
export default vehicleService;
