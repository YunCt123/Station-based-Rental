import React from "react";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

interface OptimizationSuggestion {
  id: string;
  type:
    | "rebalance"
    | "increase_capacity"
    | "peak_preparation"
    | "maintenance_scheduling";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  stations: string[];
  estimatedTime: string;
  estimatedCost?: string;
}

interface OptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
  onApplySuggestion: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
}

export const OptimizationSuggestions: React.FC<
  OptimizationSuggestionsProps
> = ({ suggestions, onApplySuggestion, onDismiss }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "rebalance":
        return ExclamationTriangleIcon;
      case "increase_capacity":
        return InformationCircleIcon;
      case "peak_preparation":
        return LightBulbIcon;
      case "maintenance_scheduling":
        return CheckCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "rebalance":
        return "text-orange-600 bg-orange-100";
      case "increase_capacity":
        return "text-blue-600 bg-blue-100";
      case "peak_preparation":
        return "text-purple-600 bg-purple-100";
      case "maintenance_scheduling":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getTypeText = (type: string) => {
    switch (type) {
      case "rebalance":
        return "Cân bằng lại";
      case "increase_capacity":
        return "Tăng sức chứa";
      case "peak_preparation":
        return "Chuẩn bị cao điểm";
      case "maintenance_scheduling":
        return "Lập lịch bảo trì";
      default:
        return "Khác";
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Đề xuất tối ưu hóa
        </h3>
        <div className="text-center py-8">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Hệ thống đang hoạt động tối ưu!</p>
          <p className="text-sm text-gray-500 mt-2">
            Không có đề xuất tối ưu hóa nào cần thiết lúc này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Đề xuất tối ưu hóa
      </h3>
      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const Icon = getTypeIcon(suggestion.type);

          return (
            <div
              key={suggestion.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${getTypeColor(
                      suggestion.type
                    )}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {suggestion.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          suggestion.priority
                        )}`}
                      >
                        {getPriorityText(suggestion.priority)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getTypeText(suggestion.type)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {suggestion.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Tác động:</span>
                  <p className="text-gray-600">{suggestion.impact}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Thời gian:</span>
                  <p className="text-gray-600">{suggestion.estimatedTime}</p>
                </div>
                {suggestion.estimatedCost && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Chi phí ước tính:
                    </span>
                    <p className="text-gray-600">{suggestion.estimatedCost}</p>
                  </div>
                )}
              </div>

              {suggestion.stations.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Trạm liên quan:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestion.stations.map((station, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        {station}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={() => onDismiss(suggestion.id)}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={() => onApplySuggestion(suggestion.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                  Áp dụng đề xuất
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
