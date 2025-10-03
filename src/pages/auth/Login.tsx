import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Select, Card, Typography, Divider, message } from "antd";
import { MailOutlined, LockOutlined, CarOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";



const Login = () => {
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
                label="Login As"
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
                <Link to="/forgot-password">ForgotYourPassword?</Link>
              </div>
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={isLoading} style={{ fontWeight: 600 }}>
                  {isLoading ? t("common.signingIn") : t("common.signIn")}
                </Button>
              </Form.Item>
            </Form>
            <Divider>{t("or")}</Divider>
            <Button icon={<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 18, marginRight: 8 }} />} block disabled style={{ marginBottom: 8 }}>
             Continue With Google
            </Button>
            <Button icon={<img src="data:image/png;base64,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" alt="Facebook" style={{ width: 18, marginRight: 8 }} />} block disabled>
              Continue With Facebook
            </Button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ color: "#888" }}>dontHaveAnAccount </span>
              <Link to="/register" style={{ color: "#1677ff", fontWeight: 500 }}>{t("common.signUpNow")}</Link>
            </div>
          </div>
        </Card>
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Typography.Text style={{ color: "#fff", opacity: 0.8, fontSize: 14 }}>demoNote</Typography.Text>
        </div>
      </div>
    </div>
  );
};

export default Login;
