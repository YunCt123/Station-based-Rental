import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  ClockIcon as ClockSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid';
import customerIssueService, { type IssueListItem } from '../../../services/customerIssueService';

interface IssueHistoryScreenProps {
  onBack: () => void;
  onViewDetail: (issueId: string) => void;
}

const IssueHistoryScreen: React.FC<IssueHistoryScreenProps> = ({ onBack, onViewDetail }) => {
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchCustomerIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Use customerIssueService instead of fetch
      const params = {
        status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined,
        limit: 50
      };

      console.log('🚀 [IssueHistoryScreen] Starting to fetch customer issues with params:', params);
      const result = await customerIssueService.getCustomerIssues(params);
      console.log('📊 Customer issues service response:', result);
      console.log('📦 Response data type:', typeof result.data, 'isArray:', Array.isArray(result.data));
      console.log('📄 Response data content:', result.data);

      if (result.success && Array.isArray(result.data)) {
        console.log('✅ Setting issues array with', result.data.length, 'items');
        setIssues(result.data);
      } else {
        console.warn('⚠️ Unexpected response format:', result);
        setIssues([]); // Default to empty array
      }

    } catch (err) {
      console.error('❌ Error fetching customer issues:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử báo cáo');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCustomerIssues();
  }, [fetchCustomerIssues]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ExclamationTriangleSolidIcon className="w-5 h-5 text-red-500" />;
      case 'IN_PROGRESS':
        return <ClockSolidIcon className="w-5 h-5 text-yellow-500" />;
      case 'RESOLVED':
        return <CheckCircleSolidIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ClockSolidIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      'OPEN': 'bg-red-100 text-red-800 border-red-200',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'RESOLVED': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Đã báo cáo';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'RESOLVED': return 'Đã giải quyết';
      default: return status;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles: Record<string, string> = {
      'LOW': 'bg-gray-100 text-gray-600',
      'MEDIUM': 'bg-blue-100 text-blue-600',
      'HIGH': 'bg-orange-100 text-orange-600',
      'CRITICAL': 'bg-red-100 text-red-600'
    };
    
    return priorityStyles[priority] || 'bg-gray-100 text-gray-600';
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'Thấp';
      case 'MEDIUM': return 'Trung bình';
      case 'HIGH': return 'Cao';
      case 'CRITICAL': return 'Khẩn cấp';
      default: return priority;
    }
  };

  const filteredIssues = Array.isArray(issues) ? issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.vehicle_id?.licensePlate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.vehicle_id?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) : [];

  // Debug log render state
  console.log('🎨 [IssueHistoryScreen] Render state:', {
    loading,
    error,
    issuesLength: issues.length,
    filteredIssuesLength: filteredIssues.length,
    statusFilter,
    searchQuery
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center">
            <DocumentTextIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lịch Sử Báo Cáo</h1>
              <p className="text-gray-600 text-sm">Xem lại các sự cố bạn đã báo cáo</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, mô tả, biển số xe..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="open">Đã báo cáo</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <DocumentTextIcon className="w-8 h-8 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(issues) ? issues.length : 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Đã báo cáo</p>
              <p className="text-2xl font-bold text-red-600">
                {Array.isArray(issues) ? issues.filter(issue => issue.status === 'OPEN').length : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">
                {Array.isArray(issues) ? issues.filter(issue => issue.status === 'IN_PROGRESS').length : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Đã giải quyết</p>
              <p className="text-2xl font-bold text-green-600">
                {Array.isArray(issues) ? issues.filter(issue => issue.status === 'RESOLVED').length : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách báo cáo ({filteredIssues.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchCustomerIssues()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {!Array.isArray(issues) || issues.length === 0 
                ? 'Bạn chưa có báo cáo sự cố nào.' 
                : 'Không tìm thấy báo cáo phù hợp với tìm kiếm.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredIssues.map((issue) => (
              <div key={issue._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Title and Status */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(issue.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(issue.status)}`}>
                          {getStatusText(issue.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(issue.priority)}`}>
                          {getPriorityText(issue.priority)}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-3 line-clamp-2">{issue.description}</p>

                    {/* Vehicle and Rental Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {issue.vehicle_id && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">Xe:</span>
                          <span className="text-gray-600">
                            {issue.vehicle_id.name} • {issue.vehicle_id.licensePlate}
                          </span>
                        </div>
                      )}
                      
                      {issue.station_id && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">Trạm:</span>
                          <span className="text-gray-600">{issue.station_id.name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Thời gian:</span>
                        <span className="text-gray-600">
                          {new Date(issue.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {issue.photos?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">Ảnh:</span>
                          <span className="text-gray-600">{issue.photos.length} ảnh</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-6">
                    <button
                      onClick={() => onViewDetail(issue._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueHistoryScreen;