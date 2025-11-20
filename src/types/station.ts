// src/types/station.ts

// Kiểu dữ liệu Station dành cho Frontend, khớp với
// kiểu dữ liệu được map trong stationService.ts
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
  distance?: number; // Dành cho tìm kiếm lân cận
}