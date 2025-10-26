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
          {`${vehicle.type} • ${vehicle.seats} Seats`}
        </Text>

        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <Text>Daily Rate:</Text>
            <Text strong>${vehicle.pricePerDay}/day</Text>
          </div>
          <div className="flex justify-between mb-4">
            <Text>Hourly Rate:</Text>
            <Text strong>${vehicle.pricePerHour}/hour</Text>
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
          <Title level={5}>Booking Summary</Title>
          {loading ? (
            <div className="flex justify-center py-4">
              <Spin size="small" />
              <Text className="ml-2">Calculating price...</Text>
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
                    <Text>Base Price ({hours.toFixed(1)}h):</Text>
                    <Text>${basePrice.toFixed(2)}</Text>
                  </div>
                  {insurance > 0 && (
                    <div className="flex justify-between">
                      <Text>Insurance:</Text>
                      <Text>${insurance.toFixed(2)}</Text>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Text>Taxes (10%):</Text>
                    <Text>${taxes.toFixed(2)}</Text>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <Text strong>Total:</Text>
                    <Text strong>${totalPrice.toFixed(2)}</Text>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <Text>Required Deposit:</Text>
                    <Text strong>${deposit.toFixed(2)}</Text>
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
            <Text type="secondary">Select rental period to see pricing</Text>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-start mt-4 p-2">
        <Link
          to="/vehicles"
          className="text-primary-500 hover:underline flex items-center gap-1"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Vehicle Selection</span>
        </Link>
      </div>
    </>
  );
};

export default VehicleSummary;
