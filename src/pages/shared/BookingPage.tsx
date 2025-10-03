import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, message } from "antd";
import dayjs from "dayjs";
import { SAMPLE_VEHICLES, getVehicleById } from "../../data/vehicles";
import type { UploadFile } from "antd/es/upload/interface";

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
  // Get vehicle ID from URL
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Find selected vehicle from vehicles data using the utility function
  // Or fallback to the first vehicle if none specified
  const selectedVehicle = vehicleId
    ? getVehicleById(vehicleId) || SAMPLE_VEHICLES[0]
    : SAMPLE_VEHICLES[0];

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

  const handleFinish = (values: any) => {
    console.log("Form values:", values);
    message.success("Booking information submitted successfully!");
    navigate("/payment");
  };

  const handleUploadChange = (info: any, docType: string) => {
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
      onChange: (info: any) => handleUploadChange(info, docType),
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50">
      {/* Header with steps */}
      <BookingSteps currentStep={1} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            requiredMark="optional"
            initialValues={{
              rental_type: "daily",
              rental_period: [dayjs(), dayjs().add(3, "day")],
              rental_start_time: dayjs("09:00:00", "HH:mm:ss"),
              rental_end_time: dayjs("18:00:00", "HH:mm:ss"),
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
            <InsuranceAndTermsForm />
          </Form>
        </div>

        <div className="md:col-span-1">
          {/* Vehicle Summary */}
          <VehicleSummary vehicle={selectedVehicle} />
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
