import React, { useState } from "react";
import {
  TruckIcon,
  MapPinIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  MinusIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import {
  StatCard,
  AlertCard,
  ActionButton,
} from "../../../components/dashboard";

interface StationData {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  capacity: number;
  currentVehicles: number;
  available: number;
  rented: number;
  maintenance: number;
  charging: number;
  demandLevel: "low" | "medium" | "high";
  averageDailyRentals: number;
  peakHours: string[];
  batteryStatus: {
    high: number;
    medium: number;
    low: number;
  };
}

interface VehicleTransfer {
  id: string;
  fromStation: string;
  toStation: string;
  vehicleCount: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  estimatedTime: string;
  requestedAt: string;
  completedAt?: string;
}

export const VehicleDistribution: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    fromStation: "",
    toStation: "",
    vehicleCount: 1,
  });

  // Mock data - in real app, this would come from API
  const stationsData: StationData[] = [
    {
      id: "CG001",
      name: "Trạm Cầu Giấy",
      address: "Số 1 Cầu Giấy, Đống Đa, Hà Nội",
      coordinates: { lat: 21.0313, lng: 105.8278 },
      capacity: 50,
      currentVehicles: 45,
      available: 18,
      rented: 25,
      maintenance: 2,
      charging: 0,
      demandLevel: "high",
      averageDailyRentals: 35,
      peakHours: ["08:00-10:00", "17:00-19:00"],
      batteryStatus: { high: 28, medium: 12, low: 5 },
    },
    {
      id: "LC002",
      name: "Trạm Lotte Center",
      address: "54 Liễu Giai, Ba Đình, Hà Nội",
      coordinates: { lat: 21.0227, lng: 105.8194 },
      capacity: 40,
      currentVehicles: 38,
      available: 15,
      rented: 20,
      maintenance: 3,
      charging: 0,
      demandLevel: "medium",
      averageDailyRentals: 28,
      peakHours: ["09:00-11:00", "18:00-20:00"],
      batteryStatus: { high: 22, medium: 10, low: 6 },
    },
    {
      id: "TC003",
      name: "Trạm Times City",
      address: "458 Minh Khai, Hai Bà Trưng, Hà Nội",
      coordinates: { lat: 20.9945, lng: 105.8709 },
      capacity: 45,
      currentVehicles: 42,
      available: 19,
      rented: 21,
      maintenance: 2,
      charging: 0,
      demandLevel: "medium",
      averageDailyRentals: 30,
      peakHours: ["08:30-10:30", "17:30-19:30"],
      batteryStatus: { high: 25, medium: 13, low: 4 },
    },
    {
      id: "HX004",
      name: "Trạm Hàng Xanh",
      address: "10 Hàng Xanh, Hoàn Kiếm, Hà Nội",
      coordinates: { lat: 21.0245, lng: 105.8412 },
      capacity: 35,
      currentVehicles: 35,
      available: 12,
      rented: 20,
      maintenance: 3,
      charging: 0,
      demandLevel: "high",
      averageDailyRentals: 32,
      peakHours: ["07:30-09:30", "16:30-18:30"],
      batteryStatus: { high: 18, medium: 12, low: 5 },
    },
    {
      id: "LM005",
      name: "Trạm Landmark 81",
      address: "720A Điện Biên Phủ, Bình Thạnh, TP.HCM",
      coordinates: { lat: 10.7955, lng: 106.7212 },
      capacity: 60,
      currentVehicles: 32,
      available: 16,
      rented: 14,
      maintenance: 2,
      charging: 0,
      demandLevel: "low",
      averageDailyRentals: 18,
      peakHours: ["09:00-11:00", "19:00-21:00"],
      batteryStatus: { high: 20, medium: 8, low: 4 },
    },
    {
      id: "VC006",
      name: "Trạm Vincom Center",
      address: "72 Lê Thánh Tôn, Quận 1, TP.HCM",
      coordinates: { lat: 10.7769, lng: 106.7009 },
      capacity: 55,
      currentVehicles: 47,
      available: 21,
      rented: 24,
      maintenance: 2,
      charging: 0,
      demandLevel: "medium",
      averageDailyRentals: 26,
      peakHours: ["08:00-10:00", "18:00-20:00"],
      batteryStatus: { high: 30, medium: 12, low: 5 },
    },
  ];

  const recentTransfers: VehicleTransfer[] = [
    {
      id: "T001",
      fromStation: "Trạm Landmark 81",
      toStation: "Trạm Cầu Giấy",
      vehicleCount: 5,
      status: "completed",
      estimatedTime: "2 giờ",
      requestedAt: "2 giờ trước",
      completedAt: "30 phút trước",
    },
    {
      id: "T002",
      fromStation: "Trạm Vincom Center",
      toStation: "Trạm Hàng Xanh",
      vehicleCount: 3,
      status: "in_progress",
      estimatedTime: "1.5 giờ",
      requestedAt: "45 phút trước",
    },
    {
      id: "T003",
      fromStation: "Trạm Times City",
      toStation: "Trạm Lotte Center",
      vehicleCount: 2,
      status: "pending",
      estimatedTime: "1 giờ",
      requestedAt: "15 phút trước",
    },
  ];

  const getDemandColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getDemandText = (level: string) => {
    switch (level) {
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

  const getUtilizationRate = (station: StationData) => {
    return ((station.currentVehicles / station.capacity) * 100).toFixed(1);
  };

  const getOccupancyRate = (station: StationData) => {
    return ((station.rented / station.currentVehicles) * 100).toFixed(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in_progress":
        return "Đang thực hiện";
      case "pending":
        return "Chờ xử lý";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const handleTransferVehicles = () => {
    console.log("Transfer vehicles:", transferData);
    setTransferModalOpen(false);
    setTransferData({ fromStation: "", toStation: "", vehicleCount: 1 });
  };

  const totalVehicles = stationsData.reduce(
    (sum, station) => sum + station.currentVehicles,
    0
  );
  const totalCapacity = stationsData.reduce(
    (sum, station) => sum + station.capacity,
    0
  );
  const averageUtilization = ((totalVehicles / totalCapacity) * 100).toFixed(1);

  const highDemandStations = stationsData.filter(
    (s) => s.demandLevel === "high"
  ).length;
  const lowUtilizationStations = stationsData.filter(
    (s) => s.currentVehicles / s.capacity < 0.6
  ).length;
  const overCapacityStations = stationsData.filter(
    (s) => s.currentVehicles / s.capacity > 0.9
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Phân bổ xe theo điểm
          </h1>
          <p className="text-gray-600">
            Quản lý và điều phối xe giữa các trạm thuê
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTransferModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <ArrowsRightLeftIcon className="w-4 h-4" />
            <span>Điều phối xe</span>
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ClockIcon className="w-4 h-4" />
            <span>Cập nhật lúc: {new Date().toLocaleTimeString("vi-VN")}</span>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng số xe"
          value={totalVehicles}
          icon={TruckIcon}
          bgColor="bg-blue-500"
          trendValue="+2% từ tuần trước"
          trend="up"
        />
        <StatCard
          title="Tỷ lệ sử dụng trung bình"
          value={`${averageUtilization}%`}
          icon={AdjustmentsHorizontalIcon}
          bgColor="bg-green-500"
          trendValue="+5% từ tuần trước"
          trend="up"
        />
        <StatCard
          title="Trạm nhu cầu cao"
          value={highDemandStations}
          icon={ExclamationTriangleIcon}
          bgColor="bg-red-500"
          trendValue="Không đổi"
          trend="stable"
        />
        <StatCard
          title="Trạm cần bổ sung"
          value={lowUtilizationStations}
          icon={PlusIcon}
          bgColor="bg-yellow-500"
          trendValue="-1 từ tuần trước"
          trend="down"
        />
      </div>

      {/* Distribution Overview & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Station Distribution Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Phân bổ xe theo trạm
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sức chứa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hiện có
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ lệ sử dụng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhu cầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thuê TB/ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stationsData.map((station) => {
                  const utilizationRate = parseFloat(
                    getUtilizationRate(station)
                  );
                  const occupancyRate = parseFloat(getOccupancyRate(station));

                  return (
                    <tr
                      key={station.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedStation === station.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() =>
                        setSelectedStation(
                          selectedStation === station.id ? null : station.id
                        )
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPinIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {station.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {station.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {station.capacity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">
                            {station.currentVehicles}
                          </span>
                          <div className="flex space-x-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              {station.available}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {station.rented}
                            </span>
                            {station.maintenance > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                {station.maintenance}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2 min-w-[60px]">
                            <div
                              className={`h-2 rounded-full ${
                                utilizationRate > 90
                                  ? "bg-red-600"
                                  : utilizationRate > 70
                                  ? "bg-yellow-600"
                                  : "bg-green-600"
                              }`}
                              style={{
                                width: `${Math.min(utilizationRate, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 min-w-[40px]">
                            {utilizationRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDemandColor(
                            station.demandLevel
                          )}`}
                        >
                          {getDemandText(station.demandLevel)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {station.averageDailyRentals}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTransferData({
                                ...transferData,
                                fromStation: station.name,
                              });
                              setTransferModalOpen(true);
                            }}
                          >
                            Điều phối
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("View station details:", station.id);
                            }}
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts and Recommendations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cảnh báo & Đề xuất
          </h3>
          <div className="space-y-3">
            <AlertCard
              type="error"
              title="Trạm quá tải"
              message="Trạm Cầu Giấy đạt 90% sức chứa"
              icon={ExclamationTriangleIcon}
              action={{
                label: "Điều phối ngay",
                onClick: () => console.log("Redistribute from Cau Giay"),
              }}
            />
            <AlertCard
              type="warning"
              title="Nhu cầu cao"
              message="Trạm Hàng Xanh cần thêm xe"
              icon={TruckIcon}
              action={{
                label: "Bổ sung xe",
                onClick: () => console.log("Add vehicles to Hang Xanh"),
              }}
            />
            <AlertCard
              type="info"
              title="Cơ hội tối ưu"
              message="Landmark 81 có thể chuyển 10 xe"
              icon={ArrowRightIcon}
              action={{
                label: "Xem đề xuất",
                onClick: () => console.log("View optimization suggestions"),
              }}
            />
            <AlertCard
              type="success"
              title="Phân bổ tốt"
              message="Times City đạt tỷ lệ tối ưu"
              icon={CheckCircleIcon}
            />
          </div>
        </div>
      </div>

      {/* Station Details Panel */}
      {selectedStation && (
        <div className="bg-white rounded-lg shadow p-6">
          {(() => {
            const station = stationsData.find((s) => s.id === selectedStation);
            if (!station) return null;

            return (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Chi tiết trạm: {station.name}
                  </h3>
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Thông tin cơ bản
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Địa chỉ:</span>
                        <span className="text-gray-900">{station.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sức chứa:</span>
                        <span className="text-gray-900">
                          {station.capacity} xe
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hiện có:</span>
                        <span className="text-gray-900">
                          {station.currentVehicles} xe
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tỷ lệ sử dụng:</span>
                        <span className="text-gray-900">
                          {getUtilizationRate(station)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Trạng thái xe
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Có sẵn:</span>
                        <span className="text-green-600 font-medium">
                          {station.available}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đang thuê:</span>
                        <span className="text-blue-600 font-medium">
                          {station.rented}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bảo trì:</span>
                        <span className="text-yellow-600 font-medium">
                          {station.maintenance}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đang sạc:</span>
                        <span className="text-purple-600 font-medium">
                          {station.charging}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Hiệu suất
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">TB thuê/ngày:</span>
                        <span className="text-gray-900">
                          {station.averageDailyRentals}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nhu cầu:</span>
                        <span
                          className={`font-medium ${getDemandColor(
                            station.demandLevel
                          )
                            .replace("bg-", "")
                            .replace("100", "600")}`}
                        >
                          {getDemandText(station.demandLevel)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giờ cao điểm:</span>
                        <span className="text-gray-900">
                          {station.peakHours.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Recent Transfers */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Lịch sử điều phối gần đây
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Từ trạm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đến trạm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số xe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian dự kiến
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yêu cầu lúc
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transfer.fromStation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transfer.toStation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transfer.vehicleCount} xe
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        transfer.status
                      )}`}
                    >
                      {getStatusText(transfer.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transfer.estimatedTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transfer.requestedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ActionButton
            icon={ArrowsRightLeftIcon}
            label="Điều phối xe"
            onClick={() => setTransferModalOpen(true)}
            color="text-blue-600"
          />
          <ActionButton
            icon={AdjustmentsHorizontalIcon}
            label="Tối ưu hóa tự động"
            onClick={() => console.log("Auto optimization")}
            color="text-green-600"
          />
          <ActionButton
            icon={MapPinIcon}
            label="Bản đồ trạm"
            onClick={() => console.log("View station map")}
            color="text-purple-600"
          />
          <ActionButton
            icon={TruckIcon}
            label="Báo cáo phân bổ"
            onClick={() => console.log("Distribution report")}
            color="text-orange-600"
          />
        </div>
      </div>

      {/* Transfer Modal */}
      {transferModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Điều phối xe giữa các trạm
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Từ trạm
                  </label>
                  <select
                    value={transferData.fromStation}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        fromStation: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Chọn trạm nguồn</option>
                    {stationsData.map((station) => (
                      <option key={station.id} value={station.name}>
                        {station.name} ({station.currentVehicles} xe)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đến trạm
                  </label>
                  <select
                    value={transferData.toStation}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        toStation: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Chọn trạm đích</option>
                    {stationsData.map((station) => (
                      <option key={station.id} value={station.name}>
                        {station.name} (
                        {station.capacity - station.currentVehicles} chỗ trống)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng xe
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={transferData.vehicleCount}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        vehicleCount: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 mt-4 border-t">
                <button
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleTransferVehicles}
                  disabled={
                    !transferData.fromStation || !transferData.toStation
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xác nhận điều phối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
