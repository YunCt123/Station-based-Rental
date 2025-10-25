import React from "react";
import {
  TruckIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  ChartBarIcon,
  ClockIcon,
  Battery0Icon,
} from "@heroicons/react/24/outline";
import {
  StatCard,
  ProgressBar,
  AlertCard,
  ActionButton,
} from "../../../../components/dashboard";

interface VehicleStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  charging: number;
  outOfService: number;
}

interface StationFleetData {
  stationName: string;
  stationId: string;
  totalVehicles: number;
  available: number;
  rented: number;
  maintenance: number;
  batteryStatus: {
    high: number;
    medium: number;
    low: number;
  };
}

const FleetOverview: React.FC = () => {
  // Mock data - in real app, this would come from API
  const fleetStats: VehicleStats = {
    total: 247,
    available: 89,
    rented: 156,
    maintenance: 8,
    charging: 12,
    outOfService: 2,
  };

  const stationFleetData: StationFleetData[] = [
    {
      stationName: "Trạm Cầu Giấy",
      stationId: "CG001",
      totalVehicles: 45,
      available: 18,
      rented: 25,
      maintenance: 2,
      batteryStatus: { high: 28, medium: 12, low: 5 },
    },
    {
      stationName: "Trạm Lotte Center",
      stationId: "LC002",
      totalVehicles: 38,
      available: 15,
      rented: 20,
      maintenance: 3,
      batteryStatus: { high: 22, medium: 10, low: 6 },
    },
    {
      stationName: "Trạm Times City",
      stationId: "TC003",
      totalVehicles: 42,
      available: 19,
      rented: 21,
      maintenance: 2,
      batteryStatus: { high: 25, medium: 13, low: 4 },
    },
    {
      stationName: "Trạm Hàng Xanh",
      stationId: "HX004",
      totalVehicles: 35,
      available: 12,
      rented: 20,
      maintenance: 3,
      batteryStatus: { high: 18, medium: 12, low: 5 },
    },
    {
      stationName: "Trạm Landmark 81",
      stationId: "LM005",
      totalVehicles: 40,
      available: 16,
      rented: 22,
      maintenance: 2,
      batteryStatus: { high: 24, medium: 11, low: 5 },
    },
    {
      stationName: "Trạm Vincom Center",
      stationId: "VC006",
      totalVehicles: 47,
      available: 21,
      rented: 24,
      maintenance: 2,
      batteryStatus: { high: 30, medium: 12, low: 5 },
    },
  ];

  const utilizationRate = (
    (fleetStats.rented / fleetStats.total) *
    100
  ).toFixed(1);
  const availabilityRate = (
    (fleetStats.available / fleetStats.total) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan đội xe</h1>
          <p className="text-gray-600">
            Theo dõi trạng thái và phân bổ đội xe điện
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          <span>Cập nhật lúc: {new Date().toLocaleTimeString("vi-VN")}</span>
        </div>
      </div>

      {/* Fleet Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Tổng số xe"
          value={fleetStats.total}
          icon={TruckIcon}
          bgColor="bg-gray-500"
        />
        <StatCard
          title="Xe có sẵn"
          value={fleetStats.available}
          icon={TruckIcon}
          bgColor="bg-green-500"
          percentage={availabilityRate}
        />
        <StatCard
          title="Xe đang cho thuê"
          value={fleetStats.rented}
          icon={TruckIcon}
          bgColor="bg-blue-500"
          percentage={utilizationRate}
        />
        <StatCard
          title="Xe bảo trì"
          value={fleetStats.maintenance}
          icon={WrenchScrewdriverIcon}
          bgColor="bg-yellow-500"
          percentage={(
            (fleetStats.maintenance / fleetStats.total) *
            100
          ).toFixed(1)}
        />
        <StatCard
          title="Xe đang sạc"
          value={fleetStats.charging}
          icon={BoltIcon}
          bgColor="bg-purple-500"
          percentage={((fleetStats.charging / fleetStats.total) * 100).toFixed(
            1
          )}
        />
        <StatCard
          title="Xe ngừng hoạt động"
          value={fleetStats.outOfService}
          icon={ExclamationTriangleIcon}
          bgColor="bg-red-500"
          percentage={(
            (fleetStats.outOfService / fleetStats.total) *
            100
          ).toFixed(1)}
        />
      </div>

      {/* Fleet Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hiệu suất đội xe
          </h3>
          <div className="space-y-4">
            <ProgressBar
              label="Tỷ lệ sử dụng"
              value={fleetStats.rented}
              maxValue={fleetStats.total}
              color="bg-blue-600"
            />
            <ProgressBar
              label="Tỷ lệ khả dụng"
              value={fleetStats.available}
              maxValue={fleetStats.total}
              color="bg-green-600"
            />
            <ProgressBar
              label="Tỷ lệ bảo trì"
              value={fleetStats.maintenance}
              maxValue={fleetStats.total}
              color="bg-yellow-600"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Phân bổ theo trạng thái
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Có sẵn</span>
              </div>
              <span className="font-medium">{fleetStats.available} xe</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Đang cho thuê</span>
              </div>
              <span className="font-medium">{fleetStats.rented} xe</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Bảo trì</span>
              </div>
              <span className="font-medium">{fleetStats.maintenance} xe</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Đang sạc</span>
              </div>
              <span className="font-medium">{fleetStats.charging} xe</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Ngừng hoạt động</span>
              </div>
              <span className="font-medium">{fleetStats.outOfService} xe</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cảnh báo hệ thống
          </h3>
          <div className="space-y-3">
            <AlertCard
              type="warning"
              title="Pin yếu"
              message="15 xe cần sạc pin"
              icon={BoltIcon}
              action={{
                label: "Xem chi tiết",
                onClick: () => console.log("View battery details"),
              }}
            />
            <AlertCard
              type="error"
              title="Cần bảo trì"
              message="3 xe quá hạn bảo trì"
              icon={WrenchScrewdriverIcon}
              action={{
                label: "Lên lịch bảo trì",
                onClick: () => console.log("Schedule maintenance"),
              }}
            />
            <AlertCard
              type="info"
              title="Nhu cầu cao"
              message="Trạm Cầu Giấy thiếu xe"
              icon={ChartBarIcon}
              action={{
                label: "Điều phối xe",
                onClick: () => console.log("Redistribute vehicles"),
              }}
            />
          </div>
        </div>
      </div>

      {/* Station Fleet Distribution */}
      <div className="bg-white rounded-lg shadow">
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
                  Tổng xe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Có sẵn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đang thuê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bảo trì
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái pin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ lệ sử dụng
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stationFleetData.map((station) => {
                const stationUtilization = (
                  (station.rented / station.totalVehicles) *
                  100
                ).toFixed(1);
                return (
                  <tr key={station.stationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPinIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {station.stationName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {station.stationId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {station.totalVehicles}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {station.available}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {station.rented}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {station.maintenance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          <Battery0Icon className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600 ml-1">
                            {station.batteryStatus.high}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Battery0Icon className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs text-yellow-600 ml-1">
                            {station.batteryStatus.medium}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Battery0Icon className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-red-600 ml-1">
                            {station.batteryStatus.low}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2 min-w-[60px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${stationUtilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 min-w-[40px]">
                          {stationUtilization}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            icon={TruckIcon}
            label="Thêm xe mới"
            onClick={() => console.log("Add new vehicle")}
            color="text-blue-600"
          />
          <ActionButton
            icon={MapPinIcon}
            label="Điều phối xe"
            onClick={() => console.log("Redistribute vehicles")}
            color="text-green-600"
          />
          <ActionButton
            icon={WrenchScrewdriverIcon}
            label="Lên lịch bảo trì"
            onClick={() => console.log("Schedule maintenance")}
            color="text-yellow-600"
          />
          <ActionButton
            icon={ChartBarIcon}
            label="Xem báo cáo chi tiết"
            onClick={() => console.log("View detailed reports")}
            color="text-purple-600"
          />
        </div>
      </div>
    </div>
  );
};

export default FleetOverview;
