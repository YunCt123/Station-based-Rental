import React from "react";
import { Steps, Typography } from "antd";

const { Title } = Typography;

// Define booking steps
export const BOOKING_STEPS = [
  { title: "Vehicle Selection", description: "Choose your car" },
  { title: "Booking Details", description: "Enter your information" },
  { title: "Payment", description: "Complete your booking" },
];

interface BookingStepsProps {
  currentStep?: number;
}

const BookingSteps: React.FC<BookingStepsProps> = ({ currentStep = 1 }) => {
  return (
    <>
      <Steps
        current={currentStep}
        className="mb-8 !pt-15"
        items={BOOKING_STEPS}
      />
      <Title level={2} className="text-center mb-8">
        Booking Details
      </Title>
    </>
  );
};

export default BookingSteps;
