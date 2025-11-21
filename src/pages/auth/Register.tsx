import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { register as registerApi } from "@/services/authService";
import { isAuthenticated, getCurrentUser, getDefaultRouteForRole } from "@/utils/auth";
// import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  phoneNumber?: string;
  dateOfBirth?: string;
  isVerified?: boolean;
  // stationId?: string;
}

interface RegisterProps {
  onRegister: (userData: User) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Register = ({ onRegister: _onRegister }: RegisterProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Nếu đã đăng nhập thì chuyển hướng ra route mặc định theo role
  if (isAuthenticated()) {
    const authUser = getCurrentUser();
    const redirectPath = authUser ? getDefaultRouteForRole(authUser.role) : "/";
    return <Navigate to={redirectPath} replace />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      toast({
        title: t("register.agreementRequired"),
        description: t("register.agreeToTerms"),
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("register.passwordMismatch"),
        description: t("register.passwordsDoNotMatch"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
      };
      
      await registerApi(payload);
      
      // Theo docs: Registration successful, cần verify email
      toast({
        title: "Đăng ký thành công!",
        description: "Vui lòng kiểm tra email để xác thực tài khoản của bạn.",
        duration: 5000,
      });
      
      // Chuyển hướng đến trang verify email với email
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      
    } catch (err: unknown) {
      console.error("[Register] error:", err);
      let message = t("register.fillAllFields");
      
      if (err && typeof err === 'object') {
        if ('errors' in err) {
          const errorObj = err as { errors?: { phoneNumber?: { message?: string } } };
          message = errorObj.errors?.phoneNumber?.message || message;
        } else if ('message' in err) {
          message = (err as Error).message;
        } else if ('error' in err) {
          message = (err as { error: string }).error;
        } else if ('details' in err) {
          message = (err as { details: string }).details;
        }
      }
      
      toast({
        title: t("register.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        {/* <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="p-3 bg-white rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-lg">
              <Car className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-bold text-white">EVRentals</span>
          </Link>
        </div> */}

        {/* Register Card */}
        <Card className="shadow-premium">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Tạo tài khoản mới
            </CardTitle>
            <CardDescription className="text-center">
              Tham gia ngay hôm nay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nhập họ và tên của bạn"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10 text-black"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Địa chỉ email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="abc@gmail.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 text-black"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="09xxxxxxxx"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="pl-10 text-black"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Ngày sinh
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className="pl-10 text-black"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Xác nhận mật khẩu *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu của bạn"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="pl-10 pr-10 text-black"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) =>
                    setAgreeToTerms(checked as boolean)
                  }
                />
                <label htmlFor="terms" className="text-sm leading-relaxed">
                  {t("register.agreeToTermsText")}{" "}
                  <Link
                    to="/policy"
                    className="text-primary hover:text-primary-dark"
                  >
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link
                    to="/policy"
                    className="text-primary hover:text-primary-dark"
                  >
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full btn-hero"
                disabled={isLoading || !agreeToTerms}
              >
                {isLoading
                  ? "Đang tạo tài khoản"
                  : "Tạo tài khoản"}
              </Button>
            </form>

            <Separator />

            {/* Social Registration */}
            {/* <div className="space-y-3">
              <GoogleAuthButton 
                isRegistration={true}
                additionalInfo={{
                  phoneNumber: formData.phoneNumber.trim() || undefined,
                  dateOfBirth: formData.dateOfBirth || undefined
                }}
                onSuccess={(userData) => {
                  // Store user info and navigate
                  localStorage.setItem('userInfo', JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    avatar: userData.avatar,
                    role: userData.role
                  }));
                  
                  toast({
                    title: "Chào mừng!",
                    description: "Tài khoản Google của bạn đã được liên kết thành công.",
                  });
                  
                  const redirectPath = getDefaultRouteForRole(userData.role);
                  navigate(redirectPath);
                }}
              />
            </div> */}

            {/* Sign In Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Bạn đã có tài khoản?{" "}
              </span>
              <Link
                to="/login"
                className="text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Đăng nhập tại đây
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Note */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">{t("register.demoNote")}</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
