import React from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import type { ReturnTransaction } from "../../../types/admin";

interface ReturnTableProps {
  transactions: ReturnTransaction[];
  onSelectTransaction: (transactionId: string | null) => void;
  selectedTransaction: string | null;
}

export const ReturnTable: React.FC<ReturnTableProps> = ({
  transactions,
  onSelectTransaction,
  selectedTransaction,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      case "damaged":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Chờ xử lý";
      case "overdue":
        return "Quá hạn";
      case "damaged":
        return "Có hư hỏng";
      default:
        return "Không xác định";
    }
  };

  const getFinalAmountColor = (refundAmount: number, extraCharges: number) => {
    if (refundAmount > 0) {
      return "text-green-600";
    } else if (extraCharges > 0) {
      return "text-red-600";
    } else {
      return "text-gray-600";
    }
  };

  const getFinalAmountText = (refundAmount: number, extraCharges: number) => {
    if (refundAmount > 0) {
      return "Hoàn tiền";
    } else if (extraCharges > 0) {
      return "Phụ phí";
    } else {
      return "Thanh toán";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có dữ liệu trả xe
          </h3>
          <p className="text-gray-500">
            Chưa có giao dịch trả xe nào được tìm thấy với bộ lọc hiện tại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Danh sách giao dịch trả xe ({transactions.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giao dịch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Xe & Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian trả
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
                className={`hover:bg-gray-50 ${
                  selectedTransaction === transaction.id ? "bg-red-50" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.returnDate)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.vehicleName} ({transaction.vehicleId})
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.customerName} - {transaction.customerPhone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">
                      {formatDate(transaction.actualReturnTime)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Tại: {transaction.toStation}
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
                  <div>
                    <div
                      className={`text-sm font-medium ${getFinalAmountColor(
                        transaction.refundAmount,
                        transaction.extraCharges
                      )}`}
                    >
                      {transaction.refundAmount > 0
                        ? `Hoàn: ${formatCurrency(transaction.refundAmount)}`
                        : transaction.extraCharges > 0
                        ? `Phụ phí: ${formatCurrency(transaction.extraCharges)}`
                        : formatCurrency(0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getFinalAmountText(
                        transaction.refundAmount,
                        transaction.extraCharges
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() =>
                      onSelectTransaction(
                        selectedTransaction === transaction.id
                          ? null
                          : transaction.id
                      )
                    }
                    className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    {selectedTransaction === transaction.id ? "Ẩn" : "Xem"}
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
