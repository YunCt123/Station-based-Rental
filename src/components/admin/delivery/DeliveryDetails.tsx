import React from "react";
import type { DeliveryTransaction } from "../../../types/admin";

interface DeliveryDetailsProps {
  transaction: DeliveryTransaction;
  onClose: () => void;
}

export const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({
  transaction,
  onClose,
}) => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Chi tiết giao dịch: {transaction.id}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
              <span className="font-medium">{transaction.customerName}</span>
            </div>
            <div>
              <span className="text-gray-500">Điện thoại:</span>{" "}
              <span className="font-medium">{transaction.customerPhone}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>{" "}
              <span className="font-medium">{transaction.customerEmail}</span>
            </div>
            <div>
              <span className="text-gray-500">Bằng lái:</span>{" "}
              <span className="font-medium">{transaction.licenseNumber}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Thông tin xe thuê</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Tên xe:</span>{" "}
              <span className="font-medium">{transaction.vehicleName}</span>
            </div>
            <div>
              <span className="text-gray-500">ID xe:</span>{" "}
              <span className="font-medium">{transaction.vehicleId}</span>
            </div>
            <div>
              <span className="text-gray-500">Trạm giao:</span>{" "}
              <span className="font-medium">{transaction.fromStation}</span>
            </div>
            <div>
              <span className="text-gray-500">Nhân viên giao:</span>{" "}
              <span className="font-medium">{transaction.staffName}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Thông tin thanh toán
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Tổng tiền:</span>{" "}
              <span className="font-medium">
                {formatCurrency(transaction.totalCost)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Tiền cọc:</span>{" "}
              <span className="font-medium">
                {formatCurrency(transaction.depositAmount)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Phương thức:</span>{" "}
              <span className="font-medium">{transaction.paymentMethod}</span>
            </div>
            <div>
              <span className="text-gray-500">Trạng thái:</span>{" "}
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                  transaction.paymentStatus
                )}`}
              >
                {getPaymentStatusText(transaction.paymentStatus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {transaction.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Ghi chú</h4>
          <p className="text-sm text-gray-700">{transaction.notes}</p>
        </div>
      )}
    </div>
  );
};
