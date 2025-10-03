import React from "react";
import { Form, Input, Card, Space } from "antd";
import { UserIcon } from "@heroicons/react/24/outline";

const CustomerInformationForm: React.FC = () => {
  return (
    <Card
      className="mb-4"
      title={
        <Space>
          <UserIcon className="h-5 w-5" />
          <span>Customer Information</span>
        </Space>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name="full_name"
          label="Full Name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="email@example.com" />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: "Please enter your phone number" },
          ]}
        >
          <Input placeholder="+1 (XXX) XXX-XXXX" />
        </Form.Item>

        <Form.Item
          name="license_number"
          label="Driver's License Number"
          rules={[
            { required: true, message: "Please enter your license number" },
          ]}
        >
          <Input placeholder="License number" />
        </Form.Item>
      </div>
    </Card>
  );
};

export default CustomerInformationForm;
