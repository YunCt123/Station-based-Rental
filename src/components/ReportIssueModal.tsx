import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  XMarkIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { reportRentalIssue } from '@/services/issueService';
import IssuePhotoUpload from './IssuePhotoUpload';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: string;
  vehicleName?: string;
  onSuccess?: () => void;
}

interface IssueForm {
  title: string;
  description: string;
  photos: string[];
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  rentalId,
  vehicleName = 'xe',
  onSuccess
}) => {
  const [formData, setFormData] = useState<IssueForm>({
    title: '',
    description: '',
    photos: []
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Chặn scroll khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup khi component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề sự cố');
      return;
    }

    try {
      setLoading(true);
      
      await reportRentalIssue(rentalId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        photos: formData.photos
      });

      setSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 2000);

    } catch (error) {
      console.error('Error reporting issue:', error);
      alert(`Không thể báo cáo sự cố: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ title: '', description: '', photos: [] });
      setSuccess(false);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Chỉ đóng modal khi click vào overlay, không phải content
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleInputChange = (field: keyof IssueForm, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  // Success state
  if (success) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
        onClick={handleOverlayClick}
      >
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center shadow-2xl border relative z-[10000]">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Báo cáo thành công!
          </h3>
          <p className="text-gray-600 mb-4">
            Sự cố của bạn đã được gửi đến nhân viên. Chúng tôi sẽ xử lý trong thời gian sớm nhất.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Đang đóng cửa sổ...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border relative z-[10000]"
        onClick={(e) => e.stopPropagation()} // Ngăn đóng modal khi click vào content
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Báo cáo sự cố</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vehicle Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Thông tin xe thuê</h3>
            <p className="text-sm text-gray-600">
              Xe: <span className="font-medium">{vehicleName}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Mã thuê xe: {rentalId}
            </p>
          </div>

          {/* Issue Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề sự cố *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="VD: Xe không khởi động được, Phanh không hoạt động..."
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 ký tự
            </p>
          </div>

          {/* Issue Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả chi tiết về sự cố: thời gian xảy ra, triệu chứng, hoàn cảnh..."
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 ký tự (Không bắt buộc)
            </p>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh minh chứng
            </label>
            <IssuePhotoUpload
              photos={formData.photos}
              onChange={(photos) => handleInputChange('photos', photos)}
              maxPhotos={5}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Đang gửi...' : 'Báo cáo sự cố'}</span>
            </button>
          </div>
        </form>

        {/* Warning notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mb-6">
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Lưu ý quan trọng:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Nếu gặp sự cố nghiêm trọng, hãy gọi hotline ngay: <strong>1900 xxxx</strong></li>
              <li>Không tiếp tục sử dụng xe nếu phát hiện sự cố an toàn</li>
              <li>Báo cáo sẽ được xử lý trong vòng 30 phút trong giờ hành chính</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssueModal;