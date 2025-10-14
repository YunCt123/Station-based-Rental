import React from "react";
import { ArrowRightIcon, ClockIcon } from "@heroicons/react/24/outline";

interface VehicleTransferCardProps {
  transfer: {
    id: string;
    fromStation: string;
    toStation: string;
    vehicleCount: number;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    estimatedTime: string;
    requestedAt: string;
    completedAt?: string;
  };
  onCancel?: (transferId: string) => void;
  onView?: (transferId: string) => void;
}

export const VehicleTransferCard: React.FC<VehicleTransferCardProps> = ({
  transfer,
  onCancel,
  onView,
}) => {
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

  const getProgressWidth = (status: string) => {
    switch (status) {
      case "completed":
        return "100%";
      case "in_progress":
        return "60%";
      case "pending":
        return "20%";
      case "cancelled":
        return "0%";
      default:
        return "0%";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            #{transfer.id}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              transfer.status
            )}`}
          >
            {getStatusText(transfer.status)}
          </span>
        </div>
        <div className="text-xs text-gray-500 flex items-center">
          <ClockIcon className="w-3 h-3 mr-1" />
          {transfer.requestedAt}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {transfer.fromStation}
            </div>
            <div className="text-gray-500">Trạm nguồn</div>
          </div>
          <ArrowRightIcon className="w-4 h-4 text-gray-400" />
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {transfer.toStation}
            </div>
            <div className="text-gray-500">Trạm đích</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {transfer.vehicleCount}
          </div>
          <div className="text-xs text-gray-500">xe</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Tiến độ</span>
          <span>ETA: {transfer.estimatedTime}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              transfer.status === "completed"
                ? "bg-green-600"
                : transfer.status === "in_progress"
                ? "bg-blue-600"
                : transfer.status === "pending"
                ? "bg-yellow-600"
                : "bg-gray-400"
            }`}
            style={{ width: getProgressWidth(transfer.status) }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => onView?.(transfer.id)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Xem chi tiết
        </button>
        {(transfer.status === "pending" || transfer.status === "in_progress") &&
          onCancel && (
            <button
              onClick={() => onCancel(transfer.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Hủy
            </button>
          )}
        {transfer.status === "completed" && transfer.completedAt && (
          <span className="text-xs text-green-600">
            Hoàn thành lúc: {transfer.completedAt}
          </span>
        )}
      </div>
    </div>
  );
};
