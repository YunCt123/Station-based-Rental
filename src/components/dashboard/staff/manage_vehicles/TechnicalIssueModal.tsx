import React from 'react';
import { Modal } from '../../../Modal';

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
  if (!vehicle) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Báo cáo sự cố kỹ thuật"
      subtitle={`${vehicle.model} - ${vehicle.licensePlate}`}
      size="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mức độ nghiêm trọng <span className="text-red-500">*</span>
          </label>
          <select 
            value={issueSeverity}
            onChange={(e) => setIssueSeverity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
            <option value="critical">Nghiêm trọng</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả sự cố <span className="text-red-500">*</span>
          </label>
          <textarea
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Mô tả chi tiết sự cố đã phát hiện..."
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
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Báo cáo sự cố
          </button>
        </div>
      </div>
    </Modal>
  );
};