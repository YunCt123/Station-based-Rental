// Vehicle type definitions

// Vehicle type enum
export type VehicleType =
  | "SUV"
  | "Sedan"
  | "Hatchback"
  | "Crossover"
  | "Coupe"
  | "Motorcycle"
  | "Scooter"
  | "Bike"
  | "Bus"
  | "Van"
  | "Truck";

// Vehicle availability status
export type VehicleAvailability = "available" | "rented" | "maintenance";

// Vehicle condition
export type VehicleCondition = "excellent" | "good" | "fair" | "poor";

// Backend vehicle status (from API)
export type BackendVehicleStatus = 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE';

// Frontend Vehicle interface (main vehicle data structure)
export interface Vehicle {
  id: string;
  _id?: string;
  name: string;
  year: number;
  brand: string;
  model: string;
  type: VehicleType | string;
  image: string;
  station_id?: string;
  station_name?: string;
  location?: string;
  status?: BackendVehicleStatus | string;
  batteryLevel?: number;
  battery_soc?: number;
  battery_kWh?: number;
  range?: number;
  seats?: number;
  pricePerHour?: number;
  pricePerDay?: number;
  pricing?: {
    hourly?: number;
    daily?: number;
    currency?: string;
  };
  rating?: number;
  reviewCount?: number;
  trips?: number;
  features?: string[];
  condition?: VehicleCondition | string;
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
  active?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  availability?: VehicleAvailability;
  lock_version?: number;
  priceDetail?: string;
}

// Backend vehicle data structure (from API)
export interface BackendVehicle {
  _id: string;
  id?: string;
  name: string;
  lock_version?: number;
  year: number;
  brand?: string;
  model?: string;
  type?: string;
  image?: string;
  station_id?: string;
  station_name?: string;
  status: BackendVehicleStatus;
  batteryLevel?: number;
  battery_soc?: number;
  battery_kWh?: number;
  range?: number;
  seats?: number;
  pricePerHour?: number;
  pricePerDay?: number;
  pricing?: {
    hourly?: number;
    daily?: number;
    currency?: string;
  };
  rating?: number;
  reviewCount?: number;
  trips?: number;
  features?: string[];
  condition?: string;
  lastMaintenance?: string;
  odo_km?: number;
  fuelEfficiency?: string;
  consumption_wh_per_km?: number;
  inspectionDate?: string;
  inspection_due_at?: string;
  insuranceExpiry?: string;
  insurance_expiry_at?: string;
  description?: string;
  active?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// API Response wrapper
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

// Pagination meta information
export interface PaginationMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Vehicle search filters
export interface VehicleSearchFilters {
  type?: string;
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  batteryLevel?: number;
  seats?: number;
  status?: BackendVehicleStatus;
  station_id?: string;
  search?: string; // For general search
}

// Search options for API calls
export interface SearchOptions {
  limit?: number;
  page?: number;
  sort?: string;
}

// Vehicle Card Props interface
export interface VehicleCardProps {
  vehicle: Vehicle;
  className?: string;
}