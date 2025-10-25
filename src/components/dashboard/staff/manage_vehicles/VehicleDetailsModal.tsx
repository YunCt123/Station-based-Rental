import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
} from '@heroicons/react/24/solid';

interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
  technicalStatus: 'excellent' | 'good' | 'warning' | 'maintenance' | 'out-of-service';
  lastInspection: string;
  nextMaintenance: string;
  mileage: number;
  position: string;
  issues: string[];
}

interface VehicleDetailsModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !vehicle) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'out-of-service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Tuyệt vời';
      case 'good': return 'Tốt';
      case 'warning': return 'Cảnh báo';
      case 'maintenance': return 'Đang bảo trì';
      case 'out-of-service': return 'Ngừng hoạt động';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircleSolidIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
      case 'maintenance':
      case 'out-of-service':
        return <ExclamationTriangleSolidIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Chi tiết xe</h3>
            <p className="text-sm text-gray-600 mt-1">{vehicle.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vehicle Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin xe</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Model:</span>
                <span className="text-sm font-semibold text-gray-900">{vehicle.model}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Biển số:</span>
                <span className="text-sm font-semibold text-gray-900">{vehicle.licensePlate}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Số km:</span>
                <span className="text-sm font-semibold text-gray-900">{vehicle.mileage.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Vị trí:</span>
                <span className="text-sm font-semibold text-gray-900">{vehicle.position}</span>
              </div>
            </div>
          </div>

          {/* Technical Status */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Tình trạng kỹ thuật</h4>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {getStatusIcon(vehicle.technicalStatus)}
              <div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(vehicle.technicalStatus)}`}>
                  {getStatusText(vehicle.technicalStatus)}
                </span>
              </div>
            </div>
          </div>

          {/* Maintenance Schedule */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Lịch bảo trì</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Lần kiểm tra cuối</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(vehicle.lastInspection).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Bảo trì tiếp theo</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(vehicle.nextMaintenance).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* Issues */}
          {vehicle.issues.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Vấn đề hiện tại</h4>
              <div className="space-y-2">
                {vehicle.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <ExclamationTriangleSolidIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{issue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {vehicle.issues.length === 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircleSolidIcon className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-800">Không có vấn đề kỹ thuật</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
