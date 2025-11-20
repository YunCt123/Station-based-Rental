import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  // CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
// import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import type { AddResolutionRequest, Priority } from '@/services/issueService';

interface IssueResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resolutionData: AddResolutionRequest) => void;
  issue: {
    id: string;
    title: string;
    description: string;
    vehicleModel?: string;
    licensePlate?: string;
    reportedBy?: string;
    priority?: Priority;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  };
  loading?: boolean;
}

export const IssueResolutionModal: React.FC<IssueResolutionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  issue,
  loading = false
}) => {
  const [formData, setFormData] = useState<AddResolutionRequest>({
    solution_description: '',
    resolution_actions: [''],
    resolution_notes: '',
    resolution_photos: [],
    estimated_cost: undefined,
    actual_cost: undefined,
    mark_as_resolved: false,
    customer_satisfaction: 'NOT_RATED',
    follow_up_required: false
  });

  const [actionInputs, setActionInputs] = useState<string[]>(['']);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        solution_description: '',
        resolution_actions: [''],
        resolution_notes: '',
        resolution_photos: [],
        estimated_cost: undefined,
        actual_cost: undefined,
        mark_as_resolved: false,
        customer_satisfaction: 'NOT_RATED',
        follow_up_required: false
      });
      setActionInputs(['']);
    }
  }, [isOpen]);

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

  const handleAddAction = () => {
    if (actionInputs.length < 10) {
      setActionInputs([...actionInputs, '']);
    }
  };

  const handleRemoveAction = (index: number) => {
    if (actionInputs.length > 1) {
      const newActions = actionInputs.filter((_, i) => i !== index);
      setActionInputs(newActions);
      setFormData(prev => ({
        ...prev,
        resolution_actions: newActions.filter(action => action.trim() !== '')
      }));
    }
  };

  const handleActionChange = (index: number, value: string) => {
    const newActions = actionInputs.map((action, i) => i === index ? value : action);
    setActionInputs(newActions);
    setFormData(prev => ({
      ...prev,
      resolution_actions: newActions.filter(action => action.trim() !== '')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.solution_description.trim()) {
      alert('Vui lòng nhập mô tả phương án giải quyết');
      return;
    }

    // Clean up actions
    const cleanActions = actionInputs.filter(action => action.trim() !== '');
    
    const submissionData: AddResolutionRequest = {
      ...formData,
      resolution_actions: cleanActions.length > 0 ? cleanActions : undefined,
      estimated_cost: formData.estimated_cost || undefined,
      actual_cost: formData.actual_cost || undefined
    };

    onSubmit(submissionData);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Chỉ đóng modal khi click vào overlay, không phải content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Ngăn đóng modal khi click vào content
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <WrenchScrewdriverIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Thêm Phương Án Giải Quyết
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Issue Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tiêu đề: {issue.title}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Xe:</span> {issue.vehicleModel} - {issue.licensePlate}
            </div>
            <div>
              <span className="font-medium">Người báo cáo:</span> {issue.reportedBy}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-700">Thông tin: {issue.description}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Solution Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả phương án giải quyết *
            </label>
            <textarea
              value={formData.solution_description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                solution_description: e.target.value
              }))}
              placeholder="Mô tả chi tiết cách giải quyết vấn đề..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
              minLength={10}
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.solution_description.length}/1000 ký tự
            </p>
          </div>

          {/* Resolution Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Các hành động thực hiện
            </label>
            <div className="space-y-2">
              {actionInputs.map((action, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={action}
                    onChange={(e) => handleActionChange(index, e.target.value)}
                    placeholder={`Hành động ${index + 1}...`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={200}
                  />
                  {actionInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {actionInputs.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddAction}
                  className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-sm">Thêm hành động</span>
                </button>
              )}
            </div>
          </div>

          {/* Cost Information */}
          <div className="grid grid-cols-2 gap-4">
            {/* <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                Chi phí ước tính (VND)
              </label>
              <input
                type="number"
                min="0"
                value={formData.estimated_cost || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  estimated_cost: e.target.value ? Number(e.target.value) : undefined
                }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div> */}
            
            {/* <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                Chi phí thực tế (VND)
              </label>
              <input
                type="number"
                min="0"
                value={formData.actual_cost || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  actual_cost: e.target.value ? Number(e.target.value) : undefined
                }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div> */}
          </div>

          {/* Resolution Notes */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <DocumentTextIcon className="w-4 h-4 mr-1" />
              Ghi chú thêm
            </label>
            <textarea
              value={formData.resolution_notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                resolution_notes: e.target.value
              }))}
              placeholder="Ghi chú bổ sung về việc giải quyết..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.resolution_notes?.length || 0}/500 ký tự
            </p>
          </div>

          {/* Mark as Resolved */}
          {/* <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="mark_resolved"
                checked={formData.mark_as_resolved}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  mark_as_resolved: e.target.checked
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="mark_resolved" className="flex items-center text-sm font-medium text-gray-700">
                <CheckCircleSolidIcon className="w-4 h-4 mr-1 text-green-600" />
                Đánh dấu đã giải quyết xong
              </label>
            </div>

            {formData.mark_as_resolved && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đánh giá từ khách hàng
                  </label>
                  <select
                    value={formData.customer_satisfaction}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customer_satisfaction: e.target.value as CustomerSatisfaction
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="NOT_RATED">Chưa đánh giá</option>
                    <option value="SATISFIED">Hài lòng</option>
                    <option value="NEUTRAL">Bình thường</option>
                    <option value="UNSATISFIED">Không hài lòng</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="follow_up"
                    checked={formData.follow_up_required}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      follow_up_required: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="follow_up" className="text-sm text-gray-700">
                    Cần theo dõi thêm
                  </label>
                </div>
              </div>
            )}
          </div> */}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !formData.solution_description.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                null
              )}
              <span>{loading ? 'Đang xử lý...' : 'Lưu Phương Án Giải Quyết'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};