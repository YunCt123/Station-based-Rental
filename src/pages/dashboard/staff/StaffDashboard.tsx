import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { getCurrentUser } from '@/utils/auth';
import { stationService } from '@/services/stationService';
import { vehicleService } from '@/services/vehicleService';
import { bookingService } from '@/services/bookingService';
import type { Vehicle } from '@/types/vehicle';
import type { Booking } from '@/services/bookingService';
import type { StationRental } from '@/services/rentalService';

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

// Types for rental data
interface SimpleRental {
  _id: string;
  booking_id: string;
  status: string;
  vehicle_id?: { name?: string };
}

interface TaskItem {
  id: string;
  type: 'delivery' | 'return' | 'inspection' | 'maintenance' | 'overdue';
  title: string;
  customer: string;
  vehicleName: string;
  startAt: Date;
  endAt: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  bookingId?: string;
  isOverdue?: boolean;
  overdueHours?: number;
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== 'staff') {
        throw new Error('User not authorized or not found');
      }

      // First, get all available stations to find a valid station ID
      const stationsResponse = await stationService.getAllStations();
      
      if (!stationsResponse.stations || stationsResponse.stations.length === 0) {
        throw new Error('No stations found');
      }

      // Use the first available station
      const firstStation = stationsResponse.stations[0];
      const stationId = firstStation.id;
      
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
      await generateTasksFromData(vehicleData.vehicles, stationId);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateTasksFromData = async (vehicleList: Vehicle[], stationId: string) => {
    try {
      // Lấy bookings cho station
      const confirmedBookings = await bookingService.getStationBookings(stationId, 'CONFIRMED');
      
      // Lấy rentals để check trạng thái
      let ongoingRentals: SimpleRental[] = [];
      let detailedRentals: StationRental[] = [];
      try {
        const { rentalService } = await import('@/services/rentalService');
        ongoingRentals = await rentalService.getStationRentals(stationId, 'ONGOING');
        // Lấy detailed data cho ONGOING rentals 
        detailedRentals = await rentalService.getStationRentals(stationId, 'ONGOING');
      } catch (error) {
        console.warn('Could not load rental service:', error);
      }
      
      const tasks: TaskItem[] = [];
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      // TEMPORARY: Always add a test overdue task to demonstrate the feature
      // console.log('🧪 [DEBUG] Adding test overdue task for demonstration');
      // const testOverdueTime = new Date();
      // testOverdueTime.setHours(testOverdueTime.getHours() - 25); // 25 hours ago
      
      // tasks.push({
      //   id: 'test-overdue-1',
      //   type: 'overdue',
      //   title: '🚨 Xe quá hạn trả: Tesla Model 3',
      //   customer: 'Nguyễn Văn A - Liên hệ ngay!',
      //   vehicleName: 'Tesla Model 3',
      //   startAt: testOverdueTime,
      //   endAt: testOverdueTime,
      //   priority: 'high',
      //   status: 'pending',
      //   bookingId: 'test-booking-1',
      //   isOverdue: true,
      //   overdueHours: 25
      // });

      // Tạo map booking_id -> rental để check nhanh
      const rentalByBookingId = new Map();
      ongoingRentals.forEach(rental => {
        rentalByBookingId.set(rental.booking_id, rental);
      });

      // Check for overdue vehicles từ detailed rentals
      // Tạo map booking_id -> booking để lấy end_at nếu cần
      const bookingMap = new Map();
      confirmedBookings.forEach(booking => {
        bookingMap.set(booking._id, booking);
      });
      
      detailedRentals.forEach((rental: StationRental) => {
        // Kiểm tra end_at từ rental trước, nếu không có thì lấy từ booking
        let endTime: Date | null = null;
        
        if (rental.end_at) {
          endTime = new Date(rental.end_at);
          if (isNaN(endTime.getTime())) {
            endTime = null;
          }
        }
        
        // Nếu rental không có end_at hợp lệ, lấy từ booking
        if (!endTime && rental.booking_id) {
          const booking = bookingMap.get(rental.booking_id);
          if (booking && booking.end_at) {
            endTime = new Date(booking.end_at);
          }
        }

        if (!endTime) {
          return;
        }

        const isOverdue = now > endTime;
        
        if (isOverdue) {
          const overdueHours = Math.floor((now.getTime() - endTime.getTime()) / (1000 * 60 * 60));
          const customerName = rental.user_id?.name || 'Khách hàng';
          const vehicleName = rental.vehicle_id?.name || 'Unknown';
          
          tasks.push({
            id: `overdue-${rental._id}`,
            type: 'overdue',
            title: `🚨 Xe quá hạn trả: ${vehicleName}`,
            customer: `${customerName} - Liên hệ ngay!`,
            vehicleName,
            startAt: endTime,
            endAt: endTime,
            priority: overdueHours > 24 ? 'high' : 'medium',
            status: 'pending',
            bookingId: rental.booking_id,
            isOverdue: true,
            overdueHours
          });
        }
      });

      // Tạo tasks từ bookings dựa vào trạng thái booking
      confirmedBookings.forEach((booking: Booking) => {
        const startAt = new Date(booking.start_at);
        const endAt = new Date(booking.end_at);
        const hasOngoingRental = rentalByBookingId.has(booking._id);
        
        // Nếu booking status là CONFIRMED → Task bàn giao xe
        if (booking.status === 'CONFIRMED' && !hasOngoingRental) {
          if (startAt >= now && startAt <= nextWeek) {
            tasks.push({
              id: `delivery-${booking._id}`,
              type: 'delivery',
              title: `Bàn giao xe ${booking.vehicle_snapshot?.name || 'Unknown'}`,
              customer: 'Khách hàng',
              vehicleName: booking.vehicle_snapshot?.name || 'Unknown',
              startAt,
              endAt,
              priority: startAt.getTime() - now.getTime() <= 24 * 60 * 60 * 1000 ? 'high' : 'medium',
              status: 'pending',
              bookingId: booking._id
            });
          }
        }
        
        // Nếu đã có rental ONGOING → Task nhận xe
        if (hasOngoingRental) {
          if (endAt >= now && endAt <= nextWeek) {
            tasks.push({
              id: `return-${booking._id}`,
              type: 'return',
              title: `Nhận lại xe ${booking.vehicle_snapshot?.name || 'Unknown'}`,
              customer: 'Khách hàng',
              vehicleName: booking.vehicle_snapshot?.name || 'Unknown',
              startAt: endAt,
              endAt,
              priority: endAt.getTime() - now.getTime() <= 24 * 60 * 60 * 1000 ? 'high' : 'medium',
              status: 'pending',
              bookingId: booking._id
            });
          }
        }
      });

      // Tạo tasks bảo trì từ vehicles cần bảo trì
      vehicleList.forEach((vehicle) => {
        if (vehicle.availability === 'maintenance') {
          const maintenanceDate = new Date();
          maintenanceDate.setHours(14, 0, 0, 0); // Default 14:00

          tasks.push({
            id: `maintenance-${vehicle.id}`,
            type: 'maintenance',
            title: `Bảo trì xe ${vehicle.name}`,
            customer: 'Hệ thống',
            vehicleName: vehicle.name,
            startAt: maintenanceDate,
            endAt: maintenanceDate,
            priority: 'high',
            status: 'in-progress',
            bookingId: undefined
          });
        }
      });

      // Sắp xếp tasks theo độ ưu tiên: overdue > high priority > thời gian
      tasks.sort((a, b) => {
        // Overdue tasks luôn lên đầu
        if (a.type === 'overdue' && b.type !== 'overdue') return -1;
        if (b.type === 'overdue' && a.type !== 'overdue') return 1;
        
        // Nếu cả 2 đều overdue, sắp xếp theo thời gian overdue (lâu nhất trước)
        if (a.type === 'overdue' && b.type === 'overdue') {
          return (b.overdueHours || 0) - (a.overdueHours || 0);
        }
        
        // Sắp xếp theo priority
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Cuối cùng theo thời gian
        return a.startAt.getTime() - b.startAt.getTime();
      });
      
      setPendingTasks(tasks);
      
    } catch (error) {
      console.error('Error generating tasks from bookings:', error);
      // Fallback: chỉ hiển thị maintenance tasks
      const tasks: TaskItem[] = [];
      vehicleList.forEach((vehicle) => {
        if (vehicle.availability === 'maintenance') {
          const maintenanceDate = new Date();
          maintenanceDate.setHours(14, 0, 0, 0);

          tasks.push({
            id: `maintenance-${vehicle.id}`,
            type: 'maintenance',
            title: `Bảo trì xe ${vehicle.name}`,
            customer: 'Hệ thống',
            vehicleName: vehicle.name,
            startAt: maintenanceDate,
            endAt: maintenanceDate,
            priority: 'high',
            status: 'in-progress'
          });
        }
      });
      setPendingTasks(tasks);
    }
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
      title: 'Xe quá hạn',
      value: pendingTasks.filter((t: TaskItem) => t.type === 'overdue').length.toString(),
      color: 'bg-orange-500',
      icon: ExclamationTriangleIcon
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
      image: vehicle.image,
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
            Quản lý trạm {stationInfo?.name || 'Đang tải...'}
          </p>
        </div>
          {/* <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ClockIcon className="w-4 h-4" />
            <span>Ca làm việc: 08:00 - 17:00</span>
          </div> */}
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
        {/* Available Vehicles Section */}
      

        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Nhiệm vụ</h2>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {pendingTasks.filter(t => t.status === 'pending').length} cần xử lý
              </span>
            </div>
          </div>
          <div className="p-6">
            {pendingTasks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="font-medium">Không có nhiệm vụ nào</p>
                <p className="text-sm">Tất cả công việc đã hoàn thành tốt!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className={`border rounded-lg p-4 hover:border-blue-300 transition-colors ${
                    task.type === 'overdue' ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            task.type === 'overdue'
                              ? 'bg-red-100'
                              : task.status === 'completed' 
                                ? 'bg-green-100' 
                                : task.status === 'in-progress' 
                                  ? 'bg-blue-100' 
                                  : 'bg-yellow-100'
                          }`}>
                            {task.type === 'overdue' ? (
                              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                            ) : task.status === 'completed' ? (
                              <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            ) : task.status === 'in-progress' ? (
                              <ClockIcon className="w-6 h-6 text-blue-600" />
                            ) : (
                              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className={`text-sm font-medium ${
                              task.type === 'overdue' ? 'text-red-900' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              task.type === 'overdue' 
                                ? 'bg-red-200 text-red-800'
                                : getPriorityColor(task.priority)
                            }`}>
                              {task.type === 'overdue' 
                                ? `Quá hạn ${task.overdueHours}h`
                                : task.priority === 'high' ? 'Ưu tiên cao' 
                                  : task.priority === 'medium' ? 'Trung bình' : 'Thấp'
                              }
                            </span>
                          </div>
                          <p className={`text-sm ${
                            task.type === 'overdue' ? 'text-red-700 font-medium' : 'text-gray-500'
                          }`}>
                            {task.customer}
                            {task.type === 'overdue' && (
                              <span className="ml-2 text-red-600">📞 Gọi ngay!</span>
                            )}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>Thời gian: {task.startAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>Ngày: {task.startAt.toLocaleDateString('vi-VN')}</span>
                            <span>Xe: {task.vehicleName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Quản lý xe tại trạm</h2>
              <span className="text-sm text-gray-500">{vehicleStatusData.length} xe</span>
            </div>
          </div>
          <div className="p-6">
            {vehicleStatusData.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Không có xe nào tại trạm này</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vehicleStatusData.map((vehicle, index) => (
                  <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {vehicle.image ? (
                              <img 
                                src={vehicle.image} 
                                alt={vehicle.name || 'Vehicle'}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <TruckIcon className={`w-8 h-8 text-blue-600 ${vehicle.image ? 'hidden' : ''}`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {vehicle.name || `Xe ${index + 1}`}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                              {getStatusText(vehicle.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{vehicle.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{vehicle.battery}%</div>
                          <div className="text-xs text-gray-500">Pin</div>
                          <div className="mt-1">
                            <div className="w-12 h-2 bg-gray-200 rounded-full">
                              <div 
                                className={`h-2 rounded-full ${
                                  vehicle.battery > 70 ? 'bg-green-500' : 
                                  vehicle.battery > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${vehicle.battery}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {vehicle.status === 'available' && (
                            <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors">
                              Có sẵn
                            </button>
                          )}
                          {vehicle.status === 'maintenance' && (
                            <button className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 transition-colors">
                              Bảo trì
                            </button>
                          )}
                          {vehicle.status === 'rented' && (
                            <button className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded ">
                              Đang thuê
                            </button>
                          )}
                        </div>
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
      {/* <div className="bg-white rounded-lg shadow p-6">
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
      </div> */}
    </div>
  );
};

export default StaffDashboard;