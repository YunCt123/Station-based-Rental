import React, { useState, useMemo, useEffect } from "react";
import {
  WrenchScrewdriverIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import {
  StatCard,
  FilterSection,
  PageHeader,
  type FilterOption,
} from "../../../../components/dashboard/shared";
import rentalService from "../../../../services/rentalService";
import type { StationRental } from "../../../../services/rentalService";

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

// Helper function to check if a value is a populated object or just an ID
const isPopulated = (value: any): boolean => {
  return value && typeof value === 'object' && '_id' in value && Object.keys(value).length > 1;
};

// Helper function to transform API rental data to ReturnTransaction
const transformRentalToReturn = (rental: StationRental): ReturnTransaction | null => {
  try {
    // Validate required fields
    if (!rental || !rental._id || !rental.return?.at) {
      return null; // Skip if no return data
    }

    const booking = rental.booking_id;
    const vehicle = rental.vehicle_id;
    const station = rental.station_id;
    const user = rental.user_id;
    
    // Check if data is populated
    const isVehiclePopulated = isPopulated(vehicle);
    const isStationPopulated = isPopulated(station);
    const isUserPopulated = isPopulated(user);
    const isBookingPopulated = isPopulated(booking);
    
    // Skip if critical data is not populated
    if (!isVehiclePopulated || !isStationPopulated) {
      return null;
    }
    
    // Map rental status to return status
    const statusMap: Record<string, ReturnTransaction['status']> = {
      COMPLETED: 'completed',
      RETURN_PENDING: 'pending_inspection',
      DISPUTED: 'damaged',
      REJECTED: 'damaged',
    };
    
    // Calculate if return was late
    const scheduledTime = isBookingPopulated ? (booking as any).end_at : null;
    const actualTime = rental.return.at;
    const isLate = scheduledTime && actualTime && new Date(actualTime) > new Date(scheduledTime);
    
    // Determine condition based on charges
    const hasDamage = (rental.charges?.damage_fee || 0) > 0;
    const needsCleaning = (rental.charges?.cleaning_fee || 0) > 0;
    
    const exteriorCondition = hasDamage ? 'major_damage' : 'good';
    const interiorCondition = needsCleaning ? 'minor_damage' : 'good';
    
    // Get staff name from return info
    const staffName = typeof (rental.return as any)?.staff_id === 'object' && (rental.return as any)?.staff_id !== null
      ? ((rental.return as any).staff_id as any).name || 'N/A'
      : 'N/A';
    
    const brand = (vehicle as any).brand || '';
    const model = (vehicle as any).model || '';
    const vehicleName = (brand || model) ? `${brand} ${model}`.trim() : 'N/A';
    
    return {
      id: rental._id,
      deliveryTransactionId: rental._id,
      returnDate: rental.return.at,
      vehicleId: (vehicle as any)._id,
      vehicleName: vehicleName,
      vehicleImage: (vehicle as any).image || '/vehicles/default.jpg',
      customerName: isUserPopulated ? (user as any).name : `ID: ${user}`,
      customerPhone: isUserPopulated ? ((user as any).phoneNumber || 'N/A') : 'N/A',
      customerEmail: isUserPopulated ? ((user as any).email || 'N/A') : 'N/A',
      toStation: (station as any).name || 'N/A',
      staffName: staffName,
      scheduledReturnTime: scheduledTime || rental.return.at,
      actualReturnTime: rental.return.at,
      status: isLate ? 'late' : (hasDamage ? 'damaged' : (statusMap[rental.status] || 'completed')),
      rentalDuration: 'N/A',
      totalCost: rental.charges?.total || rental.pricing_snapshot?.total_price || 0,
      extraCharges: (rental.charges?.damage_fee || 0) + (rental.charges?.cleaning_fee || 0) + (rental.charges?.other_fees || 0),
      refundAmount: 0,
      fuelLevel: 0,
      batteryLevel: rental.return.soc ? Math.round(rental.return.soc * 100) : 0,
      mileage: {
        start: rental.pickup?.odo_km || 0,
        end: rental.return.odo_km || 0,
      },
      condition: {
        exterior: exteriorCondition as any,
        interior: interiorCondition as any,
        mechanical: 'good',
      },
      inspection: {
        completed: !!rental.return.at,
        inspector: staffName,
        issues: hasDamage || needsCleaning ? ['Có hư hỏng hoặc cần vệ sinh'] : [],
        photos: rental.return.photos?.map((p: any) => p.url || p) || [],
      },
      penalties: {
        lateFee: rental.charges?.late_fee || 0,
        damageFee: rental.charges?.damage_fee || 0,
        cleaningFee: rental.charges?.cleaning_fee || 0,
        otherFees: rental.charges?.other_fees || 0,
      },
      notes: rental.pickup?.notes || '',
    };
  } catch (error) {
    console.error('❌ Error transforming rental to return:', error, rental);
    return null;
  }
};

export const ReturnHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [stationFilter, setStationFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  
  // State for API data
  const [returnTransactions, setReturnTransactions] = useState<ReturnTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch return transactions from API
  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 [ReturnHistory] Fetching returns with params:', {
          page: pagination.page,
          limit: pagination.limit,
          statusFilter
        });
        
        const params: any = {
          page: pagination.page,
          limit: pagination.limit,
        };
        
        // Map UI status filter to API status
        if (statusFilter !== 'all') {
          const statusMap: Record<string, string> = {
            completed: 'COMPLETED',
            late: 'COMPLETED',
            damaged: 'DISPUTED',
            missing_items: 'DISPUTED',
            pending_inspection: 'RETURN_PENDING',
          };
          params.status = statusMap[statusFilter];
        }

        const response = await rentalService.getAdminRentals(params);
        
        console.log('✅ [ReturnHistory] API response:', {
          success: response.success,
          dataCount: response.data?.length || 0,
          meta: response.meta,
          sampleData: response.data?.[0]
        });
        
        if (response.success && response.data) {
          const transformedData = response.data
            .map(transformRentalToReturn)
            .filter((item): item is ReturnTransaction => item !== null);
          
          console.log('✅ [ReturnHistory] Transformed data:', {
            originalCount: response.data.length,
            validCount: transformedData.length,
            sample: transformedData[0]
          });
          setReturnTransactions(transformedData);
          
          if (response.meta) {
            setPagination({
              page: response.meta.page,
              limit: response.meta.limit,
              total: response.meta.total,
              totalPages: response.meta.totalPages,
            });
          }
        } else {
          const errorMsg = (response as any).error || 'Không thể tải dữ liệu nhận xe';
          setError(errorMsg);
          console.warn('⚠️ [ReturnHistory] API response not successful:', response);
        }
      } catch (err: any) {
        const errorMessage = err.message || err.response?.data?.message || 'Không thể tải dữ liệu nhận xe';
        setError(errorMessage);
        console.error('❌ [ReturnHistory] Error fetching returns:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [pagination.page, statusFilter]);

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
    console.log('[ReturnHistory] Filtering transactions:', {
      total: returnTransactions.length,
      hasError: !!error,
      searchTerm,
      statusFilter,
      stationFilter
    });
    
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
  }, [searchTerm, statusFilter, dateFilter, stationFilter, returnTransactions, error]);

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

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Loading state
  if (loading && returnTransactions.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu nhận xe...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && returnTransactions.length === 0 && !loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Lịch sử nhận xe"
          subtitle="Quản lý quá trình nhận xe và kiểm tra tình trạng"
          icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
          color="red"
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 text-lg font-semibold mb-2">⚠️ Không thể tải dữ liệu</p>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

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
          icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
          color="gray"
        />
        <StatCard
          title="Hoàn Thành"
          value={stats.completed}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Có Vấn Đề"
          value={stats.issues}
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Tổng Phí Phạt"
          value={formatCurrency(stats.totalPenalties)}
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

      {/* Empty state */}
      {!loading && !error && filteredTransactions.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg">Chưa có giao dịch nhận xe nào</p>
          <p className="text-gray-500 text-sm mt-2">Dữ liệu sẽ xuất hiện khi có giao dịch mới</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} giao dịch
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Trước
              </button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm text-gray-600">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {/* <QuickActions
        title="Trung Tâm Kiểm Tra"
        subtitle="Thao tác nhanh cho việc kiểm tra và đánh giá xe"
        actions={quickActions}
        headerIcon={<WrenchScrewdriverIcon className="w-6 h-6" />}
        color="red"
      /> */}
    </div>
  );
};

export default ReturnHistory;
