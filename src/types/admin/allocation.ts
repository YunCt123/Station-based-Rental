export interface StaffMember {
  id: string;
  name: string;
  position: string;
  station: string;
  avatar: string;
  phone: string;
  email: string;
  status: "active" | "inactive" | "on_leave";
}

export interface Schedule {
  id: string;
  staffId: string;
  date: string;
  shift: "morning" | "afternoon" | "night" | "full_day";
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "absent" | "late";
  station: string;
  tasks: string[];
  overtime?: number;
}

export interface PeakHourData {
  id: string;
  timeRange: string;
  station: string;
  demand: number;
  supply: number;
  utilizationRate: number;
  priority: "high" | "medium" | "low";
  date: string;
  vehicleType: string;
  revenue: number;
  averageWaitTime: number;
}

export interface PeakHourAlert {
  id: string;
  type: "shortage" | "overflow" | "maintenance" | "high_demand";
  station: string;
  timeRange: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
}
