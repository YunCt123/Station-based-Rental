import React from "react";
import { Card, Typography } from "antd";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const { Title, Text } = Typography;

interface Vehicle {
  id: string;
  name: string;
  type: string;
  seats: number;
  dailyRate: number;
  hourlyRate: number;
  image: string;
  features?: string[];
}

interface VehicleSummaryProps {
  vehicle: Vehicle;
}

const VehicleSummary: React.FC<VehicleSummaryProps> = ({ vehicle }) => {
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
            <Text strong>${vehicle.dailyRate}/day</Text>
          </div>
          <div className="flex justify-between mb-4">
            <Text>Hourly Rate:</Text>
            <Text strong>${vehicle.hourlyRate}/hour</Text>
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
