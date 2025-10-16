import React from 'react';
import { Modal } from '../../Modal';

interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
}

interface BatteryUpdateModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  batteryLevel: number;
  setBatteryLevel: (level: number) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const BatteryUpdateModal: React.FC<BatteryUpdateModalProps> = ({
  isOpen,
  vehicle,
  batteryLevel,
  setBatteryLevel,
  onSubmit,
  onClose
}) => {
  if (!vehicle) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập nhật mức pin"
      subtitle={`${vehicle.model} - ${vehicle.licensePlate}`}
      size="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mức pin hiện tại (%): <span className="text-blue-600 font-semibold">{batteryLevel}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={batteryLevel}
            onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Lưu
          </button>
        </div>
      </div>
    </Modal>
  );
};