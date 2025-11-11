import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  ClockIcon as ClockSolidIcon,
} from '@heroicons/react/24/solid';
import { AddIncidentModal } from '@/components/dashboard/staff/manage_vehicles/AddIncidentModal';
import { IncidentDetailsModal } from '@/components/dashboard/staff/manage_vehicles/IncidentDetailsModal';
import { createIssue, updateIssue, getAllIssues } from '@/services/issueService';
import { toast } from 'sonner';

interface APIIssueData {
  _id?: string;
  vehicle_id?: {
    _id?: string;
    name?: string;
    model?: string;
    licensePlate?: string;
    brand?: string;
    year?: number;
  };
  reporter_id?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  station_id?: {
    _id?: string;
    name?: string;
    address?: string;
  };
  title?: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  photos?: string[];
  createdAt: string;
}

interface Incident {
  id: string;
  vehicleId: string;
  vehicleModel: string;
  licensePlate: string;
  reportedBy: string;
  reportedAt: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  images: string[];
  stationName?: string;
}

const IncidentReport: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Fetch issues on component mount
  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const issues = await getAllIssues();
      // Map API response to local Incident interface
      const mappedIncidents: Incident[] = issues.map((issue: unknown) => {
        const issueData = issue as APIIssueData;
        return {
          id: String(issueData._id || ''),
          vehicleId: String(issueData.vehicle_id?._id || 'Unknown'),
          vehicleModel: String(issueData.vehicle_id?.model || 'Unknown'),
          licensePlate: String(issueData.vehicle_id?.licensePlate || 'Unknown'), 
          reportedBy: String(issueData.reporter_id?.name || 'Unknown'),
          reportedAt: new Date(issueData.createdAt).toLocaleString('vi-VN'),
          title: String(issueData.title || 'No title'),
          description: String(issueData.description || ''),
          status: issueData.status,
          images: Array.isArray(issueData.photos) ? issueData.photos : [],
          stationName: String(issueData.station_id?.name || '')
        };
      });
      setIncidents(mappedIncidents);
    } catch (error: unknown) {
      console.error('Error fetching issues:', error);
      toast.error('Không thể tải danh sách sự cố');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <ClockSolidIcon className="w-4 h-4 text-gray-500" />;
      case 'IN_PROGRESS': return <ClockSolidIcon className="w-4 h-4 text-blue-500" />;
      case 'RESOLVED': return <CheckCircleSolidIcon className="w-4 h-4 text-green-500" />;
      default: return <ClockSolidIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Đã báo cáo';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'RESOLVED': return 'Đã giải quyết';
      default: return 'Không xác định';
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmitReport = async (incidentData: Omit<Incident, 'id' | 'reportedBy' | 'reportedAt' | 'status' | 'images'> & { images: string[] }) => {
    try {
      setLoading(true);
      const newIssue = await createIssue({
        vehicle_id: incidentData.vehicleId,
        title: incidentData.title,
        description: incidentData.description,
        photos: incidentData.images
      });

      // Map the new issue to incident format
      const issueData = newIssue as unknown as APIIssueData;
      const newIncident: Incident = {
        id: String(issueData._id || ''),
        vehicleId: String(issueData.vehicle_id?._id || incidentData.vehicleId),
        vehicleModel: String(issueData.vehicle_id?.model || incidentData.vehicleModel),
        licensePlate: String(issueData.vehicle_id?.licensePlate || incidentData.licensePlate),
        reportedBy: String(issueData.reporter_id?.name || 'Unknown'),
        reportedAt: new Date(issueData.createdAt).toLocaleString('vi-VN'),
        title: String(issueData.title || ''),
        description: String(issueData.description || ''),
        status: issueData.status,
        images: Array.isArray(issueData.photos) ? issueData.photos : [],
        stationName: String(issueData.station_id?.name || '')
      };

      setIncidents([newIncident, ...incidents]);
      setShowReportForm(false);
      toast.success('Báo cáo sự cố thành công!');
    } catch (error: unknown) {
      console.error('Error creating issue:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo báo cáo sự cố';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowDetailsModal(true);
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: Incident['status']) => {
    try {
      setLoading(true);
      await updateIssue(incidentId, { status: newStatus });
      
      // Update local state
      setIncidents(incidents.map(incident => {
        if (incident.id === incidentId) {
          return {
            ...incident,
            status: newStatus
          };
        }
        return incident;
      }));

      // Update selected incident if it's the current one
      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident({
          ...selectedIncident,
          status: newStatus
        });
      }

      toast.success('Cập nhật trạng thái thành công!');
      
      // Refresh issues list
      await fetchIssues();
    } catch (error: unknown) {
      console.error('Error updating issue status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
              <option value="OPEN">Đã báo cáo</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng sự cố</p>
              <p className="text-2xl font-bold text-gray-900">{String(incidents.length)}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-blue-600">
                {String(incidents.filter(i => i.status === 'IN_PROGRESS').length)}
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
                {String(incidents.filter(i => i.status === 'RESOLVED').length)}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Incident List - Table Layout */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách sự cố ({String(filteredIncidents.length)})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID xe / Biển số</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại xe / Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề sự cố</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người báo cáo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredIncidents.map((incident) => (
                    <tr 
                      key={incident.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{String(incident.vehicleId)}</div>
                        <div className="text-sm text-gray-500">{String(incident.licensePlate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{String(incident.vehicleModel)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{String(incident.title)}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{String(incident.description)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(incident.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(incident.status)}`}>
                            {getStatusText(incident.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{String(incident.reportedBy)}</div>
                        <div className="text-sm text-gray-500">{String(incident.stationName || 'N/A')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {String(incident.reportedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center gap-2">
                          {incident.status === 'OPEN' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateIncidentStatus(incident.id, 'IN_PROGRESS');
                              }}
                              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Bắt đầu xử lý
                            </button>
                          )}
                          {incident.status === 'IN_PROGRESS' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateIncidentStatus(incident.id, 'RESOLVED');
                              }}
                              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Hoàn thành
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewIncident(incident);
                            }}
                            className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredIncidents.length === 0 && !loading && (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Không tìm thấy sự cố nào phù hợp với bộ lọc.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Incident Modal */}
      <AddIncidentModal
        isOpen={showReportForm}
        onClose={() => setShowReportForm(false)}
        onSubmit={handleSubmitReport}
      />

      {/* Incident Details Modal */}
      {selectedIncident && (
        <IncidentDetailsModal
          incident={selectedIncident}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedIncident(null);
          }}
          onUpdateStatus={updateIncidentStatus}
        />
      )}
    </div>
  );
};

export default IncidentReport;  