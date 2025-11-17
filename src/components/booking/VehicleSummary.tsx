import React from "react";
import { Card, Typography, Spin, Divider } from "antd";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import type { Vehicle } from "../../types/vehicle";
import type { PriceBreakdown } from "../../services/bookingService";

const { Title, Text } = Typography;

interface VehicleSummaryProps {
  vehicle: Vehicle;
  priceBreakdown?: PriceBreakdown | null;
  loading?: boolean;
  insuranceSelected?: boolean; // ✅ Add prop to track insurance selection
}

const VehicleSummary: React.FC<VehicleSummaryProps> = ({ vehicle, priceBreakdown, loading, insuranceSelected = false }) => {
  
  // Debug log to see what priceBreakdown we receive
  console.log('🏷️ [VehicleSummary] Received priceBreakdown:', priceBreakdown);
  
  return (
    <>
      <Card className="sticky top-0">
        <div className="mb-4">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-40 object-cover rounded-lg"
          />
        </div>
        <Title level={4}>{vehicle.name}</Title>
        <Text type="secondary" className="block mb-2">
          {vehicle.type} <br/>
          {vehicle.seats} Chỗ ngồi
        </Text>

        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <Text>Giá theo ngày:</Text>
            <Text strong>
              {vehicle.pricePerDay.toLocaleString("vi-VN")}đ/ngày
            </Text>
          </div>
          <div className="flex justify-between mb-4">
            <Text>Giá theo giờ:</Text>
            <Text strong>
              {vehicle.pricePerHour.toLocaleString("vi-VN")}đ/giờ
            </Text>
          </div>

          {vehicle.features?.slice(0, 3).map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div> {feature}
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <Divider />
        <div className="mb-4">
            <Title level={5}>Tóm tắt đặt xe</Title>
          {loading ? (
            <div className="flex justify-center py-4">
              <Spin size="small" />
              <Text className="ml-2">Đang tính giá...</Text>
            </div>
          ) : priceBreakdown ? (
            (() => {
              // Calculate from new backend format (same logic as PaymentPage)
              const hours = priceBreakdown.details?.hours || 0;
              const basePrice = priceBreakdown.basePrice || 
                (priceBreakdown.hourly_rate || 0) * hours;
              const taxes = priceBreakdown.taxes || 
                Math.round(basePrice * 0.1);
              const insurance = (insuranceSelected && priceBreakdown.insurancePrice) ? priceBreakdown.insurancePrice : 0;
              const totalPrice = priceBreakdown.totalPrice || 
                (basePrice + taxes + insurance);
              const deposit = priceBreakdown.deposit || 
                Math.round(totalPrice * 0.2);
              
              return (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text>Giá ban đầu ({hours.toFixed(1)}h):</Text>
                    <Text>{basePrice.toLocaleString("vi-VN")}đ</Text>
                  </div>
                  {insurance > 0 && (
                    <div className="flex justify-between">
                      <Text>Bảo hiểm:</Text>
                      <Text>{insurance.toLocaleString("vi-VN")}đ</Text>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Text>Thuế (10%):</Text>
                    <Text>{taxes.toLocaleString("vi-VN")}đ</Text>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <Text strong>Tổng cộng:</Text>
                    <Text strong>{totalPrice.toLocaleString("vi-VN")}đ</Text>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <Text>Yêu cầu đặt cọc:</Text>
                    <Text strong>{deposit.toLocaleString("vi-VN")}đ</Text>
                  </div>
                  {(priceBreakdown.details?.peakMultiplier || 0) > 1 && (
                    <Text type="warning" className="text-xs">
                      * Peak hours pricing applied ({priceBreakdown.details?.peakMultiplier}x)
                    </Text>
                  )}
                  {(priceBreakdown.details?.weekendMultiplier || 0) > 1 && (
                    <Text type="warning" className="text-xs">
                      * Weekend pricing applied ({priceBreakdown.details?.weekendMultiplier}x)
                    </Text>
                  )}
                </div>
              );
            })()
          ) : (
            <Text type="secondary">Chọn thời gian thuê để xem giá</Text>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-start mt-4 p-2">
        <Link
          to="/vehicles"
          className="text-primary-500 hover:underline flex items-center gap-1"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Quay lại chọn xe</span>
        </Link>
      </div>
    </>
  );
};

export default VehicleSummary;
