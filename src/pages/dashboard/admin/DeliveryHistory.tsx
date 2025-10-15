import React, { useState, useMemo } from "react";
import { TruckIcon } from "@heroicons/react/24/outline";
import {
  FilterSection,
  PageHeader,
  type FilterOption,
} from "../../../components/dashboard/shared";
import {
  DeliveryTable,
  DeliveryDetails,
  DeliveryStats,
} from "../../../components/admin/delivery";
import type { DeliveryTransaction } from "../../../types/admin";

export const DeliveryHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [stationFilter, setStationFilter] = useState("all");
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  // Mock data - in real app, this would come from API
  const deliveryTransactions: DeliveryTransaction[] = useMemo(
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

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return deliveryTransactions.filter((transaction) => {
      const matchesSearch =
        searchTerm === "" ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.vehicleName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliveryTransactions, searchTerm, statusFilter]);

  const selectedTransaction = selectedTransactionId
    ? deliveryTransactions.find((t) => t.id === selectedTransactionId) || null
    : null;

  const handleCloseDetails = () => {
    setSelectedTransactionId(null);
  };

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
    </div>
  );
};
