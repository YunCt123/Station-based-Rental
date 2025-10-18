import React, { useState, useMemo } from "react";
import {
  WrenchScrewdriverIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  StatCard,
  FilterSection,
  PageHeader,
  QuickActions,
  type FilterOption,
  type QuickAction,
} from "../../../../components/dashboard/shared";

interface ReturnTransaction {
  id: string;
  deliveryTransactionId: string;
  returnDate: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  toStation: string;
  staffName: string;
  scheduledReturnTime: string;
  actualReturnTime: string;
  status:
    | "completed"
    | "late"
    | "damaged"
    | "missing_items"
    | "pending_inspection";
  rentalDuration: string;
  totalCost: number;
  extraCharges: number;
  refundAmount: number;
  fuelLevel: number;
  batteryLevel: number;
  mileage: {
    start: number;
    end: number;
  };
  condition: {
    exterior: "good" | "minor_damage" | "major_damage";
    interior: "good" | "minor_damage" | "major_damage";
    mechanical: "good" | "minor_issue" | "major_issue";
  };
  inspection: {
    completed: boolean;
    inspector: string;
    issues: string[];
    photos: string[];
  };
  penalties: {
    lateFee: number;
    damageFee: number;
    cleaningFee: number;
    otherFees: number;
  };
  notes?: string;
}

export const ReturnHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [stationFilter, setStationFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );

  // Mock data - in real app, this would come from API
  const returnTransactions: ReturnTransaction[] = useMemo(
    () => [
      {
        id: "RT-2024-001",
        deliveryTransactionId: "DV-2024-001",
        returnDate: "2024-10-18 10:15:00",
        vehicleId: "EV-001",
        vehicleName: "VinFast VF e34",
        vehicleImage: "/images/vehicles/vinfast-vf-e34.jpg",
        customerName: "Nguyễn Văn Minh",
        customerPhone: "0987654321",
        customerEmail: "minh.nguyen@email.com",
        toStation: "Trạm Cầu Giấy",
        staffName: "Trần Thị Hoa",
        scheduledReturnTime: "2024-10-18 09:30:00",
        actualReturnTime: "2024-10-18 10:15:00",
        status: "completed",
        rentalDuration: "3 ngày",
        totalCost: 1500000,
        extraCharges: 50000,
        refundAmount: 450000,
        fuelLevel: 85,
        batteryLevel: 90,
        mileage: { start: 15420, end: 15890 },
        condition: {
          exterior: "good",
          interior: "good",
          mechanical: "good",
        },
        inspection: {
          completed: true,
          inspector: "Trần Thị Hoa",
          issues: [],
          photos: [],
        },
        penalties: {
          lateFee: 50000,
          damageFee: 0,
          cleaningFee: 0,
          otherFees: 0,
        },
        notes: "Xe trả muộn 45 phút, tính phí phạt trễ giờ",
      },
      {
        id: "RT-2024-002",
        deliveryTransactionId: "DV-2024-002",
        returnDate: "2024-10-15 22:30:00",
        vehicleId: "EV-023",
        vehicleName: "Hyundai Kona Electric",
        vehicleImage: "/images/vehicles/hyundai-kona.jpg",
        customerName: "Lê Thị Lan",
        customerPhone: "0912345678",
        customerEmail: "lan.le@email.com",
        toStation: "Trạm Lotte Center",
        staffName: "Phạm Văn Đức",
        scheduledReturnTime: "2024-10-15 20:15:00",
        actualReturnTime: "2024-10-15 22:30:00",
        status: "late",
        rentalDuration: "6 giờ",
        totalCost: 300000,
        extraCharges: 100000,
        refundAmount: 100000,
        fuelLevel: 70,
        batteryLevel: 60,
        mileage: { start: 28500, end: 28680 },
        condition: {
          exterior: "minor_damage",
          interior: "good",
          mechanical: "good",
        },
        inspection: {
          completed: true,
          inspector: "Phạm Văn Đức",
          issues: ["Trầy xước nhỏ ở cửa phải", "Pin xuống mức thấp"],
          photos: ["damage1.jpg", "damage2.jpg"],
        },
        penalties: {
          lateFee: 80000,
          damageFee: 200000,
          cleaningFee: 0,
          otherFees: 20000,
        },
        notes: "Xe trả trễ 2 giờ 15 phút, có trầy xước nhỏ, đã tính phí phạt",
      },
      {
        id: "RT-2024-003",
        deliveryTransactionId: "DV-2024-003",
        returnDate: "2024-10-21 17:00:00",
        vehicleId: "EV-045",
        vehicleName: "Tesla Model 3",
        vehicleImage: "/images/vehicles/tesla-model3.jpg",
        customerName: "Hoàng Minh Tú",
        customerPhone: "0934567890",
        customerEmail: "tu.hoang@email.com",
        toStation: "Trạm Times City",
        staffName: "Nguyễn Văn Long",
        scheduledReturnTime: "2024-10-21 16:45:00",
        actualReturnTime: "2024-10-21 17:00:00",
        status: "completed",
        rentalDuration: "1 tuần",
        totalCost: 7000000,
        extraCharges: 0,
        refundAmount: 2000000,
        fuelLevel: 95,
        batteryLevel: 95,
        mileage: { start: 12000, end: 12750 },
        condition: {
          exterior: "good",
          interior: "good",
          mechanical: "good",
        },
        inspection: {
          completed: true,
          inspector: "Nguyễn Văn Long",
          issues: [],
          photos: [],
        },
        penalties: {
          lateFee: 0,
          damageFee: 0,
          cleaningFee: 0,
          otherFees: 0,
        },
      },
      {
        id: "RT-2024-004",
        deliveryTransactionId: "DV-2024-004",
        returnDate: "2024-10-16 14:30:00",
        vehicleId: "EV-067",
        vehicleName: "BYD Atto 3",
        vehicleImage: "/images/vehicles/byd-atto3.jpg",
        customerName: "Vũ Thị Mai",
        customerPhone: "0945678901",
        customerEmail: "mai.vu@email.com",
        toStation: "Trạm Hàng Xanh",
        staffName: "Đỗ Thị Kim",
        scheduledReturnTime: "2024-10-16 11:20:00",
        actualReturnTime: "2024-10-16 14:30:00",
        status: "damaged",
        rentalDuration: "2 ngày",
        totalCost: 1000000,
        extraCharges: 500000,
        refundAmount: 0,
        fuelLevel: 40,
        batteryLevel: 30,
        mileage: { start: 45200, end: 45520 },
        condition: {
          exterior: "major_damage",
          interior: "minor_damage",
          mechanical: "minor_issue",
        },
        inspection: {
          completed: true,
          inspector: "Đỗ Thị Kim",
          issues: ["Pin suy giảm nghiêm trọng", "Móp đầu xe", "Ghế bẩn"],
          photos: [
            "damage_battery.jpg",
            "damage_front.jpg",
            "interior_dirty.jpg",
          ],
        },
        penalties: {
          lateFee: 150000,
          damageFee: 800000,
          cleaningFee: 100000,
          otherFees: 50000,
        },
        notes: "Xe có hư hỏng nghiêm trọng về pin và ngoại thất, cần sửa chữa",
      },
      {
        id: "RT-2024-005",
        deliveryTransactionId: "DV-2024-005",
        returnDate: "2024-10-16 00:30:00",
        vehicleId: "EV-089",
        vehicleName: "VinFast VF 8",
        vehicleImage: "/images/vehicles/vinfast-vf8.jpg",
        customerName: "Trần Quốc Huy",
        customerPhone: "0956789012",
        customerEmail: "huy.tran@email.com",
        toStation: "Trạm Landmark 81",
        staffName: "Lê Văn Hùng",
        scheduledReturnTime: "2024-10-15 20:00:00",
        actualReturnTime: "2024-10-16 00:30:00",
        status: "late",
        rentalDuration: "2.5 ngày",
        totalCost: 1250000,
        extraCharges: 200000,
        refundAmount: 400000,
        fuelLevel: 75,
        batteryLevel: 80,
        mileage: { start: 8900, end: 9350 },
        condition: {
          exterior: "good",
          interior: "minor_damage",
          mechanical: "good",
        },
        inspection: {
          completed: true,
          inspector: "Lê Văn Hùng",
          issues: ["Ghế có vết bẩn nhỏ"],
          photos: ["seat_stain.jpg"],
        },
        penalties: {
          lateFee: 180000,
          damageFee: 0,
          cleaningFee: 50000,
          otherFees: 0,
        },
        notes: "Xe trả trễ 4.5 giờ, có vết bẩn nhỏ trên ghế",
      },
    ],
    []
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "late":
        return "text-yellow-600 bg-yellow-100";
      case "damaged":
        return "text-red-600 bg-red-100";
      case "missing_items":
        return "text-red-600 bg-red-100";
      case "pending_inspection":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "late":
        return "Trả trễ";
      case "damaged":
        return "Có hư hỏng";
      case "missing_items":
        return "Thiếu vật dụng";
      case "pending_inspection":
        return "Chờ kiểm tra";
      default:
        return "Không xác định";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "good":
        return "text-green-600 bg-green-100";
      case "minor_damage":
      case "minor_issue":
        return "text-yellow-600 bg-yellow-100";
      case "major_damage":
      case "major_issue":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case "good":
        return "Tốt";
      case "minor_damage":
        return "Hư hỏng nhỏ";
      case "major_damage":
        return "Hư hỏng lớn";
      case "minor_issue":
        return "Vấn đề nhỏ";
      case "major_issue":
        return "Vấn đề lớn";
      default:
        return "Không xác định";
    }
  };

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    return returnTransactions.filter((transaction) => {
      const matchesSearch =
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.vehicleName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.vehicleId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.deliveryTransactionId
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;
      const matchesStation =
        stationFilter === "all" || transaction.toStation === stationFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const transactionDate = new Date(transaction.returnDate);
        const today = new Date();
        const daysDiff = Math.floor(
          (today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (dateFilter) {
          case "today":
            matchesDate = daysDiff === 0;
            break;
          case "week":
            matchesDate = daysDiff <= 7;
            break;
          case "month":
            matchesDate = daysDiff <= 30;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesStation && matchesDate;
    });
  }, [searchTerm, statusFilter, dateFilter, stationFilter, returnTransactions]);

  const stats = {
    total: returnTransactions.length,
    completed: returnTransactions.filter((t) => t.status === "completed")
      .length,
    issues: returnTransactions.filter(
      (t) => t.status === "damaged" || t.status === "missing_items"
    ).length,
    totalPenalties: returnTransactions.reduce(
      (sum, t) =>
        sum +
        t.penalties.lateFee +
        t.penalties.damageFee +
        t.penalties.cleaningFee +
        t.penalties.otherFees,
      0
    ),
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

  const uniqueStations = useMemo(
    () => [...new Set(returnTransactions.map((t) => t.toStation))],
    [returnTransactions]
  );

  // Status filter options
  const statusOptions: FilterOption[] = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "completed", label: "Hoàn thành" },
    { value: "late", label: "Trả trễ" },
    { value: "damaged", label: "Có hư hỏng" },
    { value: "missing_items", label: "Thiếu vật dụng" },
    { value: "pending_inspection", label: "Chờ kiểm tra" },
  ];

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      label: "Tạo báo cáo",
      description: "Xuất báo cáo",
      icon: <DocumentArrowDownIcon className="w-full h-full" />,
      onClick: () => console.log("Generate report"),
      color: "blue",
    },
    {
      label: "Kiểm tra xe",
      description: "Lịch kiểm tra",
      icon: <WrenchScrewdriverIcon className="w-full h-full" />,
      onClick: () => console.log("Schedule inspection"),
      color: "red",
    },
    {
      label: "Lập lịch nhận",
      description: "Đặt lịch nhận",
      icon: <CalendarDaysIcon className="w-full h-full" />,
      onClick: () => console.log("Schedule return"),
      color: "green",
    },
    {
      label: "Tính phí phạt",
      description: "Quản lý phí",
      icon: <CurrencyDollarIcon className="w-full h-full" />,
      onClick: () => console.log("Calculate penalties"),
      color: "orange",
    },
  ];

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Page Header */}
      <PageHeader
        title="Lịch sử nhận xe"
        subtitle="Quản lý quá trình nhận xe và kiểm tra tình trạng"
        icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
        badgeText="Return Center"
        color="red"
        stats={[
          {
            label: "nhận hoàn thành",
            value: stats.completed,
            icon: <CheckCircleIcon className="w-4 h-4 text-green-600" />,
          },
          {
            label: "tổng giao dịch",
            value: stats.total,
            icon: <WrenchScrewdriverIcon className="w-4 h-4 text-red-600" />,
          },
        ]}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Nhận Xe"
          value={stats.total}
          subtitle="+5% từ tuần trước"
          icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
          color="gray"
        />
        <StatCard
          title="Hoàn Thành"
          value={stats.completed}
          subtitle="+3% từ tuần trước"
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Có Vấn Đề"
          value={stats.issues}
          subtitle="-1% từ tuần trước"
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Tổng Phí Phạt"
          value={formatCurrency(stats.totalPenalties)}
          subtitle="+8% từ tuần trước"
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Filters */}
      <FilterSection
        title="Bộ Lọc Nhận Xe"
        searchPlaceholder="Tìm theo ID, khách hàng, tình trạng xe..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        stationFilter={stationFilter}
        onStationFilterChange={setStationFilter}
        stations={uniqueStations}
        resultCount={filteredTransactions.length}
        color="red"
      />

      {/* Transaction Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giao dịch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xe nhận
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tình trạng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phí phạt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        Giao: {transaction.deliveryTransactionId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDateTime(transaction.returnDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.customerPhone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.vehicleName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {transaction.vehicleId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.toStation}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-900">
                        <strong>Hẹn:</strong>{" "}
                        {formatDateTime(transaction.scheduledReturnTime)}
                      </div>
                      <div className="text-sm text-gray-500">
                        <strong>Thực tế:</strong>{" "}
                        {formatDateTime(transaction.actualReturnTime)}
                      </div>
                      <div className="text-sm text-gray-500">
                        NV: {transaction.staffName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusText(transaction.status)}
                      </span>
                      <div className="flex space-x-1">
                        <span
                          className={`px-1 py-0.5 text-xs rounded ${getConditionColor(
                            transaction.condition.exterior
                          )}`}
                        >
                          {getConditionText(transaction.condition.exterior)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(
                          transaction.penalties.lateFee +
                            transaction.penalties.damageFee +
                            transaction.penalties.cleaningFee +
                            transaction.penalties.otherFees
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Hoàn lại: {formatCurrency(transaction.refundAmount)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() =>
                        setSelectedTransaction(
                          selectedTransaction === transaction.id
                            ? null
                            : transaction.id
                        )
                      }
                      className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>Xem</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Panel */}
      {selectedTransaction && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {(() => {
            const transaction = returnTransactions.find(
              (t) => t.id === selectedTransaction
            );
            if (!transaction) return null;

            return (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Chi tiết nhận xe: {transaction.id}
                  </h3>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Thông tin khách hàng
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Họ tên:</span>{" "}
                        <span className="font-medium">
                          {transaction.customerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Điện thoại:</span>{" "}
                        <span className="font-medium">
                          {transaction.customerPhone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>{" "}
                        <span className="font-medium">
                          {transaction.customerEmail}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Thông tin xe và tình trạng
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Tên xe:</span>{" "}
                        <span className="font-medium">
                          {transaction.vehicleName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">ID xe:</span>{" "}
                        <span className="font-medium">
                          {transaction.vehicleId}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Pin:</span>{" "}
                        <span className="font-medium">
                          {transaction.batteryLevel}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Km:</span>{" "}
                        <span className="font-medium">
                          {transaction.mileage.start} →{" "}
                          {transaction.mileage.end}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded ${getConditionColor(
                            transaction.condition.exterior
                          )}`}
                        >
                          Ngoại thất:{" "}
                          {getConditionText(transaction.condition.exterior)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Phí và phạt
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Phí trễ:</span>{" "}
                        <span className="font-medium">
                          {formatCurrency(transaction.penalties.lateFee)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phí hư hỏng:</span>{" "}
                        <span className="font-medium">
                          {formatCurrency(transaction.penalties.damageFee)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phí vệ sinh:</span>{" "}
                        <span className="font-medium">
                          {formatCurrency(transaction.penalties.cleaningFee)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tổng cộng:</span>{" "}
                        <span className="font-medium">
                          {formatCurrency(
                            transaction.penalties.lateFee +
                              transaction.penalties.damageFee +
                              transaction.penalties.cleaningFee +
                              transaction.penalties.otherFees
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {transaction.inspection.issues.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Vấn đề phát hiện
                    </h4>
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                      {transaction.inspection.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {transaction.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Ghi chú</h4>
                    <p className="text-sm text-gray-700">{transaction.notes}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions
        title="Trung Tâm Kiểm Tra"
        subtitle="Thao tác nhanh cho việc kiểm tra và đánh giá xe"
        actions={quickActions}
        headerIcon={<WrenchScrewdriverIcon className="w-6 h-6" />}
        color="red"
      />
    </div>
  );
};

export default ReturnHistory;
