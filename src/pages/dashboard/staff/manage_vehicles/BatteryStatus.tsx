import React, { useState, useEffect } from 'react';
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
import { message } from 'antd';
import { BatteryUpdateModal } from '../../../../components/dashboard/staff/manage_vehicles/BatteryUpdateModal';
import { vehicleService } from '../../../../services/vehicleService';
import type { Vehicle } from '../../../../types/vehicle';

// Map Vehicle type to local interface for battery status
interface BatteryVehicle extends Vehicle {
  batteryStatus: 'excellent' | 'good' | 'warning' | 'critical';
  estimatedRange: number;
}

const BatteryStatus: React.FC = () => {
  const [vehicles, setVehicles] = useState<BatteryVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<BatteryVehicle | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Map Vehicle to BatteryVehicle
  const mapVehicleToBatteryVehicle = (vehicle: Vehicle): BatteryVehicle => {
    let batteryStatus: 'excellent' | 'good' | 'warning' | 'critical';
    if (vehicle.batteryLevel <= 15) batteryStatus = 'critical';
    else if (vehicle.batteryLevel <= 30) batteryStatus = 'warning';
    else if (vehicle.batteryLevel <= 60) batteryStatus = 'good';
    else batteryStatus = 'excellent';

    return {
      ...vehicle,
      batteryStatus,
      estimatedRange: Math.round(vehicle.range * (vehicle.batteryLevel / 100)) || 0
    };
  };

  // Load vehicles data
  const loadVehicles = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading all vehicles for battery status...');
      
      const { vehicles: allVehicles } = await vehicleService.getAllVehicles({ 
        limit: 1000 // Get all vehicles
      });
      
      console.log('✅ Loaded vehicles:', allVehicles);
      
      const mappedVehicles = allVehicles.map(mapVehicleToBatteryVehicle);
      setVehicles(mappedVehicles);
      
    } catch (error) {
      console.error('❌ Error loading vehicles:', error);
      message.error('Không thể tải danh sách xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
    message.success('Đã làm mới dữ liệu thành công');
  };

  // Load data on component mount
  useEffect(() => {
    loadVehicles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getBatteryColor = (level: number, status: string) => {
    if (status === 'critical' || level <= 15) return 'text-red-500';
    if (status === 'warning' || level <= 30) return 'text-yellow-500';
    if (level <= 60) return 'text-blue-500';
    return 'text-green-500';
  };



  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'maintenance':
        return <BoltIcon className="w-4 h-4 text-orange-500" />;
      case 'rented':
        return <BoltIcon className="w-4 h-4 text-blue-500" />;
      case 'available':
        return <BoltSolidIcon className="w-4 h-4 text-green-500" />;
      default:
        return <BoltIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || vehicle.batteryStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleUpdateBatteryStatus = (vehicle: BatteryVehicle) => {
    setSelectedVehicle(vehicle);
    setShowUpdateModal(true);
  };

  const handleSubmitBatteryUpdate = async (newBatteryLevel: number) => {
    if (!selectedVehicle) return;
    
    try {
      console.log('🔋 Updating battery level:', {
        vehicleId: selectedVehicle.id,
        currentLevel: selectedVehicle.batteryLevel,
        newLevel: newBatteryLevel
      });
      
      // Call API to update battery
      const updatedVehicle = await vehicleService.updateVehicleBattery(
        selectedVehicle.id, 
        newBatteryLevel
      );
      
      // Update local state
      const mappedUpdatedVehicle = mapVehicleToBatteryVehicle(updatedVehicle);
      setVehicles(prev => prev.map(v => 
        v.id === selectedVehicle.id ? mappedUpdatedVehicle : v
      ));
      
      message.success(`Đã cập nhật mức pin xe ${selectedVehicle.name} thành ${newBatteryLevel}%`);
      setShowUpdateModal(false);
      setSelectedVehicle(null);
      
    } catch (error: unknown) {
      console.error('❌ Error updating battery:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật mức pin. Vui lòng thử lại.';
      message.error(errorMessage);
    }
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
          Theo dõi và cập nhật tình trạng pin của tất cả xe điện trong hệ thống
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
              placeholder="Tìm kiếm xe, model, thương hiệu..."
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
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Đang tải...' : 'Làm mới'}
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
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Có sẵn</p>
              <p className="text-2xl font-bold text-green-600">
                {vehicles.filter(v => v.availability === 'available').length}
              </p>
            </div>
            <BoltSolidIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pin yếu</p>
              <p className="text-2xl font-bold text-red-600">
                {vehicles.filter(v => v.batteryLevel <= 30).length}
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
                {vehicles.filter(v => v.batteryLevel >= 80).length}
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
            Danh sách xe ({filteredVehicles.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Đang tải dữ liệu xe...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID xe / Tên xe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thương hiệu / Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạm / Vị trí
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
                        src={vehicle.image} 
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-16 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x60?text=Vehicle';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">ID: {vehicle.id}</div>
                        <div className="text-sm text-gray-500">{vehicle.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vehicle.brand}</div>
                        <div className="text-sm text-gray-500">{vehicle.model}</div>
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
                          <div className="text-xs text-gray-500 mt-1">
                            ~{vehicle.estimatedRange}km
                          </div>
                        </div>
                        <div className="ml-2">
                          {getAvailabilityIcon(vehicle.availability)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          vehicle.batteryLevel > 60 ? 'bg-green-100 text-green-800' :
                          vehicle.batteryLevel > 30 ? 'bg-yellow-100 text-yellow-800' :
                          vehicle.batteryLevel > 15 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.batteryLevel > 60 ? 'Pin tốt' :
                           vehicle.batteryLevel > 30 ? 'Cần sạc' :
                           vehicle.batteryLevel > 15 ? 'Pin yếu' : 'Pin cạn'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          vehicle.availability === 'available' ? 'bg-green-100 text-green-800' :
                          vehicle.availability === 'rented' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {vehicle.availability === 'available' ? 'Có sẵn' :
                           vehicle.availability === 'rented' ? 'Đang thuê' : 'Bảo trì'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleUpdateBatteryStatus(vehicle)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Cập nhật pin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredVehicles.length === 0 && !loading && (
              <div className="text-center py-8">
                <BoltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Không tìm thấy xe nào phù hợp với bộ lọc.</p>
              </div>
            )}
          </div>
        )}
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
    </div>
  );
};

export default BatteryStatus;