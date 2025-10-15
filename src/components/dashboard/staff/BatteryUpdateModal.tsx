import React from 'react';

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
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cập nhật mức pin</h3>
          <p className="text-sm text-gray-600">{vehicle.model} - {vehicle.licensePlate}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mức pin hiện tại (%): {batteryLevel}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={batteryLevel}
              onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};