import React from 'react';
import { Modal } from '../../../Modal';

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
  if (!vehicle) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCharging ? 'Dừng sạc xe' : 'Bắt đầu sạc xe'}
      subtitle={`${vehicle.model} - ${vehicle.licensePlate}`}
      size="md"
    >
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-amber-800">
              {isCharging 
                ? 'Bạn có chắc chắn muốn dừng sạc xe này không?'
                : 'Bạn có chắc chắn muốn bắt đầu sạc xe này không?'
              }
            </p>
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
            onClick={onConfirm}
            className={`px-6 py-2 text-white rounded-lg transition-colors font-medium ${
              isCharging 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isCharging ? 'Dừng sạc' : 'Bắt đầu sạc'}
          </button>
        </div>
      </div>
    </Modal>
  );
};