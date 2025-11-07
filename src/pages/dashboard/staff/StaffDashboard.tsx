import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { getCurrentUser } from '@/utils/auth';
import { stationService } from '@/services/stationService';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle } from '@/types/vehicle';

interface StationInfo {
  id: string;
  name: string;
  address: string;
  metrics?: {
    vehicles_total: number;
    vehicles_available: number;
    vehicles_in_use: number;
    utilization_rate: number;
  };
}

interface TaskItem {
  id: string;
  type: 'delivery' | 'return' | 'inspection' | 'maintenance';
  title: string;
  customer: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
}

const StaffDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stationInfo, setStationInfo] = useState<StationInfo | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pendingTasks, setPendingTasks] = useState<TaskItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load data when component mounts
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== 'staff') {
        throw new Error('User not authorized or not found');
      }

      // First, get all available stations to find a valid station ID
      console.log('Loading stations...');
      const stationsResponse = await stationService.getAllStations();
      
      if (!stationsResponse.stations || stationsResponse.stations.length === 0) {
        throw new Error('No stations found');
      }

      // Use the first available station
      const firstStation = stationsResponse.stations[0];
      const stationId = firstStation.id;
      
      console.log('Using station:', stationId, firstStation.name);
      
      // Load vehicles for the selected station
      const vehicleData = await vehicleService.searchVehicles({ station_id: stationId });

      setStationInfo({
        id: stationId,
        name: firstStation.name,
        address: firstStation.address || '',
        metrics: {
          vehicles_total: firstStation.totalVehicles || 0,
          vehicles_available: firstStation.availableVehicles || 0,
          vehicles_in_use: (firstStation.totalVehicles || 0) - (firstStation.availableVehicles || 0),
          utilization_rate: firstStation.utilizationRate || 0
        }
      });
      setVehicles(vehicleData.vehicles);

      // Generate tasks from vehicle and booking data
      generateTasksFromData(vehicleData.vehicles);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateTasksFromData = (vehicleList: Vehicle[]) => {
    // Generate tasks based on vehicle status - only for actual pending tasks
    const tasks: TaskItem[] = [];
    let taskId = 1;

    vehicleList.forEach((vehicle) => {
      // Only create maintenance tasks for vehicles that actually need maintenance
      if (vehicle.availability === 'maintenance') {
        tasks.push({
          id: `task-${taskId++}`,
          type: 'maintenance',
          title: `Bảo trì xe ${vehicle.name}`,
          customer: 'Hệ thống',
          time: '14:00',
          priority: 'high',
          status: 'in-progress'
        });
      }
    });

    // TODO: Add real booking-based tasks from API
    // For now, we don't create tasks for rented vehicles since we don't know their return time
    
    setPendingTasks(tasks);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Đang tải dữ liệu dashboard...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Lỗi: {error}</div>
      </div>
    );
  }

  // Calculate stats from real data
  const stats = [
    {
      title: 'Xe có sẵn',
      value: vehicles.filter((v: Vehicle) => v.availability === 'available').length.toString(),
      color: 'bg-green-500',
      icon: TruckIcon
    },
    {
      title: 'Xe đang thuê',
      value: vehicles.filter((v: Vehicle) => v.availability === 'rented').length.toString(),
      color: 'bg-blue-500',
      icon: TruckIcon
    },
    {
      title: 'Chờ bàn giao',
      value: pendingTasks.filter((t: TaskItem) => t.type === 'delivery' && t.status === 'pending').length.toString(),
      color: 'bg-yellow-500',
      icon: ClipboardDocumentListIcon
    },
    {
      title: 'Cần bảo trì',
      value: vehicles.filter((v: Vehicle) => v.availability === 'maintenance').length.toString(),
      color: 'bg-red-500',
      icon: ExclamationTriangleIcon
    }
  ];

  // Convert vehicles to vehicle status format for display
  // Filter to show only vehicles from current station and display vehicle names
  const vehicleStatusData = vehicles
    .filter((vehicle: Vehicle) => vehicle.stationId === stationInfo?.id) // Only show vehicles from current station
    .slice(0, 6)
    .map((vehicle: Vehicle) => ({
      id: vehicle.name || vehicle.id, // Show vehicle name instead of ID
      name: vehicle.name,
      status: vehicle.availability,
      battery: vehicle.batteryLevel,
      location: vehicle.availability === 'rented' ? 'Đang thuê' : vehicle.location
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'rented': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Có sẵn';
      case 'rented': return 'Đang thuê';
      case 'maintenance': return 'Bảo trì';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Nhân viên</h1>
          <p className="text-gray-600">
            Quản lý trạm thuê xe - {stationInfo?.name || 'Đang tải...'}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          <span>Ca làm việc: 08:00 - 17:00</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Nhiệm vụ hôm nay</h2>
          </div>
          <div className="p-6">
            {pendingTasks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Không có nhiệm vụ nào trong hôm nay</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {task.status === 'completed' ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : task.status === 'in-progress' ? (
                          <ClockIcon className="w-5 h-5 text-blue-500" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">Khách hàng: {task.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                      <span className="text-sm text-gray-500">{task.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Trạng thái xe</h2>
          </div>
          <div className="p-6">
            {vehicleStatusData.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Không có dữ liệu xe</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicleStatusData.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-medium text-gray-900">{vehicle.name || vehicle.id}</div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{vehicle.battery}%</div>
                        <div className="text-xs text-gray-500">Pin</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">{vehicle.location}</div>
                        <div className="text-xs text-gray-500">Vị trí</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TruckIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Bàn giao xe</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ClipboardDocumentListIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Nhận xe</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Thanh toán</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">Báo cáo sự cố</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;