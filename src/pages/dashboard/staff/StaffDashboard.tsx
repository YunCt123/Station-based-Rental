import React from 'react';
import {
  TruckIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const StaffDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Xe có sẵn',
      value: '12',
      color: 'bg-green-500',
      icon: TruckIcon
    },
    {
      title: 'Xe đang thuê',
      value: '8',
      color: 'bg-blue-500',
      icon: TruckIcon
    },
    {
      title: 'Chờ bàn giao',
      value: '3',
      color: 'bg-yellow-500',
      icon: ClipboardDocumentListIcon
    },
    {
      title: 'Cần bảo trì',
      value: '2',
      color: 'bg-red-500',
      icon: ExclamationTriangleIcon
    }
  ];

  const pendingTasks = [
    {
      id: 1,
      type: 'delivery',
      title: 'Bàn giao xe EV-001',
      customer: 'Nguyễn Văn A',
      time: '09:30',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 2,
      type: 'return',
      title: 'Nhận xe EV-015',
      customer: 'Trần Thị B',
      time: '10:15',
      priority: 'medium',
      status: 'pending'
    },
    {
      id: 3,
      type: 'inspection',
      title: 'Kiểm tra xe EV-023',
      customer: 'Lê Văn C',
      time: '11:00',
      priority: 'low',
      status: 'completed'
    },
    {
      id: 4,
      type: 'maintenance',
      title: 'Bảo trì xe EV-045',
      customer: 'Hệ thống',
      time: '14:30',
      priority: 'high',
      status: 'in-progress'
    }
  ];

  const vehicleStatus = [
    { id: 'EV-001', status: 'available', battery: 95, location: 'Slot A1' },
    { id: 'EV-002', status: 'rented', battery: 78, location: 'Đang thuê' },
    { id: 'EV-003', status: 'available', battery: 88, location: 'Slot A3' },
    { id: 'EV-004', status: 'maintenance', battery: 45, location: 'Bảo trì' },
    { id: 'EV-005', status: 'available', battery: 92, location: 'Slot B1' },
    { id: 'EV-006', status: 'rented', battery: 65, location: 'Đang thuê' }
  ];

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
          <p className="text-gray-600">Quản lý trạm thuê xe - Trạm Cầu Giấy</p>
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
          </div>
        </div>

        {/* Vehicle Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Trạng thái xe</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {vehicleStatus.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium text-gray-900">{vehicle.id}</div>
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