import React from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import type { DeliveryTransaction } from "../../../types/admin";

interface DeliveryTableProps {
  transactions: DeliveryTransaction[];
  onSelectTransaction: (transactionId: string | null) => void;
  selectedTransaction: string | null;
}

export const DeliveryTable: React.FC<DeliveryTableProps> = ({
  transactions,
  onSelectTransaction,
  selectedTransaction,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "delayed":
        return "text-yellow-600 bg-yellow-100";
      case "issue_reported":
        return "text-red-600 bg-red-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "delayed":
        return "Trễ hẹn";
      case "issue_reported":
        return "Có sự cố";
      case "overdue":
        return "Quá hạn";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "partial":
        return "text-yellow-600 bg-yellow-100";
      case "pending":
        return "text-red-600 bg-red-100";
      case "refunded":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "partial":
        return "Thanh toán một phần";
      case "pending":
        return "Chờ thanh toán";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return "Không xác định";
    }
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

  return (
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
                Xe thuê
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thanh toán
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
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
                      {formatDateTime(transaction.transactionDate)}
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
                    <div className="text-sm text-gray-500">
                      {transaction.licenseNumber}
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
                      {transaction.fromStation}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-900">
                      <strong>Giao:</strong>{" "}
                      {formatDateTime(transaction.deliveryTime)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <strong>Hạn trả:</strong>{" "}
                      {formatDateTime(transaction.returnDueTime)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.rentalDuration}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {getStatusText(transaction.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.totalCost)}
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                        transaction.paymentStatus
                      )}`}
                    >
                      {getPaymentStatusText(transaction.paymentStatus)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() =>
                      onSelectTransaction(
                        selectedTransaction === transaction.id
                          ? null
                          : transaction.id
                      )
                    }
                    className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
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
  );
};
