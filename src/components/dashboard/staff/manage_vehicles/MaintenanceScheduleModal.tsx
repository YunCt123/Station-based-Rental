import React from 'react';
import { Modal } from '../../../Modal';

interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
}

interface MaintenanceScheduleModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  maintenanceType: string;
  setMaintenanceType: (type: string) => void;
  maintenanceDescription: string;
  setMaintenanceDescription: (description: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const MaintenanceScheduleModal: React.FC<MaintenanceScheduleModalProps> = ({
  isOpen,
  vehicle,
  maintenanceType,
  setMaintenanceType,
  maintenanceDescription,
  setMaintenanceDescription,
  onSubmit,
  onClose
}) => {
  if (!vehicle) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lên lịch bảo trì"
      subtitle={`${vehicle.model} - ${vehicle.licensePlate}`}
      size="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại bảo trì <span className="text-red-500">*</span>
          </label>
          <select 
            value={maintenanceType}
            onChange={(e) => setMaintenanceType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="preventive">Bảo trì dự phòng</option>
            <option value="corrective">Bảo trì sửa chữa</option>
            <option value="emergency">Bảo trì khẩn cấp</option>
            <option value="inspection">Kiểm tra định kỳ</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả công việc <span className="text-red-500">*</span>
          </label>
          <textarea
            value={maintenanceDescription}
            onChange={(e) => setMaintenanceDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Mô tả chi tiết công việc bảo trì cần thực hiện..."
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Lên lịch bảo trì
          </button>
        </div>
      </div>
    </Modal>
  );
};