import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TruckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { adminVehicleService } from '../../../services/adminVehicleService';
import { getAllUsers } from '../../../services/userService';
import { rentalService } from '../../../services/rentalService';
import { getAllIssues } from '../../../services/issueService';
import { getPendingDocuments } from '../../../services/documentService';
import adminStationService from '../../../services/adminStationService';

interface DashboardStats {
  totalVehicles: number;
  rentedVehicles: number;
  totalCustomers: number;
  reservedVehicles: number;
}

interface RecentActivity {
  id: string;
  type: 'rental' | 'issue' | 'document' | 'user';
  message: string;
  time: string;
  status: 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface TopStation {
  id: string;
  name: string;
  totalVehicles: number;
  availableVehicles: number;
  utilizationRate: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    rentedVehicles: 0,
    totalCustomers: 0,
    reservedVehicles: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [topStations, setTopStations] = useState<TopStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);

  // Helper function to format relative time
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${diffInDays} ngày trước`;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setActivitiesLoading(true);
        
        // Get date 1 week ago for filtering activities
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        // Fetch all data in parallel
        const [vehicleStats, allUsers, issues, rentals, pendingDocs, stationsResponse] = await Promise.all([
          adminVehicleService.getVehicleStats(),
          getAllUsers(),
          getAllIssues({}).catch(error => {
            console.error('Error fetching issues:', error);
            return [];
          }),
          rentalService.getAllRentals().catch(error => {
            console.error('Error fetching rentals:', error);
            return [];
          }),
          getPendingDocuments().catch(error => {
            console.error('Error fetching pending documents:', error);
            return [];
          }),
          adminStationService.getAllStations({ limit: 100 }).catch(error => {
            console.error('Error fetching stations:', error);
            return { success: false, data: [] };
          })
        ]);

        // Process stats data
        const customers = allUsers.filter(user => user.role === 'customer');
        setStats({
          totalVehicles: vehicleStats.total,
          rentedVehicles: vehicleStats.rented,
          totalCustomers: customers.length,
          reservedVehicles: vehicleStats.reserved
        });
        setLoading(false);

        // Process recent activities from already fetched data
        const activities: RecentActivity[] = [];

        // Add issues activities
        const recentIssues = issues.filter(issue => 
          new Date(issue.createdAt) >= oneWeekAgo
        );
        recentIssues.forEach(issue => {
          const vehicleName = (typeof issue.vehicle_id === 'object' && issue.vehicle_id && 'name' in issue.vehicle_id)
            ? (issue.vehicle_id as any).name
            : (issue.vehicle?.name || 'Xe không xác định');
          activities.push({
            id: `issue-${issue._id}`,
            type: 'issue',
            message: `Sự cố "${issue.title}" - ${vehicleName}`,
            time: getRelativeTime(new Date(issue.createdAt)),
            status: issue.status === 'RESOLVED' ? 'success' : 'error',
            timestamp: new Date(issue.createdAt)
          });
        });

        // Add rentals activities (fallback to pickup.at or createdAt if start_at missing)
        const recentRentals = rentals.filter(rental => {
          const startAtStr = rental.start_at || rental.pickup?.at || rental.createdAt;
          if (!startAtStr) return false;
          const startAt = new Date(startAtStr);
          return !isNaN(startAt.getTime()) && startAt >= oneWeekAgo;
        });
        recentRentals.forEach(rental => {
          const startAtStr = rental.start_at || rental.pickup?.at || rental.createdAt;
          const startAt = new Date(startAtStr);
          const customerName = rental.user_id?.name || 'Khách hàng';
          const vehicleName = rental.vehicle_id?.name || 'Xe không xác định';
          const stationName = rental.station_id?.name || 'Trạm không xác định';
          const isCompleted = rental.status === 'COMPLETED';

          activities.push({
            id: `rental-${rental._id}`,
            type: 'rental',
            message: isCompleted
              ? `${customerName} đã trả xe ${vehicleName} tại ${stationName}`
              : `${customerName} thuê xe ${vehicleName} tại ${stationName}`,
            time: getRelativeTime(startAt),
            status: 'success',
            timestamp: startAt
          });

          // If completed and return time exists & within week, add return activity
          if (isCompleted && rental.return?.at) {
            const returnAt = new Date(rental.return.at);
            if (!isNaN(returnAt.getTime()) && returnAt >= oneWeekAgo) {
              activities.push({
                id: `rental-return-${rental._id}`,
                type: 'rental',
                message: `${customerName} hoàn tất trả xe ${vehicleName}`,
                time: getRelativeTime(returnAt),
                status: 'success',
                timestamp: returnAt
              });
            }
          }
        });

        // Add pending documents / user verification submission activities
        const recentDocs = pendingDocs.filter(doc => {
          const submittedAtStr = (doc as any).verificationSubmittedAt || doc.updatedAt || doc.createdAt;
          const submittedAt = new Date(submittedAtStr);
          return submittedAt >= oneWeekAgo;
        });
        recentDocs.forEach(doc => {
          const submittedAtStr = (doc as any).verificationSubmittedAt || doc.updatedAt || doc.createdAt;
          const submittedAt = new Date(submittedAtStr);
          activities.push({
            id: `doc-${doc._id}`,
            type: 'document',
            message: `Khách hàng ${doc.name} vừa gửi hồ sơ xác minh`,
            time: getRelativeTime(submittedAt),
            status: 'warning',
            timestamp: submittedAt
          });
        });

        // Add new users activities
        const newUsers = allUsers.filter(user => 
          new Date(user.createdAt) >= oneWeekAgo && user.role === 'customer'
        );
        newUsers.forEach(user => {
          activities.push({
            id: `user-${user._id}`,
            type: 'user',
            message: `Khách hàng mới ${user.name} đã đăng ký`,
            time: getRelativeTime(new Date(user.createdAt)),
            status: 'success',
            timestamp: new Date(user.createdAt)
          });
        });

        // Sort by timestamp (most recent first) and take top 10
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivities(activities.slice(0, 10));

        // Process stations data - sort by total vehicles and utilization rate
        const stations = stationsResponse.data || [];
        const sortedStations = stations
          .filter(station => station.status === 'ACTIVE')
          .sort((a, b) => {
            // Sort by total vehicles first, then by utilization rate
            if (b.metrics.vehicles_total !== a.metrics.vehicles_total) {
              return b.metrics.vehicles_total - a.metrics.vehicles_total;
            }
            return b.metrics.utilization_rate - a.metrics.utilization_rate;
          })
          .slice(0, 5)
          .map(station => ({
            id: station._id,
            name: station.name,
            totalVehicles: station.metrics.vehicles_total,
            availableVehicles: station.metrics.vehicles_available,
            utilizationRate: Math.round(station.metrics.utilization_rate * 100)
          }));
        
        setTopStations(sortedStations);
        setStationsLoading(false);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
        setActivitiesLoading(false);
        setStationsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const statsCards = [
    {
      title: 'Tổng số xe',
      value: loading ? '...' : stats.totalVehicles.toString(),
      icon: TruckIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Xe đang cho thuê',
      value: loading ? '...' : stats.rentedVehicles.toString(),
      icon: TruckIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Xe đang đặt trước',
      value: loading ? '...' : stats.reservedVehicles.toString(),
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    },
    {
      title: 'Tổng khách hàng',
      value: loading ? '...' : stats.totalCustomers.toString(),
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600">Tổng quan hệ thống trạm thuê xe điện</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          <span>Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
          </div>
          <div className="p-6">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Không có hoạt động nào trong tuần qua</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Stations */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Trạm đang hoạt động</h2>
          </div>
          <div className="p-6">
            {stationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : topStations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Không có dữ liệu trạm</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topStations.map((station, index) => (
                  <div key={station.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{station.name}</p>
                        <p className="text-xs text-gray-500">{station.availableVehicles}/{station.totalVehicles} xe khả dụng</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{station.totalVehicles} xe</p>
                      <p className="text-xs text-gray-500">{station.utilizationRate}% sử dụng</p>
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
          <button 
            onClick={() => navigate('/admin/vehicles')}
            className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
          >
            <TruckIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Quản lý xe</span>
          </button>
          <button 
            onClick={() => navigate('/admin/staff/list')}
            className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors"
          >
            <UserGroupIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Quản lý nhân viên</span>
          </button>
          <button 
            onClick={() => navigate('/admin/stations')}
            className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors"
          >
            <BuildingStorefrontIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Quản lý trạm</span>
          </button>
          <button 
            onClick={() => navigate('/admin/customers/customer_management')}
            className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-colors"
          >
            <DocumentCheckIcon className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium">Quản lý khách hàng</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;