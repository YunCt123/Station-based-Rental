import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Upload,
  Button,
  Card,
  Checkbox,
  Steps,
  Space,
  Progress,
  Typography,
  message,
} from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  IdentificationIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { SAMPLE_VEHICLES, getVehicleById } from "../../data/vehicles";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Define document types directly in component
const DOCUMENT_TYPES = {
  DRIVERS_LICENSE: "drivers_license",
  NATIONAL_ID_FRONT: "national_id_front",
  NATIONAL_ID_BACK: "national_id_back",
};

// Define booking steps
const BOOKING_STEPS = [
  { title: "Vehicle Selection", description: "Choose your car" },
  { title: "Booking Details", description: "Enter your information" },
  { title: "Payment", description: "Complete your booking" },
];

// Define upload guidelines
const UPLOAD_GUIDELINES = [
  "Ensure documents are clear and all text is readable",
  "Upload high-resolution images in JPEG/PNG formats",
  "Documents must be valid and not expired",
  "Acceptable ID cards: valid current and government-issued",
  "File size should not exceed 5MB per document",
  "Supported formats: JPG, PNG, PDF",
];

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

  // Calculate upload progress percentage
  const getUploadProgress = () => {
    const uploadedDocs = Object.values(uploadStatus).filter(
      (status) => status === "success"
    ).length;
    return (uploadedDocs / 3) * 100;
  };

  // Create upload props
  const getUploadProps = (): UploadProps => ({
    name: "file",
    multiple: false,
    action: "https://api.yourservice.com/upload", // Replace with your actual upload endpoint
    beforeUpload(file) {
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
      <div className="flex items-center justify-center mb-6">
        <Link
          to="/vehicles"
          className="text-primary-500 hover:underline flex items-center gap-1"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Vehicle Selection</span>
        </Link>
      </div>

      <Steps current={1} className="mb-8" items={BOOKING_STEPS} />

      <Title level={2} className="text-center mb-8">
        Booking Details
      </Title>

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
            <Card
              className="mb-4"
              title={
                <Space>
                  <CalendarIcon className="h-5 w-5" />
                  <span>Rental Period</span>
                </Space>
              }
            >
              <Form.Item name="rental_type" label="Rental Type">
                <Select>
                  <Option value="daily">Daily Rental</Option>
                  <Option value="hourly">Hourly Rental</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="rental_period"
                label="Rental Period"
                rules={[
                  { required: true, message: "Please select rental dates" },
                ]}
              >
                <RangePicker className="w-full" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="rental_start_time"
                  label="Start Time"
                  rules={[
                    { required: true, message: "Please select start time" },
                  ]}
                >
                  <TimePicker format="HH:mm" className="w-full" />
                </Form.Item>
                <Form.Item
                  name="rental_end_time"
                  label="End Time"
                  rules={[
                    { required: true, message: "Please select end time" },
                  ]}
                >
                  <TimePicker format="HH:mm" className="w-full" />
                </Form.Item>
              </div>
            </Card>

            {/* Customer Information */}
            <Card
              className="mb-4"
              title={
                <Space>
                  <UserIcon className="h-5 w-5" />
                  <span>Customer Information</span>
                </Space>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="full_name"
                  label="Full Name"
                  rules={[
                    { required: true, message: "Please enter your full name" },
                  ]}
                >
                  <Input placeholder="Enter your full name" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input placeholder="email@example.com" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your phone number",
                    },
                  ]}
                >
                  <Input placeholder="+1 (XXX) XXX-XXXX" />
                </Form.Item>

                <Form.Item
                  name="license_number"
                  label="Driver's License Number"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your license number",
                    },
                  ]}
                >
                  <Input placeholder="License number" />
                </Form.Item>
              </div>
            </Card>

            {/* Document Upload Progress */}
            <Card
              className="mb-4"
              title={
                <Space>
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>Document Upload Progress</span>
                </Space>
              }
            >
              <Space className="mb-2">
                <Text
                  type="warning"
                  className="bg-warning-100 text-warning-800 py-1 px-2 rounded text-xs"
                >
                  {`${
                    Object.values(uploadStatus).filter(
                      (status) => status === "success"
                    ).length
                  }/3 documents uploaded`}
                </Text>
              </Space>
              <Progress percent={getUploadProgress()} showInfo={false} />
            </Card>

            {/* Driver's License Upload */}
            <Card
              className="mb-4"
              title={
                <Space>
                  <IdentificationIcon className="h-5 w-5" />
                  <span>Driver's License</span>
                </Space>
              }
            >
              <Paragraph className="text-xs text-gray-600 mb-3">
                Please upload both sides of your driver's license
              </Paragraph>

              <Upload.Dragger
                {...createDocumentUploadProps(DOCUMENT_TYPES.DRIVERS_LICENSE)}
                listType="picture"
                className="mb-4"
              >
                <p className="ant-upload-drag-icon">
                  <CloudArrowUpIcon className="h-10 w-10 mx-auto text-gray-400" />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single file upload. Only JPG, PNG, or PDF.
                </p>
              </Upload.Dragger>
            </Card>

            {/* National ID - Front */}
            <Card
              className="mb-4"
              title={
                <Space>
                  <IdentificationIcon className="h-5 w-5" />
                  <span>National ID - Front</span>
                </Space>
              }
            >
              <Paragraph className="text-xs text-gray-600 mb-3">
                Please upload front side of your national ID card (ensure text
                is visible, photo is clear, and ID covers)
              </Paragraph>

              <Upload.Dragger
                {...createDocumentUploadProps(DOCUMENT_TYPES.NATIONAL_ID_FRONT)}
                listType="picture"
                className="mb-4"
              >
                <p className="ant-upload-drag-icon">
                  <CloudArrowUpIcon className="h-10 w-10 mx-auto text-gray-400" />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single file upload. Only JPG, PNG, or PDF.
                </p>
              </Upload.Dragger>
            </Card>

            {/* National ID - Back */}
            <Card
              className="mb-4"
              title={
                <Space>
                  <IdentificationIcon className="h-5 w-5" />
                  <span>National ID - Back</span>
                </Space>
              }
            >
              <Paragraph className="text-xs text-gray-600 mb-3">
                Please upload back side of your national ID card
              </Paragraph>

              <Upload.Dragger
                {...createDocumentUploadProps(DOCUMENT_TYPES.NATIONAL_ID_BACK)}
                listType="picture"
                className="mb-4"
              >
                <p className="ant-upload-drag-icon">
                  <CloudArrowUpIcon className="h-10 w-10 mx-auto text-gray-400" />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single file upload. Only JPG, PNG, or PDF.
                </p>
              </Upload.Dragger>
            </Card>

            {/* Upload Guidelines */}
            <Card className="mb-4" title="Upload Guidelines">
              <ul className="text-xs text-gray-600 space-y-2 list-disc pl-5">
                {UPLOAD_GUIDELINES.map((guideline, index) => (
                  <li key={index}>{guideline}</li>
                ))}
              </ul>
            </Card>

            {/* Insurance & Terms */}
            <Card
              className="mb-4"
              title={
                <Space>
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Insurance & Terms</span>
                </Space>
              }
            >
              <Form.Item name="insurance" valuePropName="checked">
                <Checkbox>
                  Add collision insurance coverage ($20 / rental cost)
                </Checkbox>
              </Form.Item>

              <Form.Item
                name="terms_agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error(
                              "You must agree to the terms and conditions"
                            )
                          ),
                  },
                ]}
              >
                <Checkbox>
                  I agree to the{" "}
                  <a href="#" className="text-primary-500 hover:underline">
                    terms and conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary-500 hover:underline">
                    privacy agreement
                  </a>
                </Checkbox>
              </Form.Item>

              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="bg-primary-500 hover:bg-primary-600 mt-4 w-full"
              >
                Continue to Payment
              </Button>
            </Card>
          </Form>
        </div>

        <div className="md:col-span-1">
          {/* Vehicle Summary */}
          <Card className="sticky top-4">
            <div className="mb-4">
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
            <Title level={4}>{selectedVehicle.name}</Title>
            <Text type="secondary" className="block mb-2">
              {`${selectedVehicle.type} • ${selectedVehicle.seats} Seats`}
            </Text>

            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <Text>Daily Rate:</Text>
                <Text strong>${selectedVehicle.dailyRate}/day</Text>
              </div>
              <div className="flex justify-between mb-4">
                <Text>Hourly Rate:</Text>
                <Text strong>${selectedVehicle.hourlyRate}/hour</Text>
              </div>

              {selectedVehicle.features?.slice(0, 3).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>{" "}
                  {feature}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
