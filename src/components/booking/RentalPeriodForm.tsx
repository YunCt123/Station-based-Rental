import React from "react";
import { Form, Select, DatePicker, TimePicker, Card, Space } from "antd";
import { CalendarIcon } from "@heroicons/react/24/outline";

const { Option } = Select;
const { RangePicker } = DatePicker;

const RentalPeriodForm: React.FC = () => {
  return (
    <Card
      className="mb-4"
      title={
        <Space>
          <CalendarIcon className="h-5 w-5" />
          <span>Rental Period</span>
        </Space>
      }
    >
      <Form.Item name="rental_type" label="Rental Type">
        <Select>
          <Option value="daily">Daily Rental</Option>
          <Option value="hourly">Hourly Rental</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="rental_period"
        label="Rental Period"
        rules={[{ required: true, message: "Please select rental dates" }]}
      >
        <RangePicker className="w-full" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          name="rental_start_time"
          label="Start Time"
          rules={[{ required: true, message: "Please select start time" }]}
        >
          <TimePicker format="HH:mm" className="w-full" />
        </Form.Item>
        <Form.Item
          name="rental_end_time"
          label="End Time"
          rules={[{ required: true, message: "Please select end time" }]}
        >
          <TimePicker format="HH:mm" className="w-full" />
        </Form.Item>
      </div>
    </Card>
  );
};

export default RentalPeriodForm;
