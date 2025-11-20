/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  Link,
} from "react-router-dom";
import { Form, message, Spin, Card, Button, Modal, Alert } from "antd";
import { UserOutlined, LoginOutlined, SafetyCertificateOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { bookingService, type PriceBreakdown } from "../../services/bookingService";
import { vehicleService } from "../../services/vehicleService";
import { userService } from "../../services/userService";
import type { Vehicle } from "../../types/vehicle";
import { getCurrentUser, isUserVerified, getVerificationStatusMessage } from "../../utils/auth";
import { useAutoRefreshUser } from "../../hooks/useAutoRefreshUser";
import { useActiveRental } from "../../hooks/customer/useActiveRental";

// Components
import BookingSteps from "../../components/booking/BookingSteps";
import RentalPeriodForm from "../../components/booking/RentalPeriodForm";
// import CustomerInformationForm from "../../components/booking/CustomerInformationForm";
import InsuranceAndTermsForm from "../../components/booking/InsuranceAndTermsForm";
import VehicleSummary from "../../components/booking/VehicleSummary";

// interface DocumentUploadStatus {
//   status: "not_started" | "uploading" | "success" | "error";
// }

// Helper function to translate rental status to Vietnamese
const translateRentalStatus = (status: string): string => {
  switch (status) {
    case 'CONFIRMED':
      return 'ĐANG CHỜ LẤY XE';
    case 'ONGOING':
      return 'ĐANG SỬ DỤNG XE';
    case 'RETURN_PENDING':
      return 'CHỜ THANH TOÁN CUỐI';
    case 'COMPLETED':
      return 'HOÀN THÀNH';
    case 'CANCELLED':
      return 'ĐÃ HỦY';
    case 'REJECTED':
      return 'BỊ TỪ CHỐI';
    default:
      return status; // Fallback to original status
  }
};

const BookingPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [searchParams] = useSearchParams();
  const stationId = searchParams.get("stationId") ?? undefined;

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [loading, setLoading] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [user, setUser] = useState(() => getCurrentUser());
  const [showActiveRentalWarning, setShowActiveRentalWarning] = useState(false);

  // Active rental check
  const { activeRental, checkActive } = useActiveRental();

  // Auto-refresh user data when component mounts
  useAutoRefreshUser(setUser);

  // Function to refresh user data from API
  const refreshUserData = async () => {
    try {
      console.log('🔄 [BookingPage] Làm mới dữ liệu người dùng từ API...');
      const freshUserData = await userService.getCurrentUser();
      console.log('✅ [BookingPage] Nhận dữ liệu người dùng mới:', freshUserData);
      
      // Map UserProfile to User format for compatibility
      const mappedUser = {
        id: freshUserData._id,
        name: freshUserData.name,
        email: freshUserData.email,
        role: freshUserData.role,
        phoneNumber: freshUserData.phoneNumber,
        dateOfBirth: freshUserData.dateOfBirth,
        isVerified: freshUserData.isVerified,
        licenseNumber: freshUserData.licenseNumber,
        licenseExpiry: freshUserData.licenseExpiry ? new Date(freshUserData.licenseExpiry) : undefined,
        licenseClass: freshUserData.licenseClass,
        idCardFront: freshUserData.idCardFront,
        idCardBack: freshUserData.idCardBack,
        driverLicense: freshUserData.driverLicense,
        selfiePhoto: freshUserData.selfiePhoto,
        verificationStatus: freshUserData.verificationStatus,
        rejectionReason: freshUserData.rejectionReason,
        verifiedBy: freshUserData.verifiedBy,
        verifiedAt: freshUserData.verifiedAt ? new Date(freshUserData.verifiedAt) : undefined,
      };
      
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(mappedUser));
      setUser(mappedUser);
      
    } catch (error) {
      console.error('❌ [BookingPage] Không thể làm mới dữ liệu người dùng:', error);
      message.error('Không thể làm mới dữ liệu người dùng. Vui lòng thử đăng nhập lại.');
    }
  };

  // ---- Pricing ----
  const calculatePrice = useCallback(
    async (formDataOrStartAt: Record<string, unknown> | string, endAt?: string, insurancePremium = false) => {
      console.log('🚀 [BookingPage] Tính giá được gọi với:', { 
        formDataOrStartAt, 
        endAt, 
        insurancePremium, 
        vehicleId,
        timestamp: new Date().toISOString()
      });
      
      if (!vehicleId) {
        console.warn('❌ [BookingPage] Không có vehicleId, bỏ qua tính giá');
        return;
      }
      
      // Add small delay to debounce rapid calls
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        setCalculatingPrice(true);
        
        let priceRequest;
        
        // Check if called with form data (object) or legacy startAt/endAt strings
        if (typeof formDataOrStartAt === 'object' && formDataOrStartAt !== null) {
          // New way: format from form data
          console.log('🔍 [BookingPage] Trích xuất bảo hiểm từ dữ liệu form:', formDataOrStartAt);
          const formData = { ...formDataOrStartAt, vehicleId };
          priceRequest = bookingService.formatPriceCalculationRequest(formData);
        } else {
          // Legacy way: direct startAt/endAt
          priceRequest = { 
            vehicleId, 
            startAt: formDataOrStartAt, 
            endAt: endAt!, 
            insurancePremium 
          };
        }
        
        console.log('📤 [BookingPage] Gửi yêu cầu tính giá:', priceRequest);
        
        const pricing = await bookingService.calculatePrice(priceRequest);
        console.log('📥 [BookingPage] Nhận phản hồi tính giá:', pricing);
        
        setPriceBreakdown(pricing);
        console.log('✅ [BookingPage] Đặt giá thành công');
      } catch (error) {
        console.error("💥 [BookingPage] Lỗi tính giá:", error);
      } finally {
        setCalculatingPrice(false);
        console.log('🏁 [BookingPage] Hoàn tất tính giá');
      }
    },
    [vehicleId]
  );

  // Auth watcher
  useEffect(() => {
    const checkAuthState = () => {
      const currentUser = getCurrentUser();
      console.log('🔍 [BookingPage] Kiểm tra trạng thái xác thực:', {
        user: currentUser,
        verificationStatus: currentUser?.verificationStatus,
        isVerified: currentUser?.isVerified,
        isUserVerified: isUserVerified(currentUser),
        timestamp: new Date().toISOString()
      });
      setUser(currentUser);
    };
    checkAuthState();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "access_token") {
        console.log('📢 [BookingPage] Thay đổi lưu trữ:', e.key);
        checkAuthState();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Load vehicle + initial price
  useEffect(() => {
    const loadVehicle = async () => {
      if (!vehicleId) {
        message.error("Yêu cầu ID xe");
        navigate("/vehicles");
        return;
      }
      try {
        setLoadingVehicle(true);
        const vehicleData = await vehicleService.getVehicleById(vehicleId);
        setVehicle(vehicleData);

        // Calculate initial price based on default form values (daily rental)
        const now = dayjs();
        const tomorrow = now.add(1, "day");
        const dayAfterTomorrow = tomorrow.add(1, "day");
        const pickupTime = dayjs("09:00:00", "HH:mm:ss");
        
        const initialFormData = {
          rental_type: "daily",
          rental_period: [tomorrow, dayAfterTomorrow],
          rental_start_time: pickupTime,
          vehicleId,
          insurance_premium: false
        };
        
        console.log('🔧 [BookingPage] Tính giá ban đầu với thuê theo ngày mặc định:', initialFormData);
        await calculatePrice(initialFormData);
      } catch (error) {
        console.error("Lỗi tải xe:", error);
        message.error("Không thể tải thông tin xe. Vui lòng thử lại.");
        navigate("/vehicles");
      } finally {
        setLoadingVehicle(false);
      }
    };
    loadVehicle();
  }, [vehicleId, navigate, calculatePrice]);

  // ---- Submit ----
  const handleFinish = async (values: Record<string, any>) => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    
    // ✅ Check verification status before allowing booking
    if (!isUserVerified(user)) {
      message.error("Tài khoản của bạn cần được xác minh trước khi đặt xe");
      navigate("/settings");
      return;
    }

    // 🚫 CHECK ACTIVE RENTAL BEFORE BOOKING (One Active Rental Per User Rule)
    console.log('🔍 [BookingPage] Checking for active rental before creating booking...');
    try {
      const activeCheck = await checkActive();
      
      if (activeCheck.hasActiveRental && activeCheck.activeRental) {
        console.warn('🚫 [BookingPage] User has active rental, blocking new booking');
        console.log('🔍 [BookingPage] Active rental structure:', JSON.stringify(activeCheck.activeRental, null, 2));
        console.log('🔍 [BookingPage] Vehicle data:', activeCheck.activeRental.vehicle_id);
        console.log('🔍 [BookingPage] Booking data:', activeCheck.activeRental.booking_id);
        
        
        // Show rental info and redirect option
        setShowActiveRentalWarning(true);
        return;
      }
      
      console.log('✅ [BookingPage] Active rental check passed, proceeding with booking creation');
    } catch (error) {
      console.error('❌ [BookingPage] Error checking active rental:', error);
      // Continue with booking creation even if check fails
    }
    
    if (!vehicleId) {
      message.error("Yêu cầu ID xe để đặt");
      return;
    }

    try {
      setLoading(true);

      // Use station_id from vehicle data instead of URL parameter
      const vehicleStationId = vehicle?.stationId || vehicle?.stationId;
      const finalStationId: string = vehicleStationId || stationId || "default-station-id";

      console.log("=== DEBUG STATION ===");
      console.log("stationId từ URL:", stationId);
      console.log("station_id từ xe:", vehicle?.stationId);
      console.log("stationId cuối cùng:", finalStationId);

      const formValues = {
        ...values,
        stationId: finalStationId,
        vehicleId,
      };

      console.log("=== DEBUG DỮ LIỆU FORM ===");
      console.log("Giá trị form thô:", JSON.stringify(values, null, 2));
      console.log("Giá trị form cuối cùng:", JSON.stringify(formValues, null, 2));

      const bookingRequest = bookingService.formatBookingRequest(formValues);
      console.log("Yêu cầu đặt xe đã định dạng:", JSON.stringify(bookingRequest, null, 2));
      
      const booking = await bookingService.createBooking(bookingRequest);

      message.success("Đặt xe thành công! Vui lòng tiếp tục thanh toán.");
      navigate(`/payment?bookingId=${booking._id}`);
    } catch (error: unknown) {
      console.error("Lỗi tạo đặt xe:", error);
      const e = error as { response?: { status?: number }; message?: string };
      
      // 🚫 Handle 409 Conflict (User has active rental) - Fallback if frontend check missed it
      if (e?.response?.status === 409) {
        // Refresh active rental data and show warning modal
        await checkActive();
        setShowActiveRentalWarning(true);
        return;
      }
      
      if (
        e?.response?.status === 401 ||
        (e?.message &&
          (e.message.includes("unauthorized") ||
            e.message.includes("authentication")))
      ) {
        message.error("Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại.");
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      message.error(
        e?.message || "Không thể tạo đặt xe. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---- Login required ----
  const LoginRequiredComponent = () => (
    <div className="max-w-md mx-auto mt-8">
      <Card className="text-center p-6">
        <UserOutlined className="text-4xl text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold mb-4">Yêu cầu đăng nhập</h2>
        <p className="text-gray-600 mb-6">
          Bạn cần đăng nhập để thực hiện đặt xe. Vui lòng đăng nhập hoặc tạo tài khoản để tiếp tục.
        </p>
        <div className="space-x-4">
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate("/login", { state: { from: location.pathname } })}
          >
            Đăng nhập
          </Button>
          <Button onClick={() => navigate("/register", { state: { from: location.pathname } })}>
            Tạo tài khoản
          </Button>
        </div>
      </Card>
    </div>
  );

  // ---- Verification required ----
  const VerificationRequiredComponent = () => (
    <div className="max-w-md mx-auto mt-8">
      <Card className="text-center p-6">
        <SafetyCertificateOutlined className="text-4xl text-orange-500 mb-4" />
        <h2 className="text-xl font-semibold mb-4">Xác minh tài khoản</h2>
        <p className="text-gray-600 mb-4">
          Tài khoản của bạn cần được xác minh trước khi thực hiện đặt xe.
        </p>
        
        
        <div className="mb-6">
          <p className="text-sm font-medium">
            Lý do: <span className={`${
              user?.verificationStatus === 'REJECTED' ? 'text-red-600' :
              user?.verificationStatus === 'PENDING' ? 'text-orange-600' : 'text-gray-600'
            }`}>
              {getVerificationStatusMessage(user)}
            </span>
          </p>
        </div>
        <div className="space-x-4">
          {user?.verificationStatus === 'REJECTED' || user?.verificationStatus === 'PENDING' ? (
            <Button
              type="primary"
              onClick={() => navigate("/profile/verification")}
            >
              {user?.verificationStatus === 'REJECTED' ? 'Tải lại tài liệu' : 'Hoàn tất xác minh'}
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => navigate("/settings")}
            >
              Bắt đầu xác minh
            </Button>
          )}
          <Button onClick={() => navigate("/")}>
            Trở về trang chủ
          </Button>
          <Button 
            type="dashed" 
            onClick={() => {
              // Force refresh user data from API
              refreshUserData();
            }}
          >
            Tải lại
          </Button>
        </div>
      </Card>
    </div>
  );


  return (
    <div className="max-w-4xl mx-auto p-4">
      {!user ? (
        <LoginRequiredComponent />
      ) : !isUserVerified(user) ? (
        <VerificationRequiredComponent />
      ) : (
        <div>
          <BookingSteps currentStep={1} />

          {loadingVehicle ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
              <span className="ml-3">Đang tải thông tin xe...</span>
            </div>
          ) : !vehicle ? (
            <div className="text-center p-8">
              <p className="text-gray-500 mb-4">Không tìm thấy xe</p>
              <Link to="/vehicles" className="text-blue-500 hover:underline">
                ← Quay lại chọn xe
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleFinish}
                  requiredMark="optional"
                  initialValues={{
                    vehicleId: vehicle?.id ?? vehicleId,
                    stationId: stationId ?? "default-station-id",
                    rental_type: "daily",
                    rental_period: [dayjs().add(1, "day"), dayjs().add(2, "day")], // Ngày mai đến ngày kia
                    rental_start_time: dayjs("09:00:00", "HH:mm:ss"),
                    rental_end_time: dayjs("18:00:00", "HH:mm:ss"),
                  }}
                  onValuesChange={(changedValues) => {
                    const current = form.getFieldsValue();
                    console.log('📝 [BookingPage] Giá trị form thay đổi:', { changedValues, current });
                    
                    if ('insurance_premium' in changedValues) {
                      console.log('🛡️ [BookingPage] Bảo hiểm thay đổi!', {
                        'cũ': current.insurance_premium,
                        'mới': changedValues.insurance_premium,
                        'sẽ tính lại': true
                      });
                      setTimeout(() => {
                        const updatedValues = form.getFieldsValue();
                        console.log('💰 [BookingPage] Tính lại giá do thay đổi bảo hiểm:', updatedValues);
                        calculatePrice(updatedValues);
                      }, 100);
                      return;
                    }
                    
                    if (changedValues.rental_type) {
                      const now = dayjs();
                      const rentalType = changedValues.rental_type;
                      
                      if (rentalType === "hourly") {
                        const startTime = now.hour() < 22 ? now.add(1, 'hour').startOf('hour') : now.startOf('day').add(8, 'hour');
                        const endTime = startTime.add(4, 'hour');
                        
                        form.setFieldsValue({
                          rental_start_time: startTime,
                          rental_end_time: endTime,
                        });
                        
                        setTimeout(() => {
                          const updatedValues = form.getFieldsValue();
                          console.log('⏰ [BookingPage] Tính giá thuê theo giờ với giá trị cập nhật:', updatedValues);
                          calculatePrice(updatedValues);
                        }, 100);
                        
                      } else if (rentalType === "daily") {
                        const startDate = now.add(1, 'day');
                        const endDate = startDate.add(1, 'day');
                        
                        form.setFieldsValue({
                          rental_period: [startDate, endDate],
                          rental_start_time: dayjs("09:00:00", "HH:mm:ss"),
                        });
                        
                        setTimeout(() => {
                          const updatedValues = form.getFieldsValue();
                          console.log('📅 [BookingPage] Tính giá thuê theo ngày với giá trị cập nhật:', updatedValues);
                          calculatePrice(updatedValues);
                        }, 100);
                      }
                      
                      return;
                    }
                    
                    if (
                      changedValues.rental_period ||
                      changedValues.rental_start_time ||
                      changedValues.rental_end_time ||
                      changedValues.insurance_premium !== undefined
                    ) {
                      console.log('🔄 [BookingPage] Giá trị form thay đổi:', {
                        changedValues,
                        current,
                        'current.insurance_premium': current.insurance_premium
                      });
                      
                      const rentalType = current.rental_type;
                      
                      if (rentalType === "hourly") {
                        console.log('⏰ [BookingPage] Cập nhật giá thuê theo giờ với giá trị hiện tại');
                        calculatePrice(current);
                        
                      } else if (rentalType === "daily") {
                        console.log('📅 [BookingPage] Cập nhật giá thuê theo ngày với giá trị hiện tại');
                        calculatePrice(current);
                      }
                    }
                  }}
                >
                  <RentalPeriodForm />
                  <InsuranceAndTermsForm loading={loading} />
                </Form>
              </div>

              <div className="md:col-span-1">
                {loadingVehicle ? (
                  <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                    <span className="ml-3">Đang tải thông tin xe...</span>
                  </div>
                ) : (
                  <VehicleSummary
                    vehicle={vehicle}
                    priceBreakdown={priceBreakdown}
                    loading={calculatingPrice}
                    insuranceSelected={form.getFieldValue('insurance_premium') || false}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 🚫 Active Rental Warning Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-orange-500" />
            <span>Bạn đã có đơn thuê xe khác</span>
          </div>
        }
        open={showActiveRentalWarning}
        onCancel={() => setShowActiveRentalWarning(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowActiveRentalWarning(false)}>
            Tiếp tục ở đây
          </Button>,
          <Button 
            key="viewActive" 
            type="primary" 
            onClick={() => {
              setShowActiveRentalWarning(false);
              navigate('/my-rentals');
            }}
          >
            Xem đơn thuê hiện tại
          </Button>
        ]}
        width={600}
      >
        <div className="space-y-4">
          <Alert
            description={
              activeRental ? (
                <div className="mt-2">
                  <p><strong>Đơn thuê hiện tại:</strong> {activeRental._id}</p>
                  <p><strong>Trạng thái:</strong> {translateRentalStatus(activeRental.status)}</p>
                  {/* <p><strong>Xe:</strong> {(() => {
                    const vehicle = activeRental.vehicle_id;
                    // Check if vehicle_id is just a string ID (not populated)
                    if (typeof vehicle === 'string') {
                      return `ID: ${vehicle}`;
                    }
                    if (!vehicle || typeof vehicle !== 'object') return 'Không có thông tin xe';
                    const brand = vehicle.brand || vehicle.name || '';
                    const model = vehicle.model || '';
                    return brand && model ? `${brand} ${model}` : brand || model || 'Xe không xác định';
                  })()}</p> */}
                  <p><strong>Booking ID:</strong> {(() => {
                    const booking = activeRental.booking_id;
                    // Check if booking_id is just a string ID (not populated)
                    if (typeof booking === 'string') {
                      return booking;
                    }
                    return booking?._id || 'Không xác định';
                  })()}</p>
                  <p><strong>Ngày thuê:</strong> {(() => {
                    const booking = activeRental.booking_id;
                    // If booking_id is not populated, we can't show dates
                    if (typeof booking === 'string') {
                      return 'Thông tin ngày không có sẵn (cần xem chi tiết)';
                    }
                    if (!booking?.start_at || !booking?.end_at) return 'Không xác định';
                    try {
                      const start = new Date(booking.start_at).toLocaleString('vi-VN');
                      const end = new Date(booking.end_at).toLocaleString('vi-VN');
                      return `${start} → ${end}`;
                    } catch {
                      return 'Ngày không hợp lệ';
                    }
                  })()}</p>
                  
                  
                </div>
              ) : (
                <p>Vui lòng hoàn tất hoặc hủy đơn thuê hiện tại trước khi tạo đơn mới.</p>
              )
            }
            type="warning"
            showIcon
          />
          
          <div className="text-sm text-gray-600">
            <p><strong>Gợi ý:</strong></p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Hoàn tất đơn thuê hiện tại bằng cách trả xe</li>
              <li>Hoặc liên hệ hỗ trợ nếu cần hủy đơn thuê</li>
              <li>Sau đó quay lại để thuê xe mới</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingPage;
