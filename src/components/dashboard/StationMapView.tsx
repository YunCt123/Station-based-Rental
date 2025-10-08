import React from "react";
import { MapPinIcon, TruckIcon } from "@heroicons/react/24/outline";

interface StationMapViewProps {
  stations: Array<{
    id: string;
    name: string;
    coordinates: { lat: number; lng: number };
    currentVehicles: number;
    capacity: number;
    demandLevel: "low" | "medium" | "high";
  }>;
  onStationSelect: (stationId: string) => void;
  selectedStation?: string;
}

export const StationMapView: React.FC<StationMapViewProps> = ({
  stations,
  onStationSelect,
  selectedStation,
}) => {
  const getDemandColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getUtilizationRate = (station: any) => {
    return (station.currentVehicles / station.capacity) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bản đồ trạm</h3>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Nhu cầu thấp</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Nhu cầu TB</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Nhu cầu cao</span>
          </div>
        </div>
      </div>

      {/* Simplified Map View - In real app, this would be an actual map */}
      <div className="relative bg-gray-100 rounded-lg h-64 overflow-hidden">
        {stations.map((station, index) => {
          const utilizationRate = getUtilizationRate(station);
          const isSelected = selectedStation === station.id;

          return (
            <div
              key={station.id}
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                isSelected ? "scale-110 z-10" : "hover:scale-105"
              }`}
              style={{
                left: `${20 + index * 15}%`,
                top: `${30 + (index % 3) * 20}%`,
              }}
              onClick={() => onStationSelect(station.id)}
            >
              <div
                className={`relative p-2 rounded-lg shadow-lg bg-white border-2 ${
                  isSelected ? "border-blue-500" : "border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-1 rounded-full ${getDemandColor(
                      station.demandLevel
                    )}`}
                  >
                    <MapPinIcon className="w-3 h-3 text-white" />
                  </div>
                  <div className="text-xs">
                    <div className="font-medium text-gray-900">
                      {station.name.split(" ")[1]}
                    </div>
                    <div className="text-gray-600">
                      {station.currentVehicles}/{station.capacity}
                    </div>
                  </div>
                </div>

                {/* Utilization indicator */}
                <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      utilizationRate > 90
                        ? "bg-red-600"
                        : utilizationRate > 70
                        ? "bg-yellow-600"
                        : "bg-green-600"
                    }`}
                    style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        * Nhấp vào trạm để xem chi tiết và thực hiện điều phối
      </div>
    </div>
  );
};
