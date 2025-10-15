import React from 'react';

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
  if (!isOpen || !vehicle) return null;

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lịch sử bảo trì</h3>
          <p className="text-sm text-gray-600">{vehicle.model} - {vehicle.licensePlate}</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {vehicle.maintenanceRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{record.description}</h4>
                    <p className="text-sm text-gray-600">Ngày: {record.date}</p>
                    <p className="text-sm text-gray-600">Kỹ thuật viên: {record.technician}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMaintenanceStatusColor(record.status)}`}>
                    {record.status === 'completed' ? 'Hoàn thành' :
                     record.status === 'in-progress' ? 'Đang thực hiện' : 'Đã lên lịch'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Loại: {record.type === 'routine' ? 'Bảo trì định kỳ' : 
                                                                record.type === 'repair' ? 'Sửa chữa' : 'Kiểm tra'}</p>
                {record.cost && (
                  <p className="text-xs text-gray-500">Chi phí: {record.cost.toLocaleString()}đ</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};