import React, { useState } from 'react';
import {
  BoltIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  BoltIcon as BoltSolidIcon,
} from '@heroicons/react/24/solid';
import { BatteryUpdateModal } from '../../../../components/dashboard/staff/BatteryUpdateModal';
import { ChargingControlModal } from '../../../../components/dashboard/staff/ChargingControlModal';

interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
  batteryLevel: number;
  batteryStatus: 'excellent' | 'good' | 'warning' | 'critical';
  chargingStatus: 'charging' | 'full' | 'discharging' | 'idle';
  lastCharged: string;
  estimatedRange: number;
  position: string; // Vị trí trong trạm (Vị trí 1, 2, 3...)
}

const mockVehicles: Vehicle[] = [
  {
    id: 'EV001',
    model: 'Tesla Model 3',
    licensePlate: '30A-12345',
    batteryLevel: 85,
    batteryStatus: 'excellent',
    chargingStatus: 'full',
    position: 'Vị trí 1',
    lastCharged: '2024-10-14 08:30',
    estimatedRange: 340
  },
  {
    id: 'EV002',
    model: 'VinFast VF8',
    licensePlate: '30B-67890',
    batteryLevel: 45,
    batteryStatus: 'good',
    chargingStatus: 'discharging',
    position: 'Vị trí 3',
    lastCharged: '2024-10-14 06:15',
    estimatedRange: 180
  },
  {
    id: 'EV003',
    model: 'BYD Seal',
    licensePlate: '30C-11111',
    batteryLevel: 15,
    batteryStatus: 'warning',
    chargingStatus: 'charging',
    position: 'Vị trí 5',
    lastCharged: '2024-10-14 09:00',
    estimatedRange: 60
  },
  {
    id: 'EV004',
    model: 'Hyundai Kona',
    licensePlate: '30D-22222',
    batteryLevel: 8,
    batteryStatus: 'critical',
    chargingStatus: 'charging',
    position: 'Vị trí 2',
    lastCharged: '2024-10-13 20:45',
    estimatedRange: 25
  },
];

const BatteryStatus: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showChargingModal, setShowChargingModal] = useState(false);
  const [actionType, setActionType] = useState<'start-charging' | 'stop-charging' | 'update-status'>('update-status');

  const getBatteryColor = (level: number, status: string) => {
    if (status === 'critical' || level <= 15) return 'text-red-500';
    if (status === 'warning' || level <= 30) return 'text-yellow-500';
    if (level <= 60) return 'text-blue-500';
    return 'text-green-500';
  };



  const getChargingStatusIcon = (status: string) => {
    switch (status) {
      case 'charging':
        return <BoltSolidIcon className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'full':
        return <BoltSolidIcon className="w-4 h-4 text-green-500" />;
      default:
        return <BoltIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredVehicles = mockVehicles.filter(vehicle => {
    const matchesSearch = vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || vehicle.batteryStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const refreshData = () => {
    // Simulate refresh
    console.log('Refreshing battery data...');
  };

  const handleStartCharging = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setActionType('start-charging');
    setShowChargingModal(true);
  };

  const handleStopCharging = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setActionType('stop-charging');
    setShowChargingModal(true);
  };

  const handleUpdateBatteryStatus = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowUpdateModal(true);
  };

  const handleSubmitBatteryUpdate = () => {
    if (!selectedVehicle) return;
    
    // Simulate API call
    console.log('Cập nhật mức pin:', {
      vehicleId: selectedVehicle.id,
      newBatteryLevel: selectedVehicle.batteryLevel,
      timestamp: new Date()
    });
    
    setShowUpdateModal(false);
    setSelectedVehicle(null);
  };

  const handleSubmitChargingControl = () => {
    if (!selectedVehicle) return;
    
    const newStatus = actionType === 'start-charging' ? 'charging' : 'idle';
    
    // Simulate API call
    console.log(`${actionType === 'start-charging' ? 'Bắt đầu' : 'Dừng'} sạc xe:`, {
      vehicleId: selectedVehicle.id,
      action: actionType,
      newStatus: newStatus,
      timestamp: new Date()
    });
    
    // Update local state
    setSelectedVehicle({
      ...selectedVehicle,
      chargingStatus: newStatus
    });
    
    setShowChargingModal(false);
    setSelectedVehicle(null);
    setActionType('update-status');
  };



  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <BoltIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Trạng thái pin</h1>
        </div>
        <p className="text-gray-600">
          Theo dõi tình trạng pin và quản lý sạc xe điện tại các điểm
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm xe, biển số, vị trí..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="flex gap-3 items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="critical">Nguy hiểm</option>
              <option value="warning">Cảnh báo</option>
              <option value="good">Tốt</option>
              <option value="excellent">Xuất sắc</option>
            </select>
            
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số xe</p>
              <p className="text-2xl font-bold text-gray-900">{mockVehicles.length}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang sạc</p>
              <p className="text-2xl font-bold text-yellow-600">
                {mockVehicles.filter(v => v.chargingStatus === 'charging').length}
              </p>
            </div>
            <BoltSolidIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pin yếu</p>
              <p className="text-2xl font-bold text-red-600">
                {mockVehicles.filter(v => v.batteryLevel <= 30).length}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pin đầy</p>
              <p className="text-2xl font-bold text-green-600">
                {mockVehicles.filter(v => v.chargingStatus === 'full').length}
              </p>
            </div>
            <BoltSolidIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Vehicle Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách xe có sẵn
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hình ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID xe / Biển số
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại xe / Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vị trí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src="https://via.placeholder.com/80x60?text=Vehicle" 
                      alt="vehicle" 
                      className="w-16 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">ID: {vehicle.id}</div>
                      <div className="text-sm text-gray-500">Biển số: {vehicle.licensePlate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Loại: Car</div>
                      <div className="text-sm text-gray-500">Model: {vehicle.model}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className={`text-sm font-bold ${getBatteryColor(vehicle.batteryLevel, vehicle.batteryStatus)}`}>
                          {vehicle.batteryLevel}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              vehicle.batteryLevel <= 15 ? 'bg-red-500' :
                              vehicle.batteryLevel <= 30 ? 'bg-yellow-500' :
                              vehicle.batteryLevel <= 60 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${vehicle.batteryLevel}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-2">
                        {getChargingStatusIcon(vehicle.chargingStatus)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vehicle.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      vehicle.batteryLevel > 60 ? 'bg-green-100 text-green-800' :
                      vehicle.batteryLevel > 30 ? 'bg-yellow-100 text-yellow-800' :
                      vehicle.batteryLevel > 15 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.batteryLevel > 60 ? 'Có sẵn' :
                       vehicle.batteryLevel > 30 ? 'Cần sạc' :
                       vehicle.batteryLevel > 15 ? 'Pin yếu' : 'Pin cạn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {vehicle.chargingStatus === 'charging' ? (
                        <button 
                          onClick={() => handleStopCharging(vehicle)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Dừng sạc
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStartCharging(vehicle)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Bắt đầu sạc
                        </button>
                      )}
                      <button 
                        onClick={() => handleUpdateBatteryStatus(vehicle)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Cập nhật
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredVehicles.length === 0 && (
            <div className="text-center py-8">
              <BoltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không tìm thấy xe nào phù hợp với bộ lọc.</p>
            </div>
          )}
        </div>
      </div>



      {/* Battery Update Modal */}
      <BatteryUpdateModal
        isOpen={showUpdateModal}
        vehicle={selectedVehicle}
        batteryLevel={selectedVehicle?.batteryLevel || 0}
        setBatteryLevel={(level) => {
          if (selectedVehicle) {
            setSelectedVehicle({
              ...selectedVehicle,
              batteryLevel: level
            });
          }
        }}
        onSubmit={handleSubmitBatteryUpdate}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedVehicle(null);
        }}
      />

      {/* Charging Control Modal */}
      <ChargingControlModal
        isOpen={showChargingModal}
        vehicle={selectedVehicle}
        isCharging={selectedVehicle?.chargingStatus === 'charging'}
        onConfirm={handleSubmitChargingControl}
        onClose={() => {
          setShowChargingModal(false);
          setSelectedVehicle(null);
          setActionType('update-status');
        }}
      />
    </div>
  );
};

export default BatteryStatus;