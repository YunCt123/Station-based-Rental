import React from "react";
import { Link } from "react-router-dom";
import { CarOutlined, MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { Form, Input, Button, Card, Select, Typography } from "antd";

const { Title, Text } = Typography;

const Register: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #38a3fd 0%, #6fd6b6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <CarOutlined style={{ fontSize: 40, color: "#1677ff", background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 2px 8px #0001" }} />
          <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginTop: 8 }}>EVRentals</div>
        </div>
        <Card>
          <Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>
            Sign Up
          </Title>
          <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 24 }}>
            Create your account to get started
          </Text>
          <Form layout="vertical">
            <Form.Item
              label="Role"
              name="role"
              initialValue="customer"
              rules={[{ required: true, message: "Please select your role" }]}
            >
              <Select>
                <Select.Option value="customer">Customer</Select.Option>
                <Select.Option value="staff">Station Staff</Select.Option>
                <Select.Option value="admin">Administrator</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Your name" />
            </Form.Item>
            <Form.Item
              label="Email address"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="john@example.com" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
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
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm your password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Sign Up
              </Button>
            </Form.Item>
          </Form>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Text type="secondary">Already have an account? </Text>
            <Link to="/login">Sign In</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;