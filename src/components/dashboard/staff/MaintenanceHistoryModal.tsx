import React from 'react';
import { Modal } from '../../Modal';

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  technician: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  cost?: number;
}

interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
  maintenanceRecords: MaintenanceRecord[];
}

interface MaintenanceHistoryModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
}

export const MaintenanceHistoryModal: React.FC<MaintenanceHistoryModalProps> = ({
  isOpen,
  vehicle,
  onClose
}) => {
  if (!vehicle) return null;

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMaintenanceTypeLabel = (type: string) => {
    switch (type) {
      case 'routine': return 'Bảo trì định kỳ';
      case 'repair': return 'Sửa chữa';
      case 'inspection': return 'Kiểm tra';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang thực hiện';
      case 'scheduled': return 'Đã lên lịch';
      default: return status;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lịch sử bảo trì"
      subtitle={`${vehicle.model} - ${vehicle.licensePlate}`}
      size="lg"
    >
      <div className="space-y-4">
        {vehicle.maintenanceRecords.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">Chưa có lịch sử bảo trì</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicle.maintenanceRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{record.description}</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Ngày:</span> {record.date}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Kỹ thuật viên:</span> {record.technician}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Loại:</span> {getMaintenanceTypeLabel(record.type)}
                      </p>
                      {record.cost && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Chi phí:</span> {record.cost.toLocaleString()}đ
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getMaintenanceStatusColor(record.status)}`}>
                    {getStatusLabel(record.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};