import React from "react";
import { Card, Typography, Spin, Divider } from "antd";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import type { Vehicle } from "../../types/vehicle";

const { Title, Text } = Typography;

interface PriceBreakdown {
  basePrice: number;
  insurancePrice: number;
  taxes: number;
  deposit: number;
  totalPrice: number;
  currency: string;
  details: {
    rawBase: number;
    peakMultiplier: number;
    weekendMultiplier: number;
    hours: number;
  };
}

interface VehicleSummaryProps {
  vehicle: Vehicle;
  priceBreakdown?: PriceBreakdown | null;
  loading?: boolean;
}

const VehicleSummary: React.FC<VehicleSummaryProps> = ({ vehicle, priceBreakdown, loading }) => {
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
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Base Price ({priceBreakdown.details.hours.toFixed(1)}h):</Text>
                <Text>${priceBreakdown.basePrice}</Text>
              </div>
              {priceBreakdown.insurancePrice > 0 && (
                <div className="flex justify-between">
                  <Text>Insurance:</Text>
                  <Text>${priceBreakdown.insurancePrice}</Text>
                </div>
              )}
              <div className="flex justify-between">
                <Text>Taxes (10%):</Text>
                <Text>${priceBreakdown.taxes}</Text>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between font-semibold">
                <Text strong>Total:</Text>
                <Text strong>${priceBreakdown.totalPrice}</Text>
              </div>
              <div className="flex justify-between text-green-600">
                <Text>Required Deposit:</Text>
                <Text strong>${priceBreakdown.deposit}</Text>
              </div>
              {priceBreakdown.details.peakMultiplier > 1 && (
                <Text type="warning" className="text-xs">
                  * Peak hours pricing applied ({priceBreakdown.details.peakMultiplier}x)
                </Text>
              )}
              {priceBreakdown.details.weekendMultiplier > 1 && (
                <Text type="warning" className="text-xs">
                  * Weekend pricing applied ({priceBreakdown.details.weekendMultiplier}x)
                </Text>
              )}
            </div>
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
