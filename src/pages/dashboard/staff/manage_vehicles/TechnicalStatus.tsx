import React, { useState, useEffect, useCallback } from 'react';
import {
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid';
import { message, Spin, Input, Select, Modal } from 'antd';
import { vehicleService } from '../../../../services/vehicleService';
import type { Vehicle } from '../../../../types/vehicle';

const { Option } = Select;

// Map Vehicle type to technical status
interface TechnicalVehicle extends Vehicle {
  technicalStatus: 'excellent' | 'good' | 'warning' | 'maintenance' | 'out-of-service';
  status: string; // Backend status like 'AVAILABLE', 'RENTED', etc.
}

export const TechnicalStatus: React.FC = () => {
  const [vehicles, setVehicles] = useState<TechnicalVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Status update modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<TechnicalVehicle | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateReason, setUpdateReason] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  // Map Vehicle to TechnicalVehicle
  const mapVehicleToTechnicalVehicle = (vehicle: Vehicle): TechnicalVehicle => {
    let technicalStatus: 'excellent' | 'good' | 'warning' | 'maintenance' | 'out-of-service';
    
    // Map based on vehicle availability and condition
    if (vehicle.availability === 'maintenance') {
      technicalStatus = 'maintenance';
    } else if (vehicle.condition === 'excellent') {
      technicalStatus = 'excellent';
    } else if (vehicle.condition === 'good') {
      technicalStatus = 'good';
    } else if (vehicle.condition === 'fair') {
      technicalStatus = 'warning';
    } else {
      technicalStatus = 'out-of-service';
    }

    return {
      ...vehicle,
      technicalStatus,
      status: (vehicle as Vehicle & { status?: string }).status || 'AVAILABLE' // Backend status
    };
  };

  // Load vehicles data
  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading all vehicles for technical status...');
      
      const { vehicles: allVehicles } = await vehicleService.getAllVehicles({ 
        limit: 1000 // Get all vehicles
      });
      
      console.log('✅ Loaded vehicles:', allVehicles);
      
      const mappedVehicles = allVehicles.map(mapVehicleToTechnicalVehicle);
      setVehicles(mappedVehicles);
      
    } catch (error) {
      console.error('❌ Error loading vehicles:', error);
      message.error('Không thể tải danh sách xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Handle update vehicle status - show modal
  const handleUpdateStatus = (vehicle: TechnicalVehicle) => {
    // Check if vehicle is rented
    if (vehicle.availability === 'rented') {
      message.warning('Không thể cập nhật trạng thái xe đang được thuê!');
      return;
    }
    
    setSelectedVehicle(vehicle);
    setSelectedStatus(vehicle.status || 'AVAILABLE');
    setUpdateReason('');
    setIsModalVisible(true);
  };

  // Handle status update confirmation
  const handleStatusUpdate = async () => {
    if (!selectedVehicle || !selectedStatus) return;
    
    // Check if status is the same
    if (selectedStatus === selectedVehicle.status) {
      message.warning('Vui lòng chọn trạng thái khác với trạng thái hiện tại!');
      return;
    }
    
    try {
      setUpdating(true);
      
      await vehicleService.updateVehicleStatus(
        selectedVehicle.id,
        selectedStatus,
        updateReason || undefined
      );
      
      message.success(`Đã cập nhật trạng thái xe ${selectedVehicle.name} thành công!`);
      
      // Refresh vehicles list
      await loadVehicles();
      
      // Close modal
      setIsModalVisible(false);
      setSelectedVehicle(null);
      setUpdateReason('');
      
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        ? (error.response.data.message as string)
        : 'Không thể cập nhật trạng thái xe. Vui lòng thử lại.';
      message.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedVehicle(null);
    setUpdateReason('');
    setSelectedStatus('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircleSolidIcon className="w-5 h-5 text-green-500" />;
      case 'good': return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'warning': return <ExclamationTriangleSolidIcon className="w-5 h-5 text-yellow-500" />;
      case 'maintenance': return <CogIcon className="w-5 h-5 text-orange-500" />;
      case 'out-of-service': return <XCircleSolidIcon className="w-5 h-5 text-red-500" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Xuất sắc';
      case 'good': return 'Tốt';
      case 'warning': return 'Cảnh báo';
      case 'maintenance': return 'Đang bảo trì';
      case 'out-of-service': return 'Ngừng hoạt động';
      default: return 'Không xác định';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || vehicle.technicalStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <WrenchScrewdriverIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Tình trạng kỹ thuật</h1>
        </div>
        <p className="text-gray-600">
          Theo dõi tình trạng kỹ thuật và lịch bảo trì của các xe
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm xe, model, thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
              allowClear
            />
          </div>

          {/* Filter */}
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            className="w-48"
          >
            <Option value="all">Tất cả</Option>
            <Option value="excellent">Xuất sắc</Option>
            <Option value="good">Tốt</Option>
            <Option value="warning">Cảnh báo</Option>
            <Option value="maintenance">Đang bảo trì</Option>
            <Option value="out-of-service">Ngừng hoạt động</Option>
          </Select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        {['excellent', 'good', 'warning', 'maintenance', 'out-of-service'].map((status) => (
          <div key={status} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getStatusText(status)}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicles.filter(v => v.technicalStatus === status).length}
                </p>
              </div>
              {getStatusIcon(status)}
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
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
                  ID xe / Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên xe / Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tình trạng kỹ thuật
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vị trí xe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-y-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Spin size="large" />
                    <div className="mt-3 text-gray-500">Đang tải danh sách xe...</div>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={vehicle.image || "https://via.placeholder.com/80x60?text=Vehicle"} 
                        alt="vehicle" 
                        className="w-16 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">ID: {vehicle.id}</div>
                        <div className="text-sm text-gray-500">Model: {vehicle.model}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Tên xe: {vehicle.name}</div>
                        <div className="text-sm text-gray-500">Loại: {vehicle.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(vehicle.technicalStatus)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {getStatusText(vehicle.technicalStatus)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.location || 'Chưa xác định'}</div>
                      <div className="text-xs text-gray-500">Pin: {vehicle.batteryLevel}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vehicle.availability === 'available' ? 'bg-green-100 text-green-800' :
                        vehicle.availability === 'rented' ? 'bg-blue-100 text-blue-800' :
                        vehicle.availability === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.availability === 'available' ? 'Có sẵn' :
                         vehicle.availability === 'rented' ? 'Đang thuê' :
                         vehicle.availability === 'maintenance' ? 'Bảo trì' : 'Không sẵn sàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(vehicle);
                          }}
                          disabled={vehicle.availability === 'rented'}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            vehicle.availability === 'rented' 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                          title={vehicle.availability === 'rented' ? 'Xe đang thuê - không thể cập nhật' : 'Cập nhật trạng thái xe'}
                        >
                          Cập nhật
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Empty state */}
          {filteredVehicles.length === 0 && !loading && (
            <div className="text-center py-8">
              <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không tìm thấy xe nào phù hợp với bộ lọc.</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        title="Cập nhật trạng thái xe"
        open={isModalVisible}
        onOk={handleStatusUpdate}
        onCancel={handleModalClose}
        confirmLoading={updating}
        okText="Cập nhật"
        cancelText="Hủy"
        width={500}
      >
        {selectedVehicle && (
          <div className="space-y-4">
            {/* Vehicle Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <img 
                  src={selectedVehicle.image || "https://via.placeholder.com/60x40?text=Vehicle"} 
                  alt="vehicle" 
                  className="w-12 h-8 object-cover rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">{selectedVehicle.name}</div>
                  <div className="text-sm text-gray-500">ID: {selectedVehicle.id}</div>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái hiện tại
              </label>
              <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                selectedVehicle.availability === 'available' ? 'bg-green-100 text-green-800' :
                selectedVehicle.availability === 'rented' ? 'bg-blue-100 text-blue-800' :
                selectedVehicle.availability === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedVehicle.availability === 'available' ? 'Có sẵn' :
                 selectedVehicle.availability === 'rented' ? 'Đang thuê' :
                 selectedVehicle.availability === 'maintenance' ? 'Bảo trì' : 'Không sẵn sàng'}
              </div>
            </div>

            {/* New Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái mới <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                className="w-full"
                placeholder="Chọn trạng thái mới"
              >
                <Option value="AVAILABLE">Có sẵn</Option>
                <Option value="RESERVED">Đã đặt</Option>
                <Option value="RENTED">Đang thuê</Option>
                <Option value="MAINTENANCE">Bảo trì</Option>
              </Select>
            </div>

            {/* Reason (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do thay đổi (tùy chọn)
              </label>
              <Input.TextArea
                value={updateReason}
                onChange={(e) => setUpdateReason(e.target.value)}
                placeholder="Nhập lý do thay đổi trạng thái..."
                rows={3}
                maxLength={500}
                showCount
              />
            </div>

            {/* Business Rules Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong>
                <ul className="mt-1 ml-4 list-disc">
                  <li>Xe "Có sẵn" có thể chuyển thành "Đã đặt" hoặc "Bảo trì"</li>
                  <li>Xe "Đã đặt" có thể chuyển thành "Có sẵn" hoặc "Đang thuê"</li>
                  <li>Xe "Đang thuê" có thể chuyển thành "Có sẵn" hoặc "Bảo trì"</li>
                  <li>Xe "Bảo trì" có thể chuyển thành "Có sẵn"</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TechnicalStatus;