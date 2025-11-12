import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyEmail, resendVerification } from "@/services/authService";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
    
    // Check if email is already verified
    const checkVerificationStatus = async () => {
      if (email) {
        try {
          const { checkVerificationStatus } = await import('@/services/authService');
          const status = await checkVerificationStatus(email);
          
          if (status.isVerified) {
            toast({
              title: "Email đã được xác thực",
              description: "Tài khoản của bạn đã được kích hoạt. Đang chuyển đến trang đăng nhập...",
            });
            
            setTimeout(() => {
              navigate('/login', { 
                state: { 
                  message: 'Email đã được xác thực. Vui lòng đăng nhập.',
                  email: email 
                } 
              });
            }, 2000);
          }
        } catch (error) {
          console.log('Could not check verification status:', error);
          // Continue normally if check fails
        }
      }
    };
    
    checkVerificationStatus();
  }, [email, navigate, toast]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all fields filled
    if (newCode.every(digit => digit !== '') && value) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (submissionCode?: string) => {
    const verificationCode = submissionCode || code.join('');
    
    if (verificationCode.length !== 6) {
      toast({
        title: "Mã không hợp lệ",
        description: "Vui lòng nhập đủ 6 chữ số",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmail({ code: verificationCode });
      
      // Update user info in localStorage to reflect verified status
      if (result.user) {
        const existingUser = localStorage.getItem('user');
        if (existingUser) {
          const userData = JSON.parse(existingUser);
          const updatedUser = {
            ...userData,
            isVerified: true,
            email_verified: true
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          // If no existing user, store the verified user
          localStorage.setItem('user', JSON.stringify(result.user));
        }
      }
      
      toast({
        title: "Xác thực thành công!",
        description: "Tài khoản của bạn đã được kích hoạt.",
      });
      
      // Redirect to login page
      navigate('/login', { 
        state: { 
          message: 'Email đã được xác thực. Vui lòng đăng nhập.',
          email: email 
        } 
      });
      
    } catch (error: unknown) {
      console.error('Email verification failed:', error);
      
      let errorMessage = "Xác thực thất bại. Vui lòng thử lại.";
      if (error instanceof Error) {
        if (error.message?.includes('Invalid verification code')) {
          errorMessage = "Mã xác thực không đúng. Vui lòng kiểm tra lại.";
        } else if (error.message?.includes('expired')) {
          errorMessage = "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.";
        } else if (error.message?.includes('Maximum verification attempts')) {
          errorMessage = "Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới.";
        }
      }
      
      toast({
        title: "Xác thực thất bại",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Clear the code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    console.log('🔄 [VerifyEmail] Manual resend requested for:', email);
    setIsResending(true);
    try {
      await resendVerification({ email });
      
      toast({
        title: "Đã gửi lại mã",
        description: "Mã xác thực mới đã được gửi đến email của bạn.",
      });
      
      setResendCooldown(60); // 60 seconds cooldown
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
    } catch (error: unknown) {
      console.error('💥 [VerifyEmail] Resend failed:', error);
      
      let errorMessage = "Không thể gửi lại mã. Vui lòng thử lại.";
      if (error instanceof Error) {
        if (error.message?.includes('Email is already verified')) {
          // Email already verified - redirect to login
          toast({
            title: "Email đã được xác thực",
            description: "Tài khoản của bạn đã được kích hoạt. Đang chuyển đến trang đăng nhập...",
          });
          
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Email đã được xác thực. Vui lòng đăng nhập.',
                email: email 
              } 
            });
          }, 2000);
          return;
        } else if (error.message?.includes('Too many verification emails')) {
          errorMessage = "Đã gửi quá nhiều email. Vui lòng thử lại sau.";
        }
      }
      
      toast({
        title: "Lỗi gửi lại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedText.length === 6) {
      const newCode = pastedText.split('');
      setCode(newCode);
      // Auto submit on paste
      handleSubmit(pastedText);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-premium">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Xác thực Email
            </CardTitle>
            <CardDescription className="text-center">
              Chúng tôi đã gửi mã 6 chữ số đến
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <Label className="text-center block">Nhập mã xác thực</Label>
                <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold border-2"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full btn-hero"
                disabled={isLoading || code.some(digit => digit === '')}
              >
                {isLoading ? "Đang xác thực..." : "Xác thực"}
              </Button>
            </form>

            {/* Resend Section */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Không nhận được email?
              </p>
              
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 
                  ? `Gửi lại sau ${resendCooldown}s`
                  : isResending 
                    ? "Đang gửi..." 
                    : "Gửi lại mã"
                }
              </Button>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Kiểm tra thư mục spam/junk</p>
                <p>• Đảm bảo email chính xác</p>
                <p>• Mã có hiệu lực trong 24 giờ</p>
              </div>
            </div>

            {/* Back to Register */}
            <div className="text-center">
              <Link
                to="/register"
                className="inline-flex items-center text-sm text-primary hover:text-primary-dark transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Quay lại đăng ký
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Gặp sự cố? Liên hệ{" "}
            <a href="mailto:support@evstation.com" className="text-white underline">
              support@evstation.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;