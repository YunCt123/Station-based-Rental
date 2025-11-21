// src/pages/rental/RentalPaymentResultPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Result, Button, Spin, Card, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { customerService, type Rental } from '../../../services/customerService';

const { Title, Paragraph } = Typography;

interface ResultState {
  status: "success" | "error" | "warning";
  title: string;
  subTitle: string;
  rentalId?: string;
  rental?: Rental; // Optional populated rental data
}

const RentalPaymentResultPage: React.FC = () => {
  const { id: rentalId } = useParams<{ id: string }>(); 
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<ResultState | null>(null);
  const [processed, setProcessed] = useState<boolean>(false); // Avoid multiple callback processing

  useEffect(() => {
    const processCallback = async () => {
      // Avoid processing callback multiple times
      if (processed || !rentalId) {
        console.log("[Rental FE] Callback already processed or missing rentalId, skipping");
        setLoading(false);
        return;
      }

      setProcessed(true);

      // 1. Extract all params from URL
      const rawParams: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        rawParams[key] = value;
      });

      if (!rawParams.vnp_TxnRef) {
        setResult({
          status: "error",
          title: "Thiếu thông tin giao dịch",
          subTitle: "Không tìm thấy mã giao dịch từ VNPAY.",
          rentalId,
        });
        setLoading(false);
        return;
      }

      try {
        // 2. Prepare payload with all vnp_* fields at root (no provider_metadata nesting)
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

        console.log("[Rental FE] Sending payload (all vnp_* at root):", payload);

        const callbackResult = await customerService.handleVnpayCallback(payload);

        console.log("[Rental FE] Backend result:", callbackResult);
        console.log("[Rental FE] vnp_ResponseCode:", rawParams.vnp_ResponseCode);

        // 4. Determine final result
        const isVnpaySuccess = rawParams.vnp_ResponseCode === "00";
        const isBackendSuccess = callbackResult.status === "SUCCESS";
        
        console.log("[Rental FE] isVnpaySuccess:", isVnpaySuccess);
        console.log("[Rental FE] isBackendSuccess:", isBackendSuccess);
        
        const finalSuccess = isBackendSuccess && isVnpaySuccess;

        // Optional: Fetch updated rental details
        let rentalData: Rental | undefined = undefined;
        try {
          rentalData = await customerService.getRentalDetail(rentalId);
        } catch (fetchError) {
          console.warn("[Rental FE] Failed to fetch rental details:", fetchError);
        }

        setResult({
          status: finalSuccess ? "success" : "error",
          title: finalSuccess ? "Thanh toán hoàn tất!" : "Thanh toán thất bại",
          subTitle: finalSuccess
            ? `Thuê xe ${rentalId} đã được hoàn tất. Bạn có thể xem chi tiết dưới đây.`
            : `Mã VNPay: ${rawParams.vnp_ResponseCode} ${rawParams.vnp_ResponseCode === "00" ? "(Thành công từ VNPAY nhưng lỗi backend)" : "(Lỗi từ VNPAY)"} - Backend: ${callbackResult.status}`,
          rentalId,
          rental: rentalData,
        });

      } catch (error: unknown) {
        console.error("[Rental FE] Callback processing error:", error);
        
        const isVnpaySuccess = rawParams.vnp_ResponseCode === "00";
        
        let errorMessage = "Hệ thống đang bận, vui lòng thử lại sau.";
        
        if (error instanceof Error) {
          errorMessage = error.message;
          
          if (error.message.includes("Rental validation failed")) {
            errorMessage = "Lỗi xác nhận thuê xe. Vui lòng liên hệ hỗ trợ.";
          } else if (error.message.includes("not a valid enum value")) {
            errorMessage = "Lỗi cấu hình hệ thống. Vui lòng liên hệ hỗ trợ.";
          }
        }
        
        if (isVnpaySuccess) {
          setResult({
            status: "warning",
            title: "Thanh toán thành công, đang xử lý hoàn tất",
            subTitle: `Thanh toán VNPAY đã thành công (Mã: ${rawParams.vnp_ResponseCode}). Hệ thống đang hoàn tất thuê xe của bạn. Vui lòng kiểm tra hoặc liên hệ hỗ trợ nếu cần.`,
            rentalId,
          });
        } else {
          setResult({
            status: "error",
            title: "Lỗi xử lý thanh toán",
            subTitle: errorMessage,
            rentalId,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [searchParams, processed, rentalId, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" tip="Đang xử lý kết quả thanh toán..." />
      </div>
    );
  }

  if (!result) return null;

  const handleViewRental = () => {
    if (result.rentalId) {
      navigate(`/my-rentals#${result.rentalId}`);
    } else {
      navigate('/dashboard/rentals');
    }
  };

  const handleContactSupport = () => {
    // Open support chat or email
    window.open('mailto:support@yourapp.com?subject=Issue with Rental Payment - ID: ' + result.rentalId, '_blank');
  };

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
              <Button 
                type="primary" 
                onClick={handleViewRental}
                disabled={!result.rentalId}
              >
                {result.status === "success" ? "Xem chi tiết thuê xe" : "Quay lại thuê xe"}
              </Button>
              <Button onClick={() => navigate('/my-rentals')}>
                Danh sách thuê xe
              </Button>
              {result.status !== "success" && (
                <Button onClick={handleContactSupport}>
                  Liên hệ hỗ trợ
                </Button>
              )}
            </div>
          }
        >
          <div className="text-center">
            {result.rentalId && (
              <Paragraph className="text-gray-600">
                <strong>Mã thuê xe:</strong> {result.rentalId}
                <br />
                {result.rental && (
                  <>
                    <strong>Phương tiện:</strong> {result.rental.vehicle_id?.name || 'Unknown Vehicle'}
                    <br />
                    <strong>Trạng thái:</strong> {result.rental.status}
                  </>
                )}
                <br />
                <br />
               Bạn sẽ nhận được email xác nhận qua địa chỉ đã đăng ký.
              </Paragraph>
            )}

            {result.status === "success" && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <Title level={5} className="text-green-800">Bước tiếp theo:</Title>
                <div className="text-left text-green-700">
                  <p>1. Kiểm tra email xác nhận hoàn tất thuê xe</p>
                  <p>4. Nhận hóa đơn chi tiết</p>
                </div>
              </div>
            )}

            {result.status === "error" && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <Title level={5} className="text-red-800">Hướng dẫn:</Title>
                <div className="text-left text-red-700">
                  <p>• Bạn có thể thử thanh toán lại từ trang thuê xe</p>
                  <p>• Không có khoản phí nào được trừ</p>
                  <p>• Liên hệ hỗ trợ nếu cần hỗ trợ thêm</p>
                </div>
              </div>
            )}
          </div>
        </Result>
      </Card>
    </div>
  );
};

export default RentalPaymentResultPage;