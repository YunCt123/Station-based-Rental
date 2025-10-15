import React from 'react';
import {
  ChartBarIcon,
  TruckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Tổng số xe',
      value: '247',
      change: '+12%',
      changeType: 'increase',
      icon: TruckIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Xe đang cho thuê',
      value: '156',
      change: '+8%',
      changeType: 'increase',
      icon: TruckIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Doanh thu tháng',
      value: '₫ 125M',
      change: '+15%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    },
    {
      title: 'Khách hàng mới',
      value: '89',
      change: '+23%',
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'rental',
      message: 'Khách hàng Nguyễn Văn A thuê xe EV-001 tại Trạm Cầu Giấy',
      time: '5 phút trước',
      status: 'success'
    },
    {
      id: 2,
      type: 'maintenance',
      message: 'Xe EV-045 cần bảo trì định kỳ tại Trạm Hàng Xanh',
      time: '15 phút trước',
      status: 'warning'
    },
    {
      id: 3,
      type: 'return',
      message: 'Xe EV-023 đã được trả về Trạm Lotte Center Hanoi',
      time: '32 phút trước',
      status: 'success'
    },
    {
      id: 4,
      type: 'issue',
      message: 'Báo cáo sự cố pin yếu xe EV-067 tại Trạm Times City',
      time: '1 giờ trước',
      status: 'error'
    }
  ];

  const topStations = [
    { name: 'Trạm Cầu Giấy', revenue: '₫ 15.2M', vehicles: 25, usage: 89 },
    { name: 'Trạm Lotte Center', revenue: '₫ 12.8M', vehicles: 20, usage: 78 },
    { name: 'Trạm Times City', revenue: '₫ 11.5M', vehicles: 18, usage: 82 },
    { name: 'Trạm Hàng Xanh', revenue: '₫ 9.3M', vehicles: 15, usage: 65 }
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
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} so với tháng trước
                </p>
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
          </div>
        </div>

        {/* Top Stations */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Trạm hiệu quả nhất</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topStations.map((station, index) => (
                <div key={station.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{station.name}</p>
                      <p className="text-xs text-gray-500">{station.vehicles} xe</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{station.revenue}</p>
                    <p className="text-xs text-gray-500">{station.usage}% sử dụng</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TruckIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Thêm xe mới</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <UserGroupIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Quản lý nhân viên</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Xem báo cáo</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">Xử lý sự cố</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;