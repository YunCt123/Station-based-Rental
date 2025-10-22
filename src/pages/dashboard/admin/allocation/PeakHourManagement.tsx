import React, { useState, useMemo } from "react";
import {
  ChartBarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationCircleIcon,
  BellAlertIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  FilterSection,
  PageHeader,
  type FilterOption,
} from "../../../../components/dashboard/shared";
import type { PeakHourData, PeakHourAlert } from "../../../../types/admin";

export const PeakHourManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("today");
  const [selectedStation, setSelectedStation] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("hourly");

  // Mock data
  const peakHourData: PeakHourData[] = useMemo(
    () => [
      {
        id: "PH001",
        timeRange: "07:00-09:00",
        station: "Trạm Cầu Giấy",
        demand: 45,
        supply: 32,
        utilizationRate: 89,
        priority: "high",
        date: "2024-10-18",
        vehicleType: "Xe máy điện",
        revenue: 2850000,
        averageWaitTime: 12,
      },
      {
        id: "PH002",
        timeRange: "17:00-19:00",
        station: "Trạm Hàng Xanh",
        demand: 38,
        supply: 40,
        utilizationRate: 73,
        priority: "medium",
        date: "2024-10-18",
        vehicleType: "Ô tô điện",
        revenue: 4200000,
        averageWaitTime: 5,
      },
      {
        id: "PH003",
        timeRange: "12:00-14:00",
        station: "Trạm Lotte Center",
        demand: 28,
        supply: 15,
        utilizationRate: 95,
        priority: "high",
        date: "2024-10-18",
        vehicleType: "Xe máy điện",
        revenue: 1890000,
        averageWaitTime: 18,
      },
    ],
    []
  );

  const alerts: PeakHourAlert[] = useMemo(
    () => [
      {
        id: "ALT001",
        type: "shortage",
        station: "Trạm Cầu Giấy",
        timeRange: "07:00-09:00",
        severity: "critical",
        message: "Thiếu hụt 13 xe trong giờ cao điểm sáng",
        timestamp: "2024-10-18 07:30:00",
      },
      {
        id: "ALT002",
        type: "high_demand",
        station: "Trạm Lotte Center",
        timeRange: "12:00-14:00",
        severity: "warning",
        message: "Nhu cầu tăng 25% so với dự báo",
        timestamp: "2024-10-18 12:15:00",
      },
    ],
    []
  );

  // Filter options
  const dateOptions: FilterOption[] = [
    { label: "Hôm nay", value: "today" },
    { label: "Tuần này", value: "this_week" },
    { label: "Tháng này", value: "this_month" },
  ];

  const stationOptions: FilterOption[] = [
    { label: "Tất cả trạm", value: "all" },
    { label: "Trạm Cầu Giấy", value: "station_1" },
    { label: "Trạm Hàng Xanh", value: "station_2" },
    { label: "Trạm Lotte Center", value: "station_3" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-100 border-green-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return "Không xác định";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "info":
        return "text-blue-600 bg-blue-100 border-blue-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "shortage":
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case "overflow":
        return <ArrowTrendingUpIcon className="w-5 h-5" />;
      case "maintenance":
        return <AdjustmentsHorizontalIcon className="w-5 h-5" />;
      case "high_demand":
        return <FireIcon className="w-5 h-5" />;
      default:
        return <BellAlertIcon className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Quản Lý Giờ Cao Điểm"
        subtitle="Phân tích và tối ưu hóa nhu cầu thuê xe trong các khung giờ cao điểm"
        icon={<FireIcon className="w-6 h-6" />}
        color="red"
      />

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">
                Giờ cao điểm hiện tại
              </p>
              <p className="text-2xl font-bold">07:00-09:00</p>
              <p className="text-red-100 text-xs">Sáng rush hour</p>
            </div>
            <FireIcon className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                Tỷ lệ sử dụng trung bình
              </p>
              <p className="text-2xl font-bold">85.7%</p>
              <div className="flex items-center text-orange-100 text-xs">
                <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                +12% từ tuần trước
              </div>
            </div>
            <ChartBarIcon className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">
                Thời gian chờ TB
              </p>
              <p className="text-2xl font-bold">11.7 phút</p>
              <div className="flex items-center text-yellow-100 text-xs">
                <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                -3% từ tuần trước
              </div>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">
                Cảnh báo hoạt động
              </p>
              <p className="text-2xl font-bold">{alerts.length}</p>
              <p className="text-pink-100 text-xs">Cần xử lý ngay</p>
            </div>
            <BellAlertIcon className="w-8 h-8 text-pink-200" />
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
          <div className="flex items-center space-x-2">
            <BellAlertIcon className="w-5 h-5 text-white" />
            <h3 className="text-lg font-semibold text-white">
              Cảnh Báo Thời Gian Thực
            </h3>
            <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
              {alerts.length} cảnh báo
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 ${getSeverityColor(
                  alert.severity
                )}`}
              >
                <div className="flex-shrink-0">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {alert.station}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                    <span>Khung giờ: {alert.timeRange}</span>
                    <span
                      className={`px-2 py-1 rounded-full ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity === "critical"
                        ? "Nghiêm trọng"
                        : alert.severity === "warning"
                        ? "Cảnh báo"
                        : "Thông tin"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterSection
        title="Bộ Lọc Phân Tích"
        searchPlaceholder="Tìm theo trạm, khung giờ..."
        searchValue=""
        onSearchChange={() => {}}
        statusFilter={selectedDate}
        onStatusFilterChange={setSelectedDate}
        statusOptions={dateOptions}
        dateFilter={selectedTimeframe}
        onDateFilterChange={setSelectedTimeframe}
        stationFilter={selectedStation}
        onStationFilterChange={setSelectedStation}
        stations={stationOptions.map((opt) => opt.label)}
        resultCount={peakHourData.length}
        color="red"
      />

      {/* Peak Hours Analysis */}
      <div className="bg-white rounded-xl shadow-lg border border-orange-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">
            Phân Tích Giờ Cao Điểm
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khung giờ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cung/Cầu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ lệ sử dụng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian chờ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ưu tiên
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {peakHourData.map((data) => (
                <tr
                  key={data.id}
                  className="hover:bg-orange-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 text-orange-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {data.timeRange}
                        </div>
                        <div className="text-xs text-gray-500">
                          {data.vehicleType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {data.station}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {data.supply}/{data.demand}
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.demand > data.supply ? (
                          <span className="text-red-600 flex items-center">
                            <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                            Thiếu {data.demand - data.supply}
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center">
                            <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                            Dư {data.supply - data.demand}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {data.utilizationRate}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              data.utilizationRate > 90
                                ? "bg-red-500"
                                : data.utilizationRate > 70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${data.utilizationRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(data.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {data.averageWaitTime} phút
                    </div>
                    <div
                      className={`text-xs ${
                        data.averageWaitTime > 15
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {data.averageWaitTime > 15 ? "Chậm" : "Nhanh"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                        data.priority
                      )}`}
                    >
                      {getPriorityText(data.priority)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="bg-gradient-to-r from-pink-100 to-red-100 rounded-xl shadow-lg border border-pink-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="bg-pink-500 rounded-full p-3">
              <FireIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gợi Ý Tối Ưu Hóa
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-900">
                  Trạm Cầu Giấy - 07:00-09:00
                </h4>
                <p className="text-sm text-gray-700 mt-1">
                  Nên bổ sung thêm 15 xe máy điện để đáp ứng nhu cầu cao điểm
                  sáng. Điều chuyển từ trạm Hàng Xanh có thể giảm 70% thời gian
                  chờ.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-900">
                  Toàn hệ thống - Khung giờ trưa
                </h4>
                <p className="text-sm text-gray-700 mt-1">
                  Tăng 20% số lượng xe tại các trạm gần khu văn phòng để tối ưu
                  doanh thu giờ nghỉ trưa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeakHourManagement;
