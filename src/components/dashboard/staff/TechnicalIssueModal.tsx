import React from 'react';

interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
}

interface TechnicalIssueModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  issueDescription: string;
  setIssueDescription: (description: string) => void;
  issueSeverity: string;
  setIssueSeverity: (severity: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const TechnicalIssueModal: React.FC<TechnicalIssueModalProps> = ({
  isOpen,
  vehicle,
  issueDescription,
  setIssueDescription,
  issueSeverity,
  setIssueSeverity,
  onSubmit,
  onClose
}) => {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Báo cáo sự cố kỹ thuật</h3>
          <p className="text-sm text-gray-600">{vehicle.model} - {vehicle.licensePlate}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mức độ nghiêm trọng
            </label>
            <select 
              value={issueSeverity}
              onChange={(e) => setIssueSeverity(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
              <option value="critical">Nghiêm trọng</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả sự cố
            </label>
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả chi tiết sự cố đã phát hiện..."
            />
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
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Báo cáo sự cố
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};