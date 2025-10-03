import React from "react";
import { Link } from "react-router-dom";
import {
  CarOutlined,
  MailOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Form, Input, Button, Card, Select, Typography } from "antd";

const { Title, Text } = Typography;

const Register: React.FC = () => {
  return (
    <div style={{ position: "fixed", inset: 0, minHeight: "100vh", minWidth: "100vw", height: "100vh", width: "100vw", background: "linear-gradient(135deg, #36a2f5 0%, #7ee8a5 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: 0, padding: 0, zIndex: 9999,  overflow: "hidden", }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

     

      <Card
        style={{
          width: 540, // rộng hơn nữa
          marginTop: 96, // header cách xa hơn
          marginBottom: 64, // footer cách xa hơn
          borderRadius: 14,
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        }}
      >
        {/* Logo + Tên brand */}
  <div style={{ textAlign: "center", marginBottom: 16 }}>
    <Link
    to="/"
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      textDecoration: "none",
    }}
  >
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          padding: 12,
          background: "#f5f9ff",
          borderRadius: 16,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <CarOutlined style={{ fontSize: 32, color: "#1677ff" }} />
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color: "#1677ff" }}>
        EV Rentals
      </span>
    </div>
    </Link>
  </div>

        <Title level={3} style={{ textAlign: "center", marginBottom: 4 }}>
          Create Account
        </Title>
        <Text
          type="secondary"
          style={{ display: "block", textAlign: "center", marginBottom: 20 }}
        >
          Sign up to get started
        </Text>

        <Form
          layout="vertical"
          size="large"
          style={{ marginTop: 8 }}
          requiredMark={false}
        >
          <Form.Item
            label="Role:"
            name="role"
            initialValue="customer"
            rules={[{ required: true, message: "Please select your role" }]}
            style={{ marginBottom: 8 }}
            

          >
            <Select>
              <Select.Option value="customer">Customer</Select.Option>
              <Select.Option value="staff">Station Staff</Select.Option>
              <Select.Option value="admin">Administrator</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Name:"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
            style={{ marginBottom: 8 }}
            required
          >
            <Input prefix={<UserOutlined />} placeholder="Your name" />
          </Form.Item>

          <Form.Item
            label="Email:"
            name="email"
            required
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
            style={{ marginBottom: 8 }}
          >
            <Input prefix={<MailOutlined />} placeholder="john@example.com" />
          </Form.Item>

          <Form.Item
            label="Password:"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
            style={{ marginBottom: 8 }}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password:"
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
            style={{ marginBottom: 12 }}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 12, marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block size="large">
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text type="secondary">Already have an account? </Text>
          <Link to="/login" style={{ fontWeight: 500 }}>
            Sign In
          </Link>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default Register;
