/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { login as loginApi } from "@/services/authService";
import { isAuthenticated, getCurrentUser, getDefaultRouteForRole } from "@/utils/auth";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

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

const LoginPage = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Show message from verification redirect
  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: "Thành công",
        description: location.state.message,
      });
      
      // Pre-fill email if provided
      if (location.state?.email) {
        setEmail(location.state.email);
      }
      
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // Nếu đã đăng nhập thì chuyển hướng ra route mặc định theo role
  if (isAuthenticated()) {
    const authUser = getCurrentUser();
    const redirectPath = authUser ? getDefaultRouteForRole(authUser.role) : "/";
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await loginApi(email, password);
      console.debug("[Login] Login response:", res);
      console.debug("[Login] user.isVerified:", res.user.isVerified);
      
      // Check if user email is verified (now from BE response)
      if (!res.user.isVerified) {
        console.warn("[Login] User not verified according to login response");
        toast({
          title: "Email chưa được xác thực",
          description: "Vui lòng xác thực email trước khi đăng nhập.",
          variant: "destructive",
        });
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      
      console.log("[Login] Email verified, login successful");
      
      if (!res.tokens.accessToken) {
        console.error("[Login] Missing accessToken. Full response:", res);
        toast({
          title: "Lỗi",
          description: "Phản hồi từ máy chủ thiếu accessToken (kiểm tra console).",
          variant: "destructive",
        });
        return;
      }
      localStorage.setItem("access_token", res.tokens.accessToken);
      if (res.tokens.refreshToken)
        localStorage.setItem("refresh_token", res.tokens.refreshToken);
      onLogin(res.user);
      toast({
        title: "Chào mừng trở lại",
        description: "Đăng nhập thành công.",
      });
      const redirectPath =
        res.user.role === "admin"
          ? "/admin/dashboard"
          : res.user.role === "staff"
          ? "/staff/dashboard"
          : "/";
      navigate(redirectPath);
    } catch (err: any) {
      console.error("[Login] Auth error raw:", err);
      
      // Handle specific email verification errors
      if (err?.message?.includes('email not verified') || err?.message?.includes('Please verify your email')) {
        toast({
          title: "Email chưa được xác thực",
          description: "Vui lòng xác thực email trước khi đăng nhập.",
          variant: "destructive",
        });
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      
      toast({
        title: "Đăng nhập không thành công!",
        description: "Tài khoản hoặc mật khẩu không đúng.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-premium">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Chào mừng trở lại
            </CardTitle>
            <CardDescription className="text-center">
              Đăng nhập vào tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Địa chỉ email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 text-black"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 text-black"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full btn-hero"
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <Separator />

            <div className="space-y-3">
              <GoogleAuthButton 
                onSuccess={(userData) => {
                  onLogin(userData);
                  const redirectPath = getDefaultRouteForRole(userData.role);
                  navigate(redirectPath);
                }}
              />
              <Button variant="outline" className="w-full" disabled>
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Tiếp tục với Facebook
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Bạn chưa có tài khoản?{" "}
              </span>
              <Link
                to="/register"
                className="text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Đăng ký ngay
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Đây là tài khoản demo. Vui lòng không sử dụng thông tin cá nhân.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
