import React, { useState, useEffect, useCallback } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  Link,
} from "react-router-dom";
import { Form, message, Spin, Card, Button } from "antd";
import { UserOutlined, LoginOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { bookingService, type PriceBreakdown } from "../../services/bookingService";
import { vehicleService } from "../../services/vehicleService";
import { userService } from "../../services/userService";
import type { Vehicle } from "../../types/vehicle";
import { getCurrentUser, isUserVerified, getVerificationStatusMessage } from "../../utils/auth";
import { useAutoRefreshUser } from "../../hooks/useAutoRefreshUser";

// Components
import BookingSteps from "../../components/booking/BookingSteps";
import RentalPeriodForm from "../../components/booking/RentalPeriodForm";
import CustomerInformationForm from "../../components/booking/CustomerInformationForm";
import InsuranceAndTermsForm from "../../components/booking/InsuranceAndTermsForm";
import VehicleSummary from "../../components/booking/VehicleSummary";

// interface DocumentUploadStatus {
//   status: "not_started" | "uploading" | "success" | "error";
// }

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

  // Auto-refresh user data when component mounts
  useAutoRefreshUser(setUser);

  // Function to refresh user data from API
  const refreshUserData = async () => {
    try {
      console.log('🔄 [BookingPage] Refreshing user data from API...');
      const freshUserData = await userService.getCurrentUser();
      console.log('✅ [BookingPage] Fresh user data received:', freshUserData);
      
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
      
      message.success('User data refreshed successfully');
    } catch (error) {
      console.error('❌ [BookingPage] Failed to refresh user data:', error);
      message.error('Failed to refresh user data. Please try logging in again.');
    }
  };

  // const [uploadStatus, setUploadStatus] = useState<{
  //   [key: string]: DocumentUploadStatus["status"];
  // }>
  // ({
  //   [DOCUMENT_TYPES.DRIVERS_LICENSE]: "not_started",
  //   [DOCUMENT_TYPES.NATIONAL_ID_FRONT]: "not_started",
  //   [DOCUMENT_TYPES.NATIONAL_ID_BACK]: "not_started",
  // });

  // ---- Pricing ----
  const calculatePrice = useCallback(
    async (formDataOrStartAt: Record<string, unknown> | string, endAt?: string, insurancePremium = false) => {
      console.log('🚀 [BookingPage] calculatePrice called with:', { 
        formDataOrStartAt, 
        endAt, 
        insurancePremium, 
        vehicleId,
        timestamp: new Date().toISOString()
      });
      
      if (!vehicleId) {
        console.warn('❌ [BookingPage] No vehicleId, skipping price calculation');
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
          console.log('🔍 [BookingPage] Extracting insurance from form data:', formDataOrStartAt);
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
        
        console.log('📤 [BookingPage] Sending price request:', priceRequest);
        
        const pricing = await bookingService.calculatePrice(priceRequest);
        console.log('📥 [BookingPage] Received pricing response:', pricing);
        
        setPriceBreakdown(pricing);
        console.log('✅ [BookingPage] Price breakdown set successfully');
      } catch (error) {
        console.error("💥 [BookingPage] Price calculation error:", error);
      } finally {
        setCalculatingPrice(false);
        console.log('🏁 [BookingPage] Price calculation finished');
      }
    },
    [vehicleId]
  );

  // Auth watcher
  useEffect(() => {
    const checkAuthState = () => {
      const currentUser = getCurrentUser();
      console.log('🔍 [BookingPage] Auth state check:', {
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
        console.log('📢 [BookingPage] Storage changed:', e.key);
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
        message.error("Vehicle ID is required");
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
        
        console.log('🔧 [BookingPage] Calculating initial price with default daily rental:', initialFormData);
        await calculatePrice(initialFormData);
      } catch (error) {
        console.error("Error loading vehicle:", error);
        message.error("Failed to load vehicle information. Please try again.");
        navigate("/vehicles");
      } finally {
        setLoadingVehicle(false);
      }
    };
    loadVehicle();
  }, [vehicleId, navigate, calculatePrice]);

  // ---- Submit ----
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFinish = async (values: Record<string, any>) => {
    if (!user) {
      message.error("Please log in to make a booking");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    
    // ✅ Check verification status before allowing booking
    if (!isUserVerified(user)) {
      message.error("Your account must be verified before making a booking");
      navigate("/settings");
      return;
    }
    
    if (!vehicleId) {
      message.error("Vehicle ID is required for booking");
      return;
    }

    try {
      setLoading(true);

      // Use station_id from vehicle data instead of URL parameter
      const vehicleStationId = vehicle?.stationId || vehicle?.stationId;
      const finalStationId: string = vehicleStationId || stationId || "default-station-id";

      console.log("=== STATION DEBUG ===");
      console.log("URL stationId:", stationId);
      console.log("Vehicle station_id:", vehicle?.stationId);
      console.log("Vehicle stationId:", vehicle?.stationId);
      console.log("Final stationId:", finalStationId);

      const formValues = {
        ...values,
        stationId: finalStationId,
        vehicleId,
      };

      console.log("=== DEBUGGING FORM DATA ===");
      console.log("Raw form values:", JSON.stringify(values, null, 2));
      console.log("Final form values:", JSON.stringify(formValues, null, 2));

      const bookingRequest = bookingService.formatBookingRequest(formValues);
      console.log("Formatted booking request:", JSON.stringify(bookingRequest, null, 2));
      
      const booking = await bookingService.createBooking(bookingRequest);

      message.success("Booking created successfully! Redirecting to payment...");
      navigate(`/payment?bookingId=${booking._id}`);
    } catch (error: unknown) {
      console.error("Booking creation error:", error);
      const e = error as { response?: { status?: number }; message?: string };
      if (
        e?.response?.status === 401 ||
        (e?.message &&
          (e.message.includes("unauthorized") ||
            e.message.includes("authentication")))
      ) {
        message.error("Your session has expired. Please log in again.");
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      message.error(
        e?.message || "Failed to create booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---- Upload ----
  // const handleUploadChange = (
  //   info: { file: { status?: string; name: string }; fileList: UploadFile[] },
  //   docType: string
  // ) => {
  //   const { status } = info.file;
  //   const newFileList = [...info.fileList].slice(-1); // keep latest

  //   setFileList((prev) => ({ ...prev, [docType]: newFileList }));

  //   if (status === "uploading") {
  //     setUploadStatus((prev) => ({ ...prev, [docType]: "uploading" }));
  //   } else if (status === "done") {
  //     setUploadStatus((prev) => ({ ...prev, [docType]: "success" }));
  //     message.success(`${info.file.name} uploaded successfully.`);
  //   } else if (status === "error") {
  //     setUploadStatus((prev) => ({ ...prev, [docType]: "error" }));
  //     message.error(`${info.file.name} upload failed.`);
  //   }
  // };

  // ---- Login required ----
  const LoginRequiredComponent = () => (
    <div className="max-w-md mx-auto mt-8">
      <Card className="text-center p-6">
        <UserOutlined className="text-4xl text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold mb-4">Login Required</h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to make a booking. Please login or create an
          account to continue.
        </p>
        <div className="space-x-4">
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate("/login", { state: { from: location.pathname } })}
          >
            Login
          </Button>
          <Button onClick={() => navigate("/register", { state: { from: location.pathname } })}>
            Create Account
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
        <h2 className="text-xl font-semibold mb-4">Account Verification Required</h2>
        <p className="text-gray-600 mb-4">
          Your account needs to be verified before you can make a booking.
        </p>
        
        
        <div className="mb-6">
          <p className="text-sm font-medium">
            Status: <span className={`${
              user?.verificationStatus === 'REJECTED' ? 'text-red-600' :
              user?.verificationStatus === 'PENDING' ? 'text-orange-600' : 'text-gray-600'
            }`}>
              {getVerificationStatusMessage(user)}
            </span>
          </p>
          {user?.rejectionReason && (
            <p className="text-sm text-red-600 mt-2">
              Reason: {user.rejectionReason}
            </p>
          )}
        </div>
        <div className="space-x-4">
          {user?.verificationStatus === 'REJECTED' || user?.verificationStatus === 'PENDING' ? (
            <Button
              type="primary"
              onClick={() => navigate("/profile/verification")}
            >
              {user?.verificationStatus === 'REJECTED' ? 'Re-submit Documents' : 'Complete Verification'}
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => navigate("/settings")}
            >
              Start Verification Process
            </Button>
          )}
          <Button onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <Button 
            type="dashed" 
            onClick={() => {
              // Force refresh user data from API
              refreshUserData();
            }}
          >
            Refresh
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
              <span className="ml-3">Loading vehicle information...</span>
            </div>
          ) : !vehicle ? (
            <div className="text-center p-8">
              <p className="text-gray-500 mb-4">Vehicle not found</p>
              <Link to="/vehicles" className="text-blue-500 hover:underline">
                ← Back to Vehicle Selection
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
                    rental_period: [dayjs().add(1, "day"), dayjs().add(2, "day")], // Tomorrow to day after tomorrow
                    rental_start_time: dayjs("09:00:00", "HH:mm:ss"),
                    rental_end_time: dayjs("18:00:00", "HH:mm:ss"),
                  }}
                  onValuesChange={(changedValues) => {
                    const current = form.getFieldsValue();
                    console.log('📝 [BookingPage] Form values changed:', { changedValues, current });
                    
                    // 🔍 Check if insurance changed
                    if ('insurance_premium' in changedValues) {
                      console.log('🛡️ [BookingPage] Insurance changed!', {
                        'old': current.insurance_premium,
                        'new': changedValues.insurance_premium,
                        'will recalculate': true
                      });
                      // Immediate price recalculation for insurance changes
                      setTimeout(() => {
                        const updatedValues = form.getFieldsValue();
                        console.log('💰 [BookingPage] Recalculating price due to insurance change:', updatedValues);
                        calculatePrice(updatedValues);
                      }, 100);
                      return; // Exit early for insurance changes
                    }
                    
                    // Handle rental type change with smart defaults
                    if (changedValues.rental_type) {
                      const now = dayjs();
                      const rentalType = changedValues.rental_type;
                      
                      if (rentalType === "hourly") {
                        // For hourly: default to today, 4-hour window
                        const startTime = now.hour() < 22 ? now.add(1, 'hour').startOf('hour') : now.startOf('day').add(8, 'hour');
                        const endTime = startTime.add(4, 'hour');
                        
                        form.setFieldsValue({
                          rental_start_time: startTime,
                          rental_end_time: endTime,
                        });
                        
                        // Calculate price for hourly rental
                        setTimeout(() => {
                          const updatedValues = form.getFieldsValue();
                          console.log('⏰ [BookingPage] Hourly price calculation with updated values:', updatedValues);
                          calculatePrice(updatedValues);
                        }, 100);
                        
                      } else if (rentalType === "daily") {
                        // For daily: default to tomorrow, full day
                        const startDate = now.add(1, 'day');
                        const endDate = startDate.add(1, 'day');
                        
                        form.setFieldsValue({
                          rental_period: [startDate, endDate],
                          rental_start_time: dayjs("09:00:00", "HH:mm:ss"),
                        });
                        
                        // Calculate price for daily rental
                        setTimeout(() => {
                          const updatedValues = form.getFieldsValue();
                          console.log('📅 [BookingPage] Daily price calculation with updated values:', updatedValues);
                          calculatePrice(updatedValues);
                        }, 100);
                      }
                      
                      return; // Exit early to avoid duplicate calculations
                    }
                    
                    // Handle other changes - calculate price based on current rental type
                    if (
                      changedValues.rental_period ||
                      changedValues.rental_start_time ||
                      changedValues.rental_end_time ||
                      changedValues.insurance_premium !== undefined
                    ) {
                      console.log('🔄 [BookingPage] Form values changed:', {
                        changedValues,
                        current,
                        'current.insurance_premium': current.insurance_premium
                      });
                      
                      const rentalType = current.rental_type;
                      
                      if (rentalType === "hourly") {
                        // For hourly rental: recalculate with current form values
                        console.log('⏰ [BookingPage] Hourly price update with current values');
                        calculatePrice(current);
                        
                      } else if (rentalType === "daily") {
                        // For daily rental: recalculate with current form values
                        console.log('📅 [BookingPage] Daily price update with current values');
                        calculatePrice(current);
                      }
                    }
                  }}
                >
                  <RentalPeriodForm />
                  <CustomerInformationForm />
{/* 
                  <DocumentUploadProgress uploadStatus={uploadStatus} />

                  <DocumentUpload
                    title="Driver's License"
                    description="Please upload both sides of your driver's license"
                    uploadProps={createDocumentUploadProps(DOCUMENT_TYPES.DRIVERS_LICENSE)}
                  />

                  <DocumentUpload
                    title="National ID - Front"
                    description="Please upload the front side of your national ID card"
                    uploadProps={createDocumentUploadProps(DOCUMENT_TYPES.NATIONAL_ID_FRONT)}
                  />

                  <DocumentUpload
                    title="National ID - Back"
                    description="Please upload the back side of your national ID card"
                    uploadProps={createDocumentUploadProps(DOCUMENT_TYPES.NATIONAL_ID_BACK)}
                  />

                  <UploadGuidelines /> */}
                  <InsuranceAndTermsForm loading={loading} />
                </Form>
              </div>

              <div className="md:col-span-1">
                {loadingVehicle ? (
                  <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                    <span className="ml-3">Loading vehicle information...</span>
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
    </div>
  );
};

export default BookingPage;