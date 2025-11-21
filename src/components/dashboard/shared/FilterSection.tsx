import React from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSectionProps {
  title: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  statusOptions: FilterOption[];
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  stationFilter: string;
  onStationFilterChange: (value: string) => void;
  stations: string[];
  resultCount: number;
  color?: "blue" | "red";
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  resultCount,
  color = "blue",
}) => {
  const colorClasses = {
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      text: "text-blue-900",
      button: "bg-blue-500 hover:bg-blue-600",
      focus: "focus:border-blue-400 focus:ring-blue-200",
    },
    red: {
      border: "border-red-200",
      bg: "bg-red-50",
      text: "text-red-900",
      button: "bg-red-500 hover:bg-red-600",
      focus: "focus:border-red-400 focus:ring-red-200",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${colors.border} border p-6`}
    >
      <div className="flex items-center mb-6">
        <FunnelIcon className={`w-5 h-5 ${colors.text} mr-2`} />
        <h2 className={`text-lg font-semibold ${colors.text}`}>{title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${colors.border} rounded-md ${colors.focus} focus:outline-none focus:ring-2`}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className={`w-full px-3 py-2 border ${colors.border} rounded-md ${colors.focus} focus:outline-none focus:ring-2`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian
          </label>
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className={`w-full px-3 py-2 border ${colors.border} rounded-md ${colors.focus} focus:outline-none focus:ring-2`}
          >
            <option value="all">Tất cả</option>
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
          </select>
        </div> */}

        {/* Station Filter */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạm
          </label>
          <select
            value={stationFilter}
            onChange={(e) => onStationFilterChange(e.target.value)}
            className={`w-full px-3 py-2 border ${colors.border} rounded-md ${colors.focus} focus:outline-none focus:ring-2`}
          >
            <option value="all">Tất cả trạm</option>
            {stations.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>
        </div> */}
      </div>

      {/* Results and Actions */}
      <div
        className={`mt-6 flex justify-between items-center p-4 ${colors.bg} rounded-lg`}
      >
        <div>
          <p className={`font-medium ${colors.text}`}>
            Tìm thấy {resultCount} kết quả
          </p>
        </div>
        <div className="flex space-x-2">
          {/* <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4" />
            <span>Lọc nâng cao</span>
          </button> */}
          {/* <button
            className={`${colors.button} text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-2`}
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button> */}
        </div>
      </div>
    </div>
  );
};
