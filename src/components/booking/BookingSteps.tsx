import React from "react";
import { Steps, Typography } from "antd";

const { Title } = Typography;

// Define booking steps
export const BOOKING_STEPS = [
  { title: "Chọn xe", description: "Chọn xe của bạn" },
  { title: "Thông tin đặt xe", description: "Nhập thông tin của bạn" },
  { title: "Thanh toán", description: "Hoàn tất đặt xe của bạn" },
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
      <Title level={2} className="text-center mb-8 mt-7">
        Chi tiết đặt xe
      </Title>
    </>
  );
};

export default BookingSteps;
