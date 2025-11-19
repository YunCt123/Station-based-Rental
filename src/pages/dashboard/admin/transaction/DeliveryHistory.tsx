import React, { useState, useMemo, useEffect } from "react";
import { TruckIcon } from "@heroicons/react/24/outline";
import {
  FilterSection,
  PageHeader,
  type FilterOption,
} from "../../../../components/dashboard/shared";
import {
  DeliveryTable,
  DeliveryDetails,
  DeliveryStats,
} from "../../../../components/admin/delivery";
import type { DeliveryTransaction } from "../../../../types/admin";
import rentalService from "../../../../services/rentalService";
import type { Rental } from "../../../../services/customerService";

// Interface for user data from API
interface RentalUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
}

// Helper function to transform API rental data to DeliveryTransaction
const transformRentalToDelivery = (rental: Rental): DeliveryTransaction => {
  const booking = rental.booking_id;
  const vehicle = rental.vehicle_id;
  const station = rental.station_id;
  // Type assertion since API returns populated user object
  const user = typeof rental.user_id === 'string' ? null : (rental.user_id as unknown as RentalUser | null);
  
  // Map rental status to delivery status
  const statusMap: Record<string, DeliveryTransaction['status']> = {
    CONFIRMED: 'completed',
    ONGOING: 'delayed',
    RETURN_PENDING: 'delayed',
    COMPLETED: 'completed',
    REJECTED: 'issue_reported'
  };
  
  // Calculate rental type based on duration
  const calculateRentalType = (startAt: string, endAt: string): DeliveryTransaction['rentalType'] => {
    const hours = Math.abs(new Date(endAt).getTime() - new Date(startAt).getTime()) / 36e5;
    if (hours <= 24) return 'hourly';
    if (hours <= 168) return 'daily';
    return 'weekly';
  };
  
  // Calculate duration string
  const calculateDuration = (startAt: string, endAt: string): string => {
    const hours = Math.abs(new Date(endAt).getTime() - new Date(startAt).getTime()) / 36e5;
    if (hours < 24) return `${Math.round(hours)} giờ`;
    if (hours < 168) return `${Math.round(hours / 24)} ngày`;
    return `${Math.round(hours / 168)} tuần`;
  };
  
  return {
    id: rental._id,
    transactionDate: rental.createdAt,
    vehicleId: vehicle._id,
    vehicleName: `${vehicle.brand} ${vehicle.model}`,
    vehicleImage: vehicle.image || '/vehicles/default.jpg',
    customerName: user?.name || 'N/A',
    customerPhone: user?.phoneNumber || 'N/A',
    customerEmail: user?.email || 'N/A',
    licenseNumber: vehicle.licensePlate || 'N/A',
    fromStation: station.name,
    toStation: station.name,
    staffName: 'N/A',
    deliveryTime: rental.pickup?.at || booking?.start_at || rental.createdAt,
    returnDueTime: booking?.end_at || rental.createdAt,
    status: statusMap[rental.status] || 'completed',
    rentalType: booking ? calculateRentalType(booking.start_at, booking.end_at) : 'daily',
    rentalDuration: booking ? calculateDuration(booking.start_at, booking.end_at) : 'N/A',
    totalCost: rental.charges?.total || booking?.pricing_snapshot?.total_price || 0,
    depositAmount: rental.pricing_snapshot?.deposit || booking?.pricing_snapshot?.deposit || 0,
    paymentMethod: 'online',
    paymentStatus: rental.status === 'COMPLETED' ? 'paid' : rental.status === 'REJECTED' ? 'refunded' : 'pending',
    documents: {
      contract: true,
      license: true,
      insurance: true,
      inspection: (rental.pickup?.photos?.length || 0) > 0,
    },
    notes: rental.pickup?.notes || '',
  };
};

export const DeliveryHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [stationFilter, setStationFilter] = useState("all");
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  
  // State for API data
  const [deliveryTransactions, setDeliveryTransactions] = useState<DeliveryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch delivery transactions from API
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {
          page: pagination.page,
          limit: pagination.limit,
        };
        
        // Map UI status filter to API status
        if (statusFilter !== 'all') {
          const statusMap: Record<string, string> = {
            completed: 'COMPLETED',
            delayed: 'ONGOING',
            overdue: 'RETURN_PENDING',
            issue_reported: 'CANCELLED',
          };
          params.status = statusMap[statusFilter];
        }

        const response = await rentalService.getAdminRentals(params);
        
        if (response.success && response.data) {
          const transformedData = response.data.map(transformRentalToDelivery);
          setDeliveryTransactions(transformedData);
          
          if (response.meta) {
            setPagination({
              page: response.meta.page,
              limit: response.meta.limit,
              total: response.meta.total,
              totalPages: response.meta.totalPages,
            });
          }
        } else {
          // API returned but no data or error
          const errorMsg = (response as any).error || 'Không thể tải dữ liệu giao xe';
          setError(errorMsg);
          console.warn('API response not successful:', response);
        }
      } catch (err: any) {
        const errorMessage = err.message || err.response?.data?.message || 'Không thể tải dữ liệu giao xe';
        setError(errorMessage);
        console.error('Error fetching deliveries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [pagination.page, statusFilter]);

  // Mock data fallback (keeping original mock data structure)
  const mockDeliveryTransactions: DeliveryTransaction[] = useMemo(
    () => [
      {
        id: "DV-2024-001",
        transactionDate: "2024-10-15 09:30:00",
        vehicleId: "VH-E001",
        vehicleName: "Honda Lead",
        vehicleImage: "/vehicles/honda-lead.jpg",
        customerName: "Nguyễn Văn A",
        customerPhone: "0901234567",
        customerEmail: "nguyenvana@email.com",
        licenseNumber: "123456789",
        fromStation: "Trạm Quận 1",
        toStation: "Trạm Quận 3",
        staffName: "Trần Thị B",
        deliveryTime: "2024-10-15 10:00:00",
        returnDueTime: "2024-10-17 10:00:00",
        status: "completed",
        rentalType: "daily",
        rentalDuration: "2 ngày",
        totalCost: 200000,
        depositAmount: 500000,
        paymentMethod: "card",
        paymentStatus: "paid",
        documents: {
          contract: true,
          license: true,
          insurance: true,
          inspection: true,
        },
        notes: "Giao xe thành công, khách hàng hài lòng.",
      },
      {
        id: "DV-2024-002",
        transactionDate: "2024-10-15 14:20:00",
        vehicleId: "VH-E002",
        vehicleName: "Yamaha Janus",
        vehicleImage: "/vehicles/yamaha-janus.jpg",
        customerName: "Lê Thị C",
        customerPhone: "0912345678",
        customerEmail: "lethic@email.com",
        licenseNumber: "987654321",
        fromStation: "Trạm Quận 2",
        staffName: "Phạm Văn D",
        deliveryTime: "2024-10-15 15:00:00",
        returnDueTime: "2024-10-15 21:00:00",
        status: "delayed",
        rentalType: "hourly",
        rentalDuration: "6 giờ",
        totalCost: 120000,
        depositAmount: 300000,
        paymentMethod: "cash",
        paymentStatus: "partial",
        documents: {
          contract: true,
          license: true,
          insurance: false,
          inspection: true,
        },
      },
      {
        id: "DV-2024-003",
        transactionDate: "2024-10-14 16:45:00",
        vehicleId: "VH-E003",
        vehicleName: "Honda Vision",
        vehicleImage: "/vehicles/honda-vision.jpg",
        customerName: "Võ Minh E",
        customerPhone: "0923456789",
        customerEmail: "vominhe@email.com",
        licenseNumber: "456789123",
        fromStation: "Trạm Quận 7",
        toStation: "Trạm Quận 1",
        staffName: "Nguyễn Thị F",
        deliveryTime: "2024-10-14 17:30:00",
        returnDueTime: "2024-10-21 17:30:00",
        status: "overdue",
        rentalType: "weekly",
        rentalDuration: "1 tuần",
        totalCost: 700000,
        depositAmount: 1000000,
        paymentMethod: "online",
        paymentStatus: "pending",
        documents: {
          contract: true,
          license: true,
          insurance: true,
          inspection: false,
        },
        notes: "Khách hàng yêu cầu gia hạn thêm 2 ngày.",
      },
    ],
    []
  );

  // Filter options
  const statusOptions: FilterOption[] = [
    { label: "Tất cả", value: "all" },
    { label: "Hoàn thành", value: "completed" },
    { label: "Trễ hạn", value: "delayed" },
    { label: "Quá hạn", value: "overdue" },
    { label: "Có vấn đề", value: "issue_reported" },
  ];

  // Filter transactions (client-side filtering for search and station)
  const filteredTransactions = useMemo(() => {
    // Always use real data if available, even if it's empty
    const transactions = deliveryTransactions;
    
    console.log('[DeliveryHistory] Filtering transactions:', {
      total: transactions.length,
      hasError: !!error,
      searchTerm,
      statusFilter,
      stationFilter
    });
    
    return transactions.filter((transaction) => {
      const matchesSearch =
        searchTerm === "" ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.vehicleName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStation =
        stationFilter === "all" || 
        transaction.fromStation === stationFilter ||
        transaction.toStation === stationFilter;

      return matchesSearch && matchesStation;
    });
  }, [deliveryTransactions, mockDeliveryTransactions, searchTerm, stationFilter]);

  const selectedTransaction = selectedTransactionId
    ? filteredTransactions.find((t) => t.id === selectedTransactionId) || null
    : null;

  const handleCloseDetails = () => {
    setSelectedTransactionId(null);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Loading state
  if (loading && deliveryTransactions.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu giao xe...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && deliveryTransactions.length === 0 && !loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Lịch Sử Giao Xe"
          subtitle="Quản lý và theo dõi các giao dịch giao xe cho khách hàng"
          icon={<TruckIcon className="w-6 h-6" />}
          color="blue"
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
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Lịch Sử Giao Xe"
        subtitle="Quản lý và theo dõi các giao dịch giao xe cho khách hàng"
        icon={<TruckIcon className="w-6 h-6" />}
        color="blue"
      />

      {/* Statistics */}
      <DeliveryStats transactions={filteredTransactions} />

      {/* Filters */}
      <FilterSection
        title="Bộ Lọc Giao Xe"
        searchPlaceholder="Tìm theo ID giao dịch, khách hàng, xe..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        stationFilter={stationFilter}
        onStationFilterChange={setStationFilter}
        stations={["Trạm Quận 1", "Trạm Quận 2", "Trạm Quận 3", "Trạm Quận 7"]}
        resultCount={filteredTransactions.length}
        color="blue"
      />

      {/* Transaction Details */}
      {selectedTransaction && (
        <DeliveryDetails
          transaction={selectedTransaction}
          onClose={handleCloseDetails}
        />
      )}

      {/* Transactions Table */}
      <DeliveryTable
        transactions={filteredTransactions}
        onSelectTransaction={setSelectedTransactionId}
        selectedTransaction={selectedTransactionId}
      />

      {/* Empty state */}
      {!loading && !error && filteredTransactions.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg">Chưa có giao dịch giao xe nào</p>
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
    </div>
  );
};

export default DeliveryHistory;
