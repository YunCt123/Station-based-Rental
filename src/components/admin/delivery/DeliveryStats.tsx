import React from "react";
import { StatCard } from "../../dashboard/shared";
import type { DeliveryTransaction } from "../../../types/admin";

interface DeliveryStatsProps {
  transactions: DeliveryTransaction[];
  isLoading?: boolean;
}

export const DeliveryStats: React.FC<DeliveryStatsProps> = ({
  transactions,
  isLoading = false,
}) => {
  const calculateStats = () => {
    if (!transactions.length) {
      return {
        totalDeliveries: 0,
        totalRevenue: 0,
        completedDeliveries: 0,
        avgDeliveryAmount: 0,
      };
    }

    const totalDeliveries = transactions.length;
    const totalRevenue = transactions.reduce(
      (sum, transaction) => sum + transaction.totalCost,
      0
    );
    const completedDeliveries = transactions.filter(
      (transaction) => transaction.paymentStatus === "paid"
    ).length;
    const avgDeliveryAmount =
      totalDeliveries > 0 ? totalRevenue / totalDeliveries : 0;

    return {
      totalDeliveries,
      totalRevenue,
      completedDeliveries,
      avgDeliveryAmount,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const stats = calculateStats();
  const completionRate =
    stats.totalDeliveries > 0
      ? Math.round((stats.completedDeliveries / stats.totalDeliveries) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Tổng giao dịch"
        value={stats.totalDeliveries.toString()}
        icon="📊"
        color="blue"
      />

      <StatCard
        title="Doanh thu"
        value={formatCurrency(stats.totalRevenue)}
        icon="💰"
        color="green"
      />

      <StatCard
        title="Hoàn thành"
        value={`${completionRate}%`}
        icon="✅"
        color="purple"
      />

      <StatCard
        title="Trung bình/giao dịch"
        value={formatCurrency(stats.avgDeliveryAmount)}
        icon="📈"
        color="orange"
      />
    </div>
  );
};
