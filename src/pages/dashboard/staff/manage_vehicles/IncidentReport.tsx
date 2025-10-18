import React, { useState } from 'react';
import {
  ExclamationTriangleIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  ClockIcon as ClockSolidIcon
} from '@heroicons/react/24/solid';

interface Incident {
  id: string;
  vehicleId: string;
  vehicleModel: string;
  licensePlate: string;
  reportedBy: string;
  reportedAt: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'in-progress' | 'resolved' | 'rejected';
  assignedTo?: string;
  resolvedAt?: string;
  resolution?: string;
  images: string[];
  position: string;
}

const mockIncidents: Incident[] = [
  {
    id: 'INC001',
    vehicleId: 'EV001',
    vehicleModel: 'Tesla Model 3',
    licensePlate: '30A-12345',
    reportedBy: 'Nguyễn Văn A',
    reportedAt: '2024-10-14 09:30',
    title: 'Đèn pha trái không hoạt động',
    description: 'Đèn pha bên trái xe Tesla không sáng khi bật đèn. Cần kiểm tra và thay thế bóng đèn.',
    severity: 'medium',
    status: 'in-progress',
    assignedTo: 'Kỹ thuật viên Trần B',
    images: ['https://via.placeholder.com/200x150?text=Headlight'],
    position: 'Vị trí 1'
  },
  {
    id: 'INC002',
    vehicleId: 'EV003',
    vehicleModel: 'BYD Seal',
    licensePlate: '30C-11111',
    reportedBy: 'Lê Thị C',
    reportedAt: '2024-10-13 15:45',
    title: 'Tiếng ồn lạ từ động cơ',
    description: 'Xe phát ra tiếng ồn lạ khi khởi động và di chuyển. Có thể là vấn đề với động cơ điện.',
    severity: 'high',
    status: 'resolved',
    assignedTo: 'Kỹ thuật viên Phạm D',
    resolvedAt: '2024-10-14 08:00',
    resolution: 'Đã kiểm tra và bôi trơn các bộ phận chuyển động. Tiếng ồn đã được khắc phục.',
    images: ['https://via.placeholder.com/200x150?text=Engine'],
    position: 'Vị trí 5'
  },
  {
    id: 'INC003',
    vehicleId: 'EV002',
    vehicleModel: 'VinFast VF8',
    licensePlate: '30B-67890',
    reportedBy: 'Hoàng Văn E',
    reportedAt: '2024-10-14 11:20',
    title: 'Cửa xe không khóa được',
    description: 'Cửa xe bên phải không thể khóa bằng remote. Khách hàng phải khóa thủ công.',
    severity: 'low',
    status: 'reported',
    images: [],
    position: 'Vị trí 3'
  }
];

const IncidentReport: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // New incident form state
  const [newIncident, setNewIncident] = useState({
    vehicleId: '',
    vehicleModel: '',
    licensePlate: '',
    title: '',
    description: '',
    severity: 'medium' as const,
    position: '',
    images: [] as string[]
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reported': return <ClockSolidIcon className="w-4 h-4 text-gray-500" />;
      case 'in-progress': return <ClockSolidIcon className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircleSolidIcon className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XMarkIcon className="w-4 h-4 text-red-500" />;
      default: return <ClockSolidIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return 'Thấp';
      case 'medium': return 'Trung bình';
      case 'high': return 'Cao';
      case 'critical': return 'Nghiêm trọng';
      default: return 'Không xác định';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reported': return 'Đã báo cáo';
      case 'in-progress': return 'Đang xử lý';
      case 'resolved': return 'Đã giải quyết';
      case 'rejected': return 'Từ chối';
      default: return 'Không xác định';
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    
    const incident: Incident = {
      id: `INC${String(incidents.length + 1).padStart(3, '0')}`,
      vehicleId: newIncident.vehicleId || 'EV999',
      vehicleModel: newIncident.vehicleModel || 'Unknown',
      licensePlate: newIncident.licensePlate || 'Unknown',
      reportedBy: 'Nhân viên hiện tại',
      reportedAt: new Date().toLocaleString('vi-VN'),
      title: newIncident.title,
      description: newIncident.description,
      severity: newIncident.severity,
      status: 'reported',
      images: newIncident.images,
      position: newIncident.position
    };

    setIncidents([incident, ...incidents]);
    setNewIncident({
      vehicleId: '',
      vehicleModel: '',
      licensePlate: '',
      title: '',
      description: '',
      severity: 'medium',
      position: '',
      images: []
    });
    setShowReportForm(false);
  };

  const updateIncidentStatus = (incidentId: string, newStatus: Incident['status']) => {
    setIncidents(incidents.map(incident => {
      if (incident.id === incidentId) {
        return {
          ...incident,
          status: newStatus,
          resolvedAt: newStatus === 'resolved' ? new Date().toLocaleString('vi-VN') : incident.resolvedAt
        };
      }
      return incident;
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">Báo cáo sự cố</h1>
            </div>
            <p className="text-gray-600">
              Quản lý và theo dõi các sự cố của xe tại các điểm
            </p>
          </div>
          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Báo cáo sự cố
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sự cố, xe, người báo cáo..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="reported">Đã báo cáo</option>
              <option value="in-progress">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="rejected">Từ chối</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
              <option value="critical">Nghiêm trọng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng sự cố</p>
              <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-blue-600">
                {incidents.filter(i => i.status === 'in-progress').length}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
              <p className="text-2xl font-bold text-green-600">
                {incidents.filter(i => i.status === 'resolved').length}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nghiêm trọng</p>
              <p className="text-2xl font-bold text-red-600">
                {incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length}
              </p>
            </div>
            <ExclamationTriangleSolidIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Danh sách sự cố ({filteredIncidents.length})
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {filteredIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                      selectedIncident?.id === incident.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(incident.status)}
                          <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(incident.severity)}`}>
                            {getSeverityText(incident.severity)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(incident.status)}`}>
                            {getStatusText(incident.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                          <div>Xe: <span className="font-medium text-gray-900">{incident.vehicleModel} - {incident.licensePlate}</span></div>
                          <div>Người báo cáo: <span className="font-medium text-gray-900">{incident.reportedBy}</span></div>
                          <div>Thời gian: <span className="font-medium text-gray-900">{incident.reportedAt}</span></div>
                          <div>Vị trí: <span className="font-medium text-gray-900">{incident.position}</span></div>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">{incident.description}</p>
                      </div>
                    </div>

                    {/* Quick Actions for staff */}
                    {incident.status === 'reported' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateIncidentStatus(incident.id, 'in-progress');
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Bắt đầu xử lý
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateIncidentStatus(incident.id, 'rejected');
                          }}
                          className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}

                    {incident.status === 'in-progress' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateIncidentStatus(incident.id, 'resolved');
                          }}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Đánh dấu hoàn thành
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredIncidents.length === 0 && (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Không tìm thấy sự cố nào phù hợp với bộ lọc.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Incident Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
            {selectedIncident ? (
              <>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Chi tiết sự cố</h3>
                  <p className="text-sm text-gray-600">{selectedIncident.id}</p>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{selectedIncident.title}</h4>
                    <p className="text-sm text-gray-600">{selectedIncident.description}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Xe:</span>
                      <span className="font-medium">{selectedIncident.vehicleModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biển số:</span>
                      <span className="font-medium">{selectedIncident.licensePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Người báo cáo:</span>
                      <span className="font-medium">{selectedIncident.reportedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian báo cáo:</span>
                      <span className="font-medium">{selectedIncident.reportedAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vị trí:</span>
                      <span className="font-medium">{selectedIncident.position}</span>
                    </div>
                    {selectedIncident.assignedTo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phụ trách:</span>
                        <span className="font-medium">{selectedIncident.assignedTo}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(selectedIncident.severity)}`}>
                      {getSeverityText(selectedIncident.severity)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedIncident.status)}`}>
                      {getStatusText(selectedIncident.status)}
                    </span>
                  </div>

                  {selectedIncident.images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Hình ảnh</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedIncident.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Incident ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedIncident.resolution && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Giải pháp</h4>
                      <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">{selectedIncident.resolution}</p>
                      {selectedIncident.resolvedAt && (
                        <p className="text-xs text-gray-500 mt-1">Giải quyết lúc: {selectedIncident.resolvedAt}</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Chọn một sự cố để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Báo cáo sự cố mới</h3>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model xe
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newIncident.vehicleModel}
                    onChange={(e) => setNewIncident({ ...newIncident, vehicleModel: e.target.value })}
                    placeholder="VD: Tesla Model 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biển số xe
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newIncident.licensePlate}
                    onChange={(e) => setNewIncident({ ...newIncident, licensePlate: e.target.value })}
                    placeholder="VD: 30A-12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề sự cố
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  placeholder="Mô tả ngắn gọn về sự cố"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="Mô tả chi tiết về sự cố, triệu chứng, thời điểm xảy ra..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức độ nghiêm trọng
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value as any })}
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="critical">Nghiêm trọng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vị trí
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newIncident.position}
                    onChange={(e) => setNewIncident({ ...newIncident, position: e.target.value })}
                    placeholder="VD: Trạm A - Vị trí 1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Gửi báo cáo
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentReport;  