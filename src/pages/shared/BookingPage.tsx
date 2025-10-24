import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { Form, message, Spin } from "antd";
import dayjs from "dayjs";
import type { UploadFile } from "antd/es/upload/interface";
import { bookingService, type PriceBreakdown, type BookingFormData } from "../../services/bookingService";
import { vehicleService } from "../../services/vehicleService";
import type { Vehicle } from "../../types/vehicle";

// Import components
import BookingSteps from "../../components/booking/BookingSteps";
import RentalPeriodForm from "../../components/booking/RentalPeriodForm";
import CustomerInformationForm from "../../components/booking/CustomerInformationForm";
import DocumentUploadProgress from "../../components/booking/DocumentUploadProgress";
import DocumentUpload from "../../components/booking/DocumentUpload";
import UploadGuidelines from "../../components/booking/UploadGuidelines";
import InsuranceAndTermsForm from "../../components/booking/InsuranceAndTermsForm";
import VehicleSummary from "../../components/booking/VehicleSummary";
import { DOCUMENT_TYPES } from "../../components/booking/DocumentTypes";

// Interface for document upload status
interface DocumentUploadStatus {
  status: "not_started" | "uploading" | "success" | "error";
}

const BookingPage: React.FC = () => {
  // Get vehicle ID and station ID from URL
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [searchParams] = useSearchParams();
  const stationId = searchParams.get('stationId');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // State for booking
  const [loading, setLoading] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);

  // Initialize file lists and upload statuses
  const [fileList, setFileList] = useState<{ [key: string]: UploadFile[] }>({
    [DOCUMENT_TYPES.DRIVERS_LICENSE]: [],
    [DOCUMENT_TYPES.NATIONAL_ID_FRONT]: [],
    [DOCUMENT_TYPES.NATIONAL_ID_BACK]: [],
  });

  const [uploadStatus, setUploadStatus] = useState<{
    [key: string]: DocumentUploadStatus["status"];
  }>({
    [DOCUMENT_TYPES.DRIVERS_LICENSE]: "not_started",
    [DOCUMENT_TYPES.NATIONAL_ID_FRONT]: "not_started",
    [DOCUMENT_TYPES.NATIONAL_ID_BACK]: "not_started",
  });

  // Calculate price when rental period changes
  const calculatePrice = useCallback(async (startAt: string, endAt: string, insurancePremium = false) => {
    if (!vehicleId) return;

    try {
      setCalculatingPrice(true);
      const priceRequest = {
        vehicleId,
        startAt,
        endAt,
        insurancePremium
      };
      
      const pricing = await bookingService.calculatePrice(priceRequest);
      setPriceBreakdown(pricing);
    } catch (error) {
      console.error("Price calculation error:", error);
      // Keep existing price or show fallback
    } finally {
      setCalculatingPrice(false);
    }
  }, [vehicleId]);

  // Load vehicle data from API
  useEffect(() => {
    const loadVehicle = async () => {
      if (!vehicleId) {
        message.error('Vehicle ID is required');
        navigate('/vehicles');
        return;
      }

      try {
        setLoadingVehicle(true);
        const vehicleData = await vehicleService.getVehicleById(vehicleId);
        setVehicle(vehicleData);
        console.log('Vehicle loaded:', vehicleData);
        
        // Calculate initial price with default values after vehicle is loaded
        const now = dayjs();
        const startAt = now.hour(9).minute(0).toISOString();
        const endAt = now.add(3, 'day').hour(18).minute(0).toISOString();
        calculatePrice(startAt, endAt, false);
      } catch (error) {
        console.error('Error loading vehicle:', error);
        message.error('Failed to load vehicle information. Please try again.');
        navigate('/vehicles');
      } finally {
        setLoadingVehicle(false);
      }
    };

    loadVehicle();
  }, [vehicleId, navigate, calculatePrice]);

  const handleFinish = async (values: BookingFormData) => {
    if (!stationId) {
      message.error("Station ID is required for booking");
      return;
    }

    try {
      setLoading(true);
      console.log("Form values:", values);

      // Format the booking request
      const bookingRequest = bookingService.formatBookingRequest(values);
      
      // Create booking
      const booking = await bookingService.createBooking(bookingRequest);
      
      message.success("Booking created successfully!");
      console.log("Booking created:", booking);
      
      // Navigate to payment with booking ID
      navigate(`/payment?bookingId=${booking._id}`);
    } catch (error) {
      console.error("Booking creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create booking. Please try again.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = (info: { file: { status?: string; name: string }; fileList: UploadFile[] }, docType: string) => {
    const { status } = info.file;
    const newFileList = [...info.fileList].slice(-1); // Keep only the latest file

    setFileList((prev) => ({ ...prev, [docType]: newFileList }));

    if (status === "uploading") {
      setUploadStatus((prev) => ({ ...prev, [docType]: "uploading" }));
    } else if (status === "done") {
      setUploadStatus((prev) => ({ ...prev, [docType]: "success" }));
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      setUploadStatus((prev) => ({ ...prev, [docType]: "error" }));
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  // Create upload props
  const getUploadProps = () => ({
    name: "file",
    multiple: false,
    action: "https://api.yourservice.com/upload", // Replace with your actual upload endpoint
    beforeUpload(file: File) {
      const isValidFormat =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "application/pdf";
      const isValidSize = file.size / 1024 / 1024 < 5;

      if (!isValidFormat) {
        message.error("You can only upload JPG/PNG/PDF files!");
      }

      if (!isValidSize) {
        message.error("File must be smaller than 5MB!");
      }

      return isValidFormat && isValidSize;
    },
  });

  // Create document upload props for each document type
  const createDocumentUploadProps = (docType: string) => {
    const baseProps = getUploadProps();
    return {
      ...baseProps,
      fileList: fileList[docType],
      onChange: (info: { file: { status?: string; name: string }; fileList: UploadFile[] }) => handleUploadChange(info, docType),
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50">
      {/* Header with steps */}
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
              vehicleId: vehicle?.id,
              stationId: stationId || "default-station-id", // Use from URL params or default
              rental_type: "daily",
              rental_period: [dayjs(), dayjs().add(3, "day")],
              rental_start_time: dayjs("09:00:00", "HH:mm:ss"),
              rental_end_time: dayjs("18:00:00", "HH:mm:ss"),
            }}
            onValuesChange={(changedValues) => {
              // Recalculate price when relevant fields change
              if (changedValues.rental_period || 
                  changedValues.rental_start_time || 
                  changedValues.rental_end_time || 
                  changedValues.insurance_premium !== undefined) {
                
                const currentValues = form.getFieldsValue();
                if (currentValues.rental_period && currentValues.rental_period.length === 2) {
                  const [startDate, endDate] = currentValues.rental_period;
                  const startTime = currentValues.rental_start_time || dayjs("09:00:00", "HH:mm:ss");
                  const endTime = currentValues.rental_end_time || dayjs("18:00:00", "HH:mm:ss");
                  
                  const startAt = startDate.hour(startTime.hour()).minute(startTime.minute()).toISOString();
                  const endAt = endDate.hour(endTime.hour()).minute(endTime.minute()).toISOString();
                  
                  calculatePrice(startAt, endAt, currentValues.insurance_premium || false);
                }
              }
            }}
          >
            {/* Rental Period */}
            <RentalPeriodForm />

            {/* Customer Information */}
            <CustomerInformationForm />

            {/* Document Upload Progress */}
            <DocumentUploadProgress uploadStatus={uploadStatus} />

            {/* Driver's License Upload */}
            <DocumentUpload
              title="Driver's License"
              description="Please upload both sides of your driver's license"
              uploadProps={createDocumentUploadProps(
                DOCUMENT_TYPES.DRIVERS_LICENSE
              )}
            />

            {/* National ID - Front */}
            <DocumentUpload
              title="National ID - Front"
              description="Please upload front side of your national ID card (ensure text is visible, photo is clear, and ID covers)"
              uploadProps={createDocumentUploadProps(
                DOCUMENT_TYPES.NATIONAL_ID_FRONT
              )}
            />

            {/* National ID - Back */}
            <DocumentUpload
              title="National ID - Back"
              description="Please upload back side of your national ID card"
              uploadProps={createDocumentUploadProps(
                DOCUMENT_TYPES.NATIONAL_ID_BACK
              )}
            />

            {/* Upload Guidelines */}
            <UploadGuidelines />

            {/* Insurance & Terms */}
            <InsuranceAndTermsForm loading={loading} />
          </Form>
        </div>

        <div className="md:col-span-1">
          {/* Vehicle Summary */}
          {loadingVehicle ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
              <span className="ml-3">Loading vehicle information...</span>
            </div>
          ) : vehicle ? (
            <VehicleSummary 
              vehicle={vehicle} 
              priceBreakdown={priceBreakdown}
              loading={calculatingPrice}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">Vehicle not found</p>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
