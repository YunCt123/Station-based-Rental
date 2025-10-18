import React, { useState, useMemo } from "react";
import {
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import {
  PageHeader,
  type FilterOption,
} from "../../../../components/dashboard/shared";
import type { StaffMember, Schedule } from "../../../../types/admin";

export const StaffSchedule: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState("this_week");
  const [selectedStation, setSelectedStation] = useState("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Mock data
  const staffMembers: StaffMember[] = useMemo(
    () => [
      {
        id: "ST001",
        name: "Nguyễn Văn An",
        position: "Trưởng ca",
        station: "Trạm Cầu Giấy",
        avatar: "/avatars/avatar1.jpg",
        phone: "0901234567",
        email: "an.nguyen@company.com",
        status: "active",
      },
      {
        id: "ST002",
        name: "Trần Thị Bình",
        position: "Nhân viên",
        station: "Trạm Hàng Xanh",
        avatar: "/avatars/avatar2.jpg",
        phone: "0912345678",
        email: "binh.tran@company.com",
        status: "active",
      },
      {
        id: "ST003",
        name: "Lê Văn Cường",
        position: "Kỹ thuật viên",
        station: "Trạm Lotte Center",
        avatar: "/avatars/avatar3.jpg",
        phone: "0923456789",
        email: "cuong.le@company.com",
        status: "on_leave",
      },
    ],
    []
  );

  const schedules: Schedule[] = useMemo(
    () => [
      {
        id: "SCH001",
        staffId: "ST001",
        date: "2024-10-18",
        shift: "morning",
        startTime: "06:00",
        endTime: "14:00",
        status: "completed",
        station: "Trạm Cầu Giấy",
        tasks: ["Kiểm tra xe", "Giao xe khách hàng", "Báo cáo ca"],
      },
      {
        id: "SCH002",
        staffId: "ST002",
        date: "2024-10-18",
        shift: "afternoon",
        startTime: "14:00",
        endTime: "22:00",
        status: "scheduled",
        station: "Trạm Hàng Xanh",
        tasks: ["Nhận xe", "Vệ sinh xe", "Kiểm tra kỹ thuật"],
        overtime: 2,
      },
    ],
    []
  );

  // Filter options
  const weekOptions: FilterOption[] = [
    { label: "Tuần này", value: "this_week" },
    { label: "Tuần trước", value: "last_week" },
    { label: "Tuần tới", value: "next_week" },
  ];

  const stationOptions: FilterOption[] = [
    { label: "Tất cả trạm", value: "all" },
    { label: "Trạm Cầu Giấy", value: "station_1" },
    { label: "Trạm Hàng Xanh", value: "station_2" },
    { label: "Trạm Lotte Center", value: "station_3" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "scheduled":
        return "text-blue-600 bg-blue-100";
      case "absent":
        return "text-red-600 bg-red-100";
      case "late":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "scheduled":
        return "Đã lên lịch";
      case "absent":
        return "Vắng mặt";
      case "late":
        return "Đi trễ";
      default:
        return "Không xác định";
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "morning":
        return "bg-yellow-100 text-yellow-800";
      case "afternoon":
        return "bg-blue-100 text-blue-800";
      case "night":
        return "bg-purple-100 text-purple-800";
      case "full_day":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShiftText = (shift: string) => {
    switch (shift) {
      case "morning":
        return "Ca sáng";
      case "afternoon":
        return "Ca chiều";
      case "night":
        return "Ca đêm";
      case "full_day":
        return "Ca ngày";
      default:
        return "Không xác định";
    }
  };

  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, "0")}:00`
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Lịch Làm Việc Nhân Viên"
        subtitle="Quản lý lịch trình và ca làm việc của toàn bộ nhân viên"
        icon={<CalendarDaysIcon className="w-6 h-6" />}
        color="blue"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng nhân viên
              </p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Có mặt hôm nay
              </p>
              <p className="text-2xl font-bold text-gray-900">22</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircleIcon className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vắng mặt</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tăng ca</p>
              <p className="text-2xl font-bold text-gray-900">8h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Mode */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Bộ lọc lịch trình
            </h3>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {weekOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {stationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "calendar"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Lịch
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Danh sách
              </button>
            </div>

            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Thêm ca</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">
              Lịch tuần từ 14/10 - 20/10/2024
            </h3>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 min-w-full">
              {/* Header */}
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">Giờ</span>
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 p-3 border-b border-gray-200 text-center"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {day}
                  </span>
                </div>
              ))}

              {/* Time slots */}
              {hours.slice(6, 23).map((hour) => (
                <React.Fragment key={hour}>
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <span className="text-xs text-gray-600">{hour}</span>
                  </div>
                  {days.map((day, dayIndex) => (
                    <div
                      key={`${hour}-${day}`}
                      className="p-1 border-b border-gray-200 h-16 relative"
                    >
                      {/* Schedule blocks */}
                      {schedules
                        .filter((schedule) => {
                          const scheduleHour = parseInt(
                            schedule.startTime.split(":")[0]
                          );
                          const currentHour = parseInt(hour.split(":")[0]);
                          return scheduleHour === currentHour && dayIndex === 0; // Mock: only show on Monday
                        })
                        .map((schedule) => {
                          const staff = staffMembers.find(
                            (s) => s.id === schedule.staffId
                          );
                          return (
                            <div
                              key={schedule.id}
                              className={`absolute inset-1 rounded text-xs p-1 ${getShiftColor(
                                schedule.shift
                              )} cursor-pointer hover:shadow-md transition-shadow`}
                            >
                              <div className="font-medium">{staff?.name}</div>
                              <div className="text-xs opacity-80">
                                {getShiftText(schedule.shift)}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">
              Danh sách lịch trình ({schedules.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ca làm việc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhiệm vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => {
                  const staff = staffMembers.find(
                    (s) => s.id === schedule.staffId
                  );
                  return (
                    <tr key={schedule.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                              {staff?.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {staff?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {staff?.position}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShiftColor(
                              schedule.shift
                            )}`}
                          >
                            {getShiftText(schedule.shift)}
                          </span>
                          <div className="text-sm text-gray-600 mt-1">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          {schedule.overtime && (
                            <div className="text-xs text-orange-600 font-medium">
                              Tăng ca: +{schedule.overtime}h
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.station}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            schedule.status
                          )}`}
                        >
                          {getStatusText(schedule.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {schedule.tasks.slice(0, 2).map((task, index) => (
                            <div
                              key={index}
                              className="text-xs text-gray-600 bg-gray-100 rounded px-2 py-1 inline-block mr-1"
                            >
                              {task}
                            </div>
                          ))}
                          {schedule.tasks.length > 2 && (
                            <div className="text-xs text-blue-600 font-medium">
                              +{schedule.tasks.length - 2} nhiệm vụ khác
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                          <PencilIcon className="w-4 h-4" />
                          <span>Chỉnh sửa</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSchedule;
