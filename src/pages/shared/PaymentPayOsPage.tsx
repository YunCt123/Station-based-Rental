/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/shared/PaymentPayOsPage.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button, Spin, Card } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import bookingService from "@/services/bookingService";

interface ResultState {
  status: "success" | "error";
  title: string;
  subTitle: string;
  bookingId?: string;
}

const PaymentPayOsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<ResultState | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      // 1. LẤY TOÀN BỘ PARAMS TỪ URL
      const rawParams: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        rawParams[key] = value;
      });

      // Kiểm tra PayOS params
      if (!rawParams.orderCode && !rawParams.id) {
        setResult({
          status: "error",
          title: "Thiếu thông tin giao dịch",
          subTitle: "Không tìm thấy mã đơn hàng từ PayOS.",
        });
        setLoading(false);
        return;
      }

      try {
        // 2. CHUẨN BỊ PAYLOAD → GỬI TOÀN BỘ params ở root
        const payload: any = {
          transaction_ref: rawParams.orderCode || rawParams.id,
          status: rawParams.status === "PAID" ? "SUCCESS" : "FAILED",
          provider: "PAYOS",
          amount: Number(rawParams.amount || 0) / 100,
          provider_payment_id: rawParams.id || rawParams.orderCode,

          // GỬI TOÀN BỘ PayOS params ở root để backend verify
          ...rawParams,
        };

        console.log("[FE] PayOS callback payload:", payload);

        // 3. GỌI SERVICE
        const callbackResult = await bookingService.handlePayOSCallback(payload);

        // 4. HIỂN THỊ KẾT QUẢ
        setResult({
          status: callbackResult.status === "SUCCESS" ? "success" : "error",
          title: callbackResult.status === "SUCCESS" ? "Thanh toán thành công!" : "Thanh toán thất bại",
          subTitle: callbackResult.status === "SUCCESS"
            ? `Mã đặt chỗ: ${callbackResult.bookingId || 'Đang xử lý'}`
            : `Mã lỗi: ${rawParams.code || 'N/A'} - Giao dịch đã bị hủy`,
          bookingId: callbackResult.bookingId,
        });
      } catch (error: any) {
        console.error("[FE] PayOS callback lỗi:", error);
        setResult({
          status: "error",
          title: "Lỗi xử lý thanh toán",
          subTitle: error.message || "Hệ thống đang bận, vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" tip="Đang xử lý thanh toán PayOS..." />
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <Result
          status={result.status === "success" ? "success" : "error"}
          icon={
            result.status === "success" ? (
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
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

export default PaymentPayOsPage;