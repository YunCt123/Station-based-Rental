import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { loginWithGoogle } from '@/services/authService';
import type { AuthUser } from '@/services/authService';

interface GoogleAuthButtonProps {
  onSuccess: (userData: AuthUser) => void;
  isRegistration?: boolean;
  additionalInfo?: {
    phoneNumber?: string;
    dateOfBirth?: string;
  };
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ 
  onSuccess, 
  isRegistration = false,
  additionalInfo 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      console.log("🔥 [GoogleAuthButton] Starting Google authentication...");
      
      const result = await loginWithGoogle(additionalInfo);
      
      console.log("✅ [GoogleAuthButton] Google auth successful:", result.user);
      
      // Store user info
      localStorage.setItem('userInfo', JSON.stringify({
        name: result.user.name,
        email: result.user.email,
        avatar: result.user.avatar,
        role: result.user.role
      }));
      
      // Debug: Check what tokens we have now
      console.log("🔍 [GoogleAuthButton] Token status after login:", {
        accessToken: localStorage.getItem("access_token") ? "Available" : "Missing",
        firebaseToken: localStorage.getItem("firebase_token") ? "Available" : "Missing",
        userInfo: localStorage.getItem("userInfo") ? "Available" : "Missing"
      });
      
      onSuccess(result.user);
      
      toast({
        title: "Thành công!",
        description: isRegistration 
          ? "Tài khoản đã được tạo thành công với Google" 
          : "Đăng nhập Google thành công",
      });
      
    } catch (error: unknown) {
      console.error("💥 [GoogleAuthButton] Auth error:", error);
      
      let message = "Đã xảy ra lỗi khi đăng nhập với Google";
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as Error).message;
        if (errorMessage.includes("popup")) {
          message = "Popup đã bị chặn. Vui lòng cho phép popup và thử lại.";
        } else if (errorMessage.includes("network")) {
          message = "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
        }
      }
      
      // Check for API error response
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          message = apiError.response.data.message;
        }
      }
      
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      type="button"
      variant="outline" 
      className="w-full" 
      onClick={handleGoogleAuth}
      disabled={isLoading}
    >
      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {isLoading 
        ? "Đang xử lý..." 
        : isRegistration 
          ? "Đăng ký với Google" 
          : "Tiếp tục với Google"
      }
    </Button>
  );
};

export default GoogleAuthButton;