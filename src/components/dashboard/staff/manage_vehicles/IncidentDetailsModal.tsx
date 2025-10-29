import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {
  ClockIcon as ClockSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';

interface Incident {
  id: string;
  vehicleId: string;
  vehicleModel: string;
  licensePlate: string;
  reportedBy: string;
  reportedAt: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  images: string[];
  stationName?: string;
}

interface IncidentDetailsModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (incidentId: string, newStatus: Incident['status']) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  incident,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen || !incident) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'IN_PROGRESS':
        return <ClockSolidIcon className="w-5 h-5 text-blue-500" />;
      case 'RESOLVED':
        return <CheckCircleSolidIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ClockSolidIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Đã báo cáo';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'RESOLVED': return 'Đã giải quyết';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-semibold text-gray-900">Chi tiết sự cố</h3>
            </div>
            <p className="text-sm text-gray-600">Mã sự cố: {incident.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content - Horizontal Layout */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title and Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{incident.title}</h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {incident.description}
                </p>
              </div>

              {/* Status */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Trạng thái</h5>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(incident.status)}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(incident.status)}`}>
                      {getStatusText(incident.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Thông tin xe</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Model:</span>
                    <span className="text-sm font-semibold text-gray-900">{incident.vehicleModel}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Biển số:</span>
                    <span className="text-sm font-semibold text-gray-900">{incident.licensePlate}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Trạm:</span>
                    <span className="text-sm font-semibold text-gray-900">{incident.stationName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Mã xe:</span>
                    <span className="text-sm font-semibold text-gray-900">{incident.vehicleId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Report Information */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Thông tin báo cáo</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Người báo cáo:</span>
                    <span className="text-sm font-semibold text-gray-900">{incident.reportedBy}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Thời gian báo cáo:</span>
                    <span className="text-sm font-semibold text-gray-900">{incident.reportedAt}</span>
                  </div>
                </div>
              </div>

              {/* Images */}
              {incident.images.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Hình ảnh ({incident.images.length})</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {incident.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Incident ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {onUpdateStatus && (
            <div className="pt-4 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Hành động</h5>
              <div className="flex gap-2 flex-wrap">
                {incident.status === 'OPEN' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(incident.id, 'IN_PROGRESS');
                      onClose();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Bắt đầu xử lý
                  </button>
                )}
                {incident.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(incident.id, 'RESOLVED');
                      onClose();
                    }}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Đánh dấu hoàn thành
                  </button>
                )}
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
