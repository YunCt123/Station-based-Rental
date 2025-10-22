import React, { useState } from 'react';
import {
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid';
import { TechnicalIssueModal } from '../../../../components/dashboard/staff/manage_vehicles/TechnicalIssueModal';
import { MaintenanceScheduleModal } from '../../../../components/dashboard/staff/manage_vehicles/MaintenanceScheduleModal';
import { MaintenanceHistoryModal } from '../../../../components/dashboard/staff/manage_vehicles/MaintenanceHistoryModal';

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  technician: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  cost?: number;
}

interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
  technicalStatus: 'excellent' | 'good' | 'warning' | 'maintenance' | 'out-of-service';
  lastInspection: string;
  nextMaintenance: string;
  mileage: number;
  position: string; // Vị trí trong trạm
  maintenanceRecords: MaintenanceRecord[];
  issues: string[];
}

const mockVehicles: Vehicle[] = [
  {
    id: 'EV001',
    model: 'Tesla Model 3',
    licensePlate: '30A-12345',
    technicalStatus: 'excellent',
    lastInspection: '2024-10-10',
    nextMaintenance: '2024-11-15',
    mileage: 25400,
    position: 'Vị trí 1',
    issues: [],
    maintenanceRecords: [
      {
        id: 'M001',
        date: '2024-10-10',
        type: 'inspection',
        description: 'Kiểm tra định kỳ 6 tháng',
        technician: 'Nguyễn Văn A',
        status: 'completed'
      },
      {
        id: 'M002',
        date: '2024-09-15',
        type: 'routine',
        description: 'Thay lốp xe sau trái',
        technician: 'Trần Văn B',
        status: 'completed',
        cost: 1500000
      }
    ]
  },
  {
    id: 'EV002',
    model: 'VinFast VF8',
    licensePlate: '30B-67890',
    technicalStatus: 'good',
    lastInspection: '2024-09-25',
    nextMaintenance: '2024-10-20',
    mileage: 18200,
    position: 'Vị trí 3',
    issues: ['Tiếng ồn nhẹ từ động cơ'],
    maintenanceRecords: [
      {
        id: 'M003',
        date: '2024-10-20',
        type: 'routine',
        description: 'Bảo dưỡng định kỳ',
        technician: 'Lê Thị C',
        status: 'scheduled'
      }
    ]
  },
  {
    id: 'EV003',
    model: 'BYD Seal',
    licensePlate: '30C-11111',
    technicalStatus: 'warning',
    lastInspection: '2024-08-15',
    nextMaintenance: '2024-10-16',
    mileage: 31500,
    position: 'Vị trí 7',
    issues: ['Phanh có tiếng kêu', 'Đèn báo lỗi ABS'],
    maintenanceRecords: [
      {
        id: 'M004',
        date: '2024-10-16',
        type: 'repair',
        description: 'Sửa chữa hệ thống phanh ABS',
        technician: 'Phạm Văn D',
        status: 'in-progress'
      }
    ]
  },
  {
    id: 'EV004',
    model: 'Hyundai Kona',
    licensePlate: '30D-22222',
    technicalStatus: 'maintenance',
    lastInspection: '2024-10-05',
    nextMaintenance: '2024-10-15',
    mileage: 42300,
    position: 'Xưởng bảo trì',
    issues: ['Hư hỏng hệ thống sạc', 'Cần thay pin phụ'],
    maintenanceRecords: [
      {
        id: 'M005',
        date: '2024-10-15',
        type: 'repair',
        description: 'Thay thế hệ thống sạc và pin phụ',
        technician: 'Nguyễn Thị E',
        status: 'in-progress',
        cost: 8500000
      }
    ]
  }
];

export const TechnicalStatus: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [modalVehicle, setModalVehicle] = useState<Vehicle | null>(null);
  
  // Form states
  const [issueDescription, setIssueDescription] = useState('');
  const [issueSeverity, setIssueSeverity] = useState('low');
  const [maintenanceType, setMaintenanceType] = useState('preventive');
  const [maintenanceDescription, setMaintenanceDescription] = useState('');

  // Modal handlers
  const handleReportIssue = (vehicle: Vehicle) => {
    setModalVehicle(vehicle);
    setShowReportModal(true);
  };

  const handleScheduleMaintenance = (vehicle: Vehicle) => {
    setModalVehicle(vehicle);
    setShowMaintenanceModal(true);
  };

  const handleViewHistory = (vehicle: Vehicle) => {
    setModalVehicle(vehicle);
    setShowHistoryModal(true);
  };

  const handleSubmitIssue = () => {
    if (!modalVehicle || !issueDescription.trim()) return;
    
    // Simulate API call
    console.log('Báo cáo sự cố:', {
      vehicleId: modalVehicle.id,
      description: issueDescription,
      severity: issueSeverity,
      timestamp: new Date()
    });
    
    setShowReportModal(false);
    setIssueDescription('');
    setIssueSeverity('low');
    setModalVehicle(null);
  };

  const handleSubmitMaintenance = () => {
    if (!modalVehicle || !maintenanceDescription.trim()) return;
    
    // Simulate API call
    console.log('Lên lịch bảo trì:', {
      vehicleId: modalVehicle.id,
      type: maintenanceType,
      description: maintenanceDescription,
      scheduledDate: new Date()
    });
    
    setShowMaintenanceModal(false);
    setMaintenanceType('preventive');
    setMaintenanceDescription('');
    setModalVehicle(null);
  };

  const closeModals = () => {
    setShowReportModal(false);
    setShowMaintenanceModal(false);
    setShowHistoryModal(false);
    setModalVehicle(null);
    setIssueDescription('');
    setIssueSeverity('low');
    setMaintenanceType('preventive');
    setMaintenanceDescription('');
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

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVehicles = mockVehicles.filter(vehicle => {
    const matchesSearch = vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.position.toLowerCase().includes(searchTerm.toLowerCase());
    
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="excellent">Xuất sắc</option>
            <option value="good">Tốt</option>
            <option value="warning">Cảnh báo</option>
            <option value="maintenance">Đang bảo trì</option>
            <option value="out-of-service">Ngừng hoạt động</option>
          </select>
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
                  {mockVehicles.filter(v => v.technicalStatus === status).length}
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
                  ID xe / Biển số
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại xe / Model
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
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr 
                  key={vehicle.id} 
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedVehicle?.id === vehicle.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
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
                      {getStatusIcon(vehicle.technicalStatus)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {getStatusText(vehicle.technicalStatus)}
                      </span>
                    </div>
                    {vehicle.issues.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-red-600">
                          {vehicle.issues.length} vấn đề
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vehicle.position}</div>
                    <div className="text-xs text-gray-500">{vehicle.mileage.toLocaleString()} km</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      vehicle.technicalStatus === 'excellent' ? 'bg-green-100 text-green-800' :
                      vehicle.technicalStatus === 'good' ? 'bg-blue-100 text-blue-800' :
                      vehicle.technicalStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      vehicle.technicalStatus === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.technicalStatus === 'excellent' ? 'Có sẵn' :
                       vehicle.technicalStatus === 'good' ? 'Có sẵn' :
                       vehicle.technicalStatus === 'warning' ? 'Cần kiểm tra' :
                       vehicle.technicalStatus === 'maintenance' ? 'Bảo trì' : 'Không sẵn sàng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleReportIssue(vehicle)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                      >
                        Báo sự cố
                      </button>
                      <button 
                        onClick={() => handleScheduleMaintenance(vehicle)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                      >
                        Bảo trì
                      </button>
                      <button 
                        onClick={() => handleViewHistory(vehicle)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                      >
                        Lịch sử
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredVehicles.length === 0 && (
            <div className="text-center py-8">
              <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không tìm thấy xe nào phù hợp với bộ lọc.</p>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Details Section */}
      {selectedVehicle && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Chi tiết xe</h3>
            <p className="text-sm text-gray-600">{selectedVehicle.model} - {selectedVehicle.licensePlate}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status Overview */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Tình trạng hiện tại</h4>
                <div className="flex items-center gap-2 mb-4">
                  {getStatusIcon(selectedVehicle.technicalStatus)}
                  <span className="font-medium">{getStatusText(selectedVehicle.technicalStatus)}</span>
                </div>

                {/* Key Metrics */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Km đã đi:</span>
                    <span className="font-medium">{selectedVehicle.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kiểm tra cuối:</span>
                    <span className="font-medium">{selectedVehicle.lastInspection}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bảo trì tiếp:</span>
                    <span className="font-medium">{selectedVehicle.nextMaintenance}</span>
                  </div>
                </div>
              </div>

              {/* Issues */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Vấn đề hiện tại</h4>
                {selectedVehicle.issues.length > 0 ? (
                  <div className="space-y-2">
                    {selectedVehicle.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Không có vấn đề nào</p>
                )}
              </div>

              {/* Maintenance History */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Lịch sử bảo trì gần đây</h4>
                <div className="space-y-3">
                  {selectedVehicle.maintenanceRecords.slice(0, 3).map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getMaintenanceStatusColor(record.status)}`}>
                          {record.status === 'completed' ? 'Hoàn thành' :
                           record.status === 'in-progress' ? 'Đang thực hiện' : 'Đã lên lịch'}
                        </span>
                        <span className="text-xs text-gray-500">{record.date}</span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 mb-1">{record.description}</p>
                      <p className="text-xs text-gray-600">Kỹ thuật viên: {record.technician}</p>
                      
                      {record.cost && (
                        <p className="text-xs text-gray-600 mt-1">
                          Chi phí: {record.cost.toLocaleString()} VNĐ
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technical Issue Modal */}
      <TechnicalIssueModal
        isOpen={showReportModal}
        vehicle={modalVehicle}
        issueDescription={issueDescription}
        setIssueDescription={setIssueDescription}
        issueSeverity={issueSeverity}
        setIssueSeverity={setIssueSeverity}
        onSubmit={handleSubmitIssue}
        onClose={closeModals}
      />

      {/* Maintenance Schedule Modal */}
      <MaintenanceScheduleModal
        isOpen={showMaintenanceModal}
        vehicle={modalVehicle}
        maintenanceType={maintenanceType}
        setMaintenanceType={setMaintenanceType}
        maintenanceDescription={maintenanceDescription}
        setMaintenanceDescription={setMaintenanceDescription}
        onSubmit={handleSubmitMaintenance}
        onClose={closeModals}
      />

      {/* Maintenance History Modal */}
      <MaintenanceHistoryModal
        isOpen={showHistoryModal}
        vehicle={modalVehicle}
        onClose={closeModals}
      />

    </div>
  );
};

export default TechnicalStatus;