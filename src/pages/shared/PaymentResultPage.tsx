// src/pages/shared/PaymentResultPage.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button, Spin, Card } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import bookingService from "@/services/bookingService";

interface ResultState {
  status: "success" | "error" | "warning";
  title: string;
  subTitle: string;
  bookingId?: string;
}

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true); // ĐÃ SỬA: => → =
  const [result, setResult] = useState<ResultState | null>(null);
  const [processed, setProcessed] = useState<boolean>(false); // Tránh call callback nhiều lần

  useEffect(() => {
    const processCallback = async () => {
      // Tránh xử lý callback nhiều lần
      if (processed) {
        console.log("[FE] Callback đã được xử lý, bỏ qua");
        return;
      }

      setProcessed(true);
      // 1. LẤY TOÀN BỘ PARAMS TỪ URL
      const rawParams: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        rawParams[key] = value;
      });

      if (!rawParams.vnp_TxnRef) {
        setResult({
          status: "error",
          title: "Thiếu thông tin giao dịch",
          subTitle: "Không tìm thấy mã giao dịch từ VNPAY.",
        });
        setLoading(false);
        return;
      }

      try {
        // 2. GỬI TOÀN BỘ vnp_* Ở ROOT → KHÔNG DÙNG provider_metadata
        const payload = {
          transaction_ref: rawParams.vnp_TxnRef,
          status: rawParams.vnp_ResponseCode === "00" ? "SUCCESS" as const : "FAILED" as const,
          provider: "VNPAY_SANDBOX",
          amount: Number(rawParams.vnp_Amount || 0) / 100,
          provider_payment_id: rawParams.vnp_TransactionNo || null,

          // Required VNPay fields
          vnp_SecureHash: rawParams.vnp_SecureHash,
          vnp_TxnRef: rawParams.vnp_TxnRef, 
          vnp_ResponseCode: rawParams.vnp_ResponseCode,
          vnp_Amount: rawParams.vnp_Amount,
          vnp_TransactionNo: rawParams.vnp_TransactionNo,
          vnp_BankCode: rawParams.vnp_BankCode,
          vnp_OrderInfo: rawParams.vnp_OrderInfo,
          vnp_PayDate: rawParams.vnp_PayDate,
          vnp_TmnCode: rawParams.vnp_TmnCode,
          vnp_TransactionStatus: rawParams.vnp_TransactionStatus,
          vnp_CardType: rawParams.vnp_CardType,

          // Any additional vnp_* fields
          ...Object.fromEntries(
            Object.entries(rawParams).filter(([key]) => key.startsWith('vnp_'))
          ),
        };

        console.log("[FE] Gửi payload (toàn bộ vnp_* ở root):", payload);

        // 3. GỌI SERVICE  
        const callbackResult = await bookingService.handleVnpayCallback(payload);

        console.log("[FE] Kết quả từ backend:", callbackResult);
        console.log("[FE] vnp_ResponseCode:", rawParams.vnp_ResponseCode);
        console.log("[FE] callbackResult.status:", callbackResult.status);

        // 4. HIỂN THỊ KẾT QUẢ
        // VNPay: mã 00 = thành công, khác 00 = thất bại
        const isVnpaySuccess = rawParams.vnp_ResponseCode === "00";
        const isBackendSuccess = callbackResult.status === "SUCCESS";
        
        console.log("[FE] isVnpaySuccess:", isVnpaySuccess);
        console.log("[FE] isBackendSuccess:", isBackendSuccess);
        
        // Ưu tiên kết quả từ backend, nhưng kiểm tra cả VNPay code
        const finalSuccess = isBackendSuccess && isVnpaySuccess;
        
        setResult({
          status: finalSuccess ? "success" : "error",
          title: finalSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại",
          subTitle: finalSuccess
            ? `Mã đặt chỗ: ${callbackResult.bookingId || 'Đang xử lý'}`
            : `Mã VNPay: ${rawParams.vnp_ResponseCode} ${rawParams.vnp_ResponseCode === "00" ? "(Thành công từ VNPay nhưng lỗi backend)" : "(Lỗi từ VNPay)"} - Backend: ${callbackResult.status}`,
          bookingId: callbackResult.bookingId,
        });
      } catch (error: unknown) {
        console.error("[FE] Lỗi xử lý callback:", error);
        
        // Kiểm tra nếu VNPay thành công nhưng backend lỗi
        const isVnpaySuccess = rawParams.vnp_ResponseCode === "00";
        
        let errorMessage = "Hệ thống đang bận, vui lòng thử lại sau.";
        
        if (error instanceof Error) {
          errorMessage = error.message;
          
          // Xử lý lỗi cụ thể từ backend
          if (error.message.includes("Rental validation failed")) {
            errorMessage = "Lỗi hệ thống: Không thể tạo booking. Vui lòng liên hệ hỗ trợ.";
          } else if (error.message.includes("not a valid enum value")) {
            errorMessage = "Lỗi cấu hình hệ thống. Vui lòng liên hệ hỗ trợ.";
          }
        }
        
        // Nếu VNPay thành công nhưng backend lỗi
        if (isVnpaySuccess) {
          setResult({
            status: "warning",
            title: "Thanh toán thành công, đang xử lý đặt chỗ",
            subTitle: `Thanh toán VNPay đã thành công (Mã: ${rawParams.vnp_ResponseCode}). Hệ thống đang xử lý đặt chỗ của bạn. Vui lòng kiểm tra email hoặc liên hệ hỗ trợ nếu cần.`,
          });
        } else {
          setResult({
            status: "error",
            title: "Lỗi xử lý thanh toán",
            subTitle: errorMessage,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [searchParams, processed]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" tip="Đang xử lý thanh toán..." />
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <Result
          status={
            result.status === "success" ? "success" : 
            result.status === "warning" ? "warning" : "error"
          }
          icon={
            result.status === "success" ? (
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
            ) : result.status === "warning" ? (
              <ExclamationCircleOutlined style={{ color: "#faad14" }} />
            ) : (
              <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
            )
          }
          title={result.title}
          subTitle={result.subTitle}
          extra={
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              {result.bookingId && (
                <Button type="primary" onClick={() => navigate(`/bookings/${result.bookingId}`)}>
                  Xem chi tiết đặt chỗ
                </Button>
              )}
              <Button onClick={() => window.location.reload()}>Tải lại</Button>
              <Button onClick={() => navigate("/")}>Về trang chủ</Button>
            </div>
          }
        />
      </Card>
    </div>
  );
};

export default PaymentResultPage;