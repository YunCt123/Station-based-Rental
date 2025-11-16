import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhotoIcon,
  TruckIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  ClockIcon as ClockSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid';
import customerIssueService, { type IssueDetailData } from '../../../services/customerIssueService';

interface IssueDetailScreenProps {
  issueId: string;
  onBack: () => void;
}

const IssueDetailScreen: React.FC<IssueDetailScreenProps> = ({ issueId, onBack }) => {
  const [issue, setIssue] = useState<IssueDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssueDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!issueId) {
        throw new Error('Issue ID is required');
      }

      // ✅ Use customerIssueService instead of fetch
      const result = await customerIssueService.getIssueDetail(issueId);
      console.log('📊 Issue detail response:', result);

      setIssue(result.data);

    } catch (err) {
      console.error('❌ Error fetching issue detail:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết sự cố');
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchIssueDetail();
  }, [issueId, fetchIssueDetail]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ExclamationTriangleSolidIcon className="w-6 h-6 text-red-500" />;
      case 'IN_PROGRESS':
        return <ClockSolidIcon className="w-6 h-6 text-yellow-500" />;
      case 'RESOLVED':
        return <CheckCircleSolidIcon className="w-6 h-6 text-green-500" />;
      default:
        return <ClockSolidIcon className="w-6 h-6 text-gray-500" />;
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải chi tiết sự cố...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchIssueDetail()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-4"
          >
            Thử lại
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Không tìm thấy sự cố</p>
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Chi Tiết Sự Cố</h1>
              <p className="text-gray-600 text-sm">Thông tin chi tiết và tiến độ xử lý</p>
            </div>
          </div>
        </div>

        {/* Status Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{issue.title}</h2>
            <div className="flex items-center gap-3">
              {getStatusIcon(issue.status)}
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(issue.status)}`}>
                {getStatusText(issue.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(issue.priority)}`}>
                {getPriorityText(issue.priority)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div><strong>Thời gian báo cáo:</strong> {new Date(issue.createdAt).toLocaleString('vi-VN')}</div>
            <div><strong>Cập nhật gần nhất:</strong> {new Date(issue.updatedAt).toLocaleString('vi-VN')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Issue Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              Thông Tin Báo Cáo
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sự cố:</label>
                <p className="text-gray-900 leading-relaxed">{issue.description}</p>
              </div>
            </div>

            {/* Issue Photos */}
            {issue.photos && issue.photos.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <PhotoIcon className="w-4 h-4" />
                  Ảnh báo cáo ({issue.photos.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {issue.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Issue photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => window.open(photo, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Info */}
          {issue.vehicle_id && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TruckIcon className="w-5 h-5" />
                Thông Tin Xe
              </h3>
              <div className="flex items-start gap-4">
                {issue.vehicle_id.image && (
                  <img 
                    src={issue.vehicle_id.image} 
                    alt={issue.vehicle_id.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-gray-900">{issue.vehicle_id.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div><strong>Biển số:</strong> {issue.vehicle_id.licensePlate}</div>
                    <div><strong>Loại xe:</strong> {issue.vehicle_id.type}</div>
                    <div><strong>Năm sản xuất:</strong> {issue.vehicle_id.year}</div>
                    <div><strong>Số chỗ ngồi:</strong> {issue.vehicle_id.seats}</div>
                    <div><strong>Pin:</strong> {issue.vehicle_id.battery_kWh}kWh</div>
                    <div><strong>Tầm hoạt động:</strong> {issue.vehicle_id.range}km</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Station Info */}
          {issue.station_id && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                Thông Tin Trạm
              </h3>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">{issue.station_id.name}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Địa chỉ:</strong> {issue.station_id.address}</div>
                  <div><strong>Thành phố:</strong> {issue.station_id.city}</div>
                  {issue.station_id.contact_info?.phone && (
                    <div><strong>Điện thoại:</strong> {issue.station_id.contact_info.phone}</div>
                  )}
                  {issue.station_id.contact_info?.email && (
                    <div><strong>Email:</strong> {issue.station_id.contact_info.email}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Rental Info */}
          {/* {issue.rental_id && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Thông Tin Chuyến Thuê
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong className="text-gray-700">Trạng thái:</strong>
                    <div className="mt-1">{issue.rental_id.status}</div>
                  </div>
                  <div>
                    <strong className="text-gray-700">Tổng tiền:</strong>
                    <div className="mt-1 font-semibold text-green-600">
                      {formatCurrency(issue.rental_id.pricing_snapshot?.total_price || 0)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <strong className="text-gray-700">Thời gian lấy xe:</strong>
                  <div className="mt-1">{new Date(issue.rental_id.pickup.datetime).toLocaleString('vi-VN')}</div>
                  <div className="text-gray-600">{issue.rental_id.pickup.location}</div>
                </div>
                
                <div>
                  <strong className="text-gray-700">Thời gian trả xe:</strong>
                  <div className="mt-1">{new Date(issue.rental_id.return.datetime).toLocaleString('vi-VN')}</div>
                  <div className="text-gray-600">{issue.rental_id.return.location}</div>
                </div>
              </div>
            </div>
          )} */}

          {/* Assigned Staff */}
          {issue.assigned_to && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Nhân Viên Phụ Trách
              </h3>
              <div className="space-y-2 text-sm">
                <div><strong className="text-gray-700">Tên:</strong> {issue.assigned_to.name}</div>
                <div><strong className="text-gray-700">Email:</strong> {issue.assigned_to.email}</div>
                <div><strong className="text-gray-700">Vai trò:</strong> {issue.assigned_to.role}</div>
              </div>
            </div>
          )}

          {/* Resolution/Solution */}
          {issue.resolution && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                Phương Án Giải Quyết
              </h3>
              
              <div className="space-y-4">
                {/* Solution Description */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mô Tả Giải Pháp</h4>
                  <p className="text-gray-700 leading-relaxed">{issue.resolution.solution_description}</p>
                </div>

                {/* Resolution Actions */}
                {issue.resolution.resolution_actions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Các Hành Động Đã Thực Hiện</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {issue.resolution.resolution_actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resolution Notes */}
                {issue.resolution.resolution_notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ghi Chú Từ Nhân Viên</h4>
                    <p className="text-gray-700 leading-relaxed">{issue.resolution.resolution_notes}</p>
                  </div>
                )}

                {/* Resolution Photos */}
                {issue.resolution.resolution_photos && issue.resolution.resolution_photos.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ảnh Minh Chứng Đã Sửa</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {issue.resolution.resolution_photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={photo} 
                            alt={`Resolution photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-green-300 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => window.open(photo, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution Details */}
                <div className="border-t border-green-300 pt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    {/* <div><strong>Nhân viên giải quyết:</strong> {issue.resolution.resolved_by?.name}</div> */}
                    <div><strong>Thời gian hoàn thành:</strong> {new Date(issue.updatedAt).toLocaleString('vi-VN')}</div>
                  </div>
                  
                  {issue.resolution.actual_cost > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Chi phí ước tính:</strong> {formatCurrency(issue.resolution.estimated_cost)}</div>
                      <div><strong>Chi phí thực tế:</strong> {formatCurrency(issue.resolution.actual_cost)}</div>
                    </div>
                  )}
                  
                  {issue.resolution.follow_up_required && (
                    <div className="text-orange-600">
                      <strong>⚠️ Cần theo dõi thêm</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Quay Lại Danh Sách
        </button>
      </div>
    </div>
  );
};

export default IssueDetailScreen;