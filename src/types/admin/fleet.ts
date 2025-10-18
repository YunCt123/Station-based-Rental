export interface StationData {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  capacity: number;
  currentVehicles: number;
  available: number;
  rented: number;
  maintenance: number;
  charging: number;
  demandLevel: "low" | "medium" | "high";
  averageDailyRentals: number;
  peakHours: string[];
  batteryStatus: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface VehicleTransfer {
  id: string;
  fromStation: string;
  toStation: string;
  vehicleCount: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  estimatedTime: string;
  requestedAt: string;
  completedAt?: string;
}
