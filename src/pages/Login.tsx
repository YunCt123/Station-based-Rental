import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Select, Card, Typography, Divider, message } from "antd";
import { MailOutlined, LockOutlined, CarOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  phoneNumber?: string;
  dateOfBirth?: string;
  isVerified?: boolean;
}

interface LoginProps {
  onLogin: (userData: User) => void;
}

const Login = ({  }: LoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // Replace with your translation logic if needed
  const t = (key: string) => key;

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // Replace with your login API call
      // const res = await loginApi(values.email, values.password);
      // if (!res.tokens.accessToken) throw new Error("No access token");
      // localStorage.setItem("access_token", res.tokens.accessToken);
      // if (res.tokens.refreshToken) localStorage.setItem("refresh_token", res.tokens.refreshToken);
      // onLogin(res.user);
      // message.success(t("common.signInSuccess"));
      // const redirectPath = res.user.role === "admin" ? "/dashboard" : res.user.role === "staff" ? "/staff-dashboard" : "/";
      // navigate(redirectPath);
      message.success("Signed in successfully (mock)");
      navigate("/");
    } catch (err: any) {
      message.error(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, minHeight: "100vh", minWidth: "100vw", height: "100vh", width: "100vw", background: "linear-gradient(135deg, #36a2f5 0%, #7ee8a5 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: 0, padding: 0, zIndex: 9999 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ padding: 12, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <CarOutlined style={{ fontSize: 32, color: "#1677ff" }} />
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>EVRentals</span>
          </Link>
        </div>
        <Card style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
          <Card.Meta
            title={<Typography.Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>welcomeBack</Typography.Title>}
            description={<div style={{ textAlign: "center", marginBottom: 16 }}>signInToAccount</div>}
          />
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: 24 }}>
            <Form
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{ role: "user" }}
              autoComplete="off"
            >
              <Form.Item
                name="role"
                label={t("common.loginAs")}
                rules={[{ required: true, message: t("Please select a role") }]}
              >
                <Select>
                  <Select.Option value="user">customer</Select.Option>
                  <Select.Option value="staff">stationStaff</Select.Option>
                  <Select.Option value="admin">administrator</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[{ required: true, message: t("Please input your email!") }, { type: "email", message: t("Invalid email!") }]}
              >
                <Input prefix={<MailOutlined />} placeholder="john@example.com" autoComplete="email" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: t("Please input your password!") }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                  placeholder="Please enter your Password"
                  autoComplete="current-password"
                />
              </Form.Item>
              <div style={{ textAlign: "right", marginBottom: 16 }}>
                <Link to="/forgot-password">ForgotYourPassword</Link>
              </div>
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={isLoading} style={{ fontWeight: 600 }}>
                  {isLoading ? t("common.signingIn") : t("common.signIn")}
                </Button>
              </Form.Item>
            </Form>
            <Divider>{t("or")}</Divider>
            <Button icon={<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 18, marginRight: 8 }} />} block disabled style={{ marginBottom: 8 }}>
              {t("common.continueWithGoogle")}
            </Button>
            <Button icon={<img src="https://www.svgrepo.com/show/475700/facebook-color.svg" alt="Facebook" style={{ width: 18, marginRight: 8 }} />} block disabled>
              {t("common.continueWithFacebook")}
            </Button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ color: "#888" }}>{t("common.dontHaveAnAccount")} </span>
              <Link to="/register" style={{ color: "#1677ff", fontWeight: 500 }}>{t("common.signUpNow")}</Link>
            </div>
          </div>
        </Card>
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Typography.Text style={{ color: "#fff", opacity: 0.8, fontSize: 14 }}>{t("common.demoNote")}</Typography.Text>
        </div>
      </div>
    </div>
  );
};

export default Login;
