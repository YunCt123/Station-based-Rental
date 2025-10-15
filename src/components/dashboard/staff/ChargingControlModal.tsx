import React from 'react';

interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
}

interface ChargingControlModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  isCharging: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ChargingControlModal: React.FC<ChargingControlModalProps> = ({
  isOpen,
  vehicle,
  isCharging,
  onConfirm,
  onClose
}) => {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isCharging ? 'Dừng sạc xe' : 'Bắt đầu sạc xe'}
          </h3>
          <p className="text-sm text-gray-600">{vehicle.model} - {vehicle.licensePlate}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                {isCharging 
                  ? 'Bạn có chắc chắn muốn dừng sạc xe này không?'
                  : 'Bạn có chắc chắn muốn bắt đầu sạc xe này không?'
                }
              </p>
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
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                isCharging 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isCharging ? 'Dừng sạc' : 'Bắt đầu sạc'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};