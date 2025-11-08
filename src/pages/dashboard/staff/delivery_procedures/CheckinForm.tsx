import React, { useState } from 'react';
import { Modal, Form, Upload, InputNumber, Input, Button, message, Typography, Space, Divider, Radio, Select } from 'antd';
import { UploadOutlined, CameraOutlined, CheckCircleOutlined, LoadingOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import type { RcFile } from 'antd/es/upload/interface';
import api from '../../../../services/api';
import { rentalService, COMMON_REJECT_REASONS } from '../../../../services/rentalService';
import type { HandoverPayload } from '../../../../services/rentalService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CheckinFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  rental: {
    _id: string;
    booking_id: string;
    user_id: {
      _id: string;
      name: string;
      email: string;
      phoneNumber?: string;
    };
    vehicle_id: {
      _id: string;
      name: string;
      brand: string;
      model: string;
      type: string;
      seats: number;
      battery_kWh: number;
      batteryLevel: number;
      odo_km: number;
      image: string;
      year: number;
      licensePlate?: string;
    };
    station_id: {
      _id: string;
      name: string;
      address: string;
      city: string;
    };
    status: 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'DISPUTED';
    pickup?: {
      at?: string;
      photos?: string[];
      staff_id?: string;
      odo_km?: number;
      soc?: number;
      notes?: string;
    };
    pricing_snapshot: {
      hourly_rate?: number;
      daily_rate?: number;
      currency: string;
      deposit?: number;
    };
    createdAt: string;
    updatedAt: string;
    closed_at?: string;
  };
}

interface CheckinData {
  photos: string[];
  odo_km?: number;
  soc?: number;
  notes?: string;
}

const CheckinForm: React.FC<CheckinFormProps> = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  rental 
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]); // Store uploaded URLs
  const [handoverAction, setHandoverAction] = useState<'accept' | 'reject'>('accept');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [customRejectReason, setCustomRejectReason] = useState<string>('');

  // Upload single file immediately when selected
  const uploadSingleFile = async (file: RcFile): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/upload/single-checkin-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('📤 Upload response:', response.data);
      
      if (response.data.success) {
        // Check multiple possible response structures
        let photoUrl = null;
        
        // Structure 1: response.data.data.photos[0].url
        if (response.data.data?.photos?.length > 0) {
          photoUrl = response.data.data.photos[0].url;
        }
        // Structure 2: response.data.data.url (direct URL)
        else if (response.data.data?.url) {
          photoUrl = response.data.data.url;
        }
        // Structure 3: response.data.url (direct in root)
        else if (response.data.url) {
          photoUrl = response.data.url;
        }
        
        if (photoUrl) {
          message.success(`Ảnh "${file.name}" đã được tải lên thành công!`);
          return photoUrl;
        } else {
          throw new Error('No photo URL found in response');
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Single photo upload error:', error);
      
      let errorMessage = 'Upload failed';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      message.error(`Lỗi upload ảnh: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  };

  // Perform vehicle checkin
  const performCheckin = async (imageUrls: string[], formData: CheckinData) => {
    try {
      console.log('🚗 Performing vehicle checkin...');
      
      const checkinPayload = {
        photos: imageUrls,
        odo_km: formData.odo_km,
        soc: formData.soc ? formData.soc / 100 : undefined, // Convert percentage to decimal
        notes: formData.notes || ''
      };

      console.log('Checkin payload:', checkinPayload);

      const response = await api.post(`/rentals/${rental._id}/checkin`, checkinPayload);
      
      if (response.data.success) {
        console.log('✅ Checkin successful:', response.data);
        message.success('Xe đã được giao thành công!');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Checkin failed');
      }
    } catch (error: unknown) {
      console.error('❌ Checkin failed:', error);
      
      let errorMessage = 'Không thể giao xe';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: {
    odo_km?: number;
    soc?: number;
    notes?: string;
    action?: 'accept' | 'reject';
    rejectReason?: string;
    customRejectReason?: string;
  }) => {
    try {
      setSubmitting(true);

      const vehicleData = {
        odo_km: values.odo_km,
        soc: values.soc ? values.soc / 100 : undefined, // Convert percentage to decimal
        notes: values.notes
      };

      if (values.action === 'reject' || handoverAction === 'reject') {
        // Handle reject flow
        let finalRejectReason = values.rejectReason || rejectReason;
        
        // If "Other" was selected, use custom reason
        if (finalRejectReason === 'Other (specify below)') {
          finalRejectReason = values.customRejectReason || customRejectReason;
        }

        if (!finalRejectReason || finalRejectReason.trim().length < 5) {
          message.error('Vui lòng nhập lý do từ chối ít nhất 5 ký tự');
          return;
        }

        console.log('🚫 Processing handover rejection...');
        await rentalService.rejectHandover(
          rental._id,
          finalRejectReason,
          uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
          vehicleData
        );

        message.success('Đã từ chối giao xe và thông báo cho khách hàng');
      } else {
        // Handle accept flow (existing logic)
        if (uploadedPhotos.length < 3) {
          message.error('Vui lòng tải lên ít nhất 3 ảnh để giao xe');
          return;
        }

        console.log('✅ Processing handover acceptance...');
        await rentalService.acceptHandover(
          rental._id,
          uploadedPhotos,
          vehicleData
        );

        message.success('Xe đã được giao thành công!');
      }

      // Success - close modal and refresh
      form.resetFields();
      setFileList([]);
      setUploadedPhotos([]);
      setHandoverAction('accept');
      setRejectReason('');
      setCustomRejectReason('');
      onSuccess();

    } catch (error) {
      console.error('Submit error:', error);
      message.error(`Lỗi: ${(error as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Custom upload handling - upload immediately when file is selected
  const uploadProps: UploadProps = {
    multiple: true,
    accept: 'image/*',
    fileList,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const rcFile = file as RcFile;
        
        // Upload single file immediately
        const photoUrl = await uploadSingleFile(rcFile);
        
        // Add to uploaded photos list
        setUploadedPhotos(prev => [...prev, photoUrl]);
        
        // Mark as successful
        onSuccess?.(photoUrl);
      } catch (error) {
        console.error('Upload error:', error);
        onError?.(error as Error);
      }
    },
    beforeUpload: (file) => {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ có thể tải lên file ảnh!');
        return false;
      }

      // Validate file size (max 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        return false;
      }

      return true; // Allow upload
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      if (index > -1) {
        // Remove from uploaded photos list too
        const newUploadedPhotos = [...uploadedPhotos];
        newUploadedPhotos.splice(index, 1);
        setUploadedPhotos(newUploadedPhotos);
      }
      
      const newFileList = fileList.filter(item => item.uid !== file.uid);
      setFileList(newFileList);
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
    },
    listType: "picture-card",
  };

  return (
    <Modal
      title={
        <Space>
          <CameraOutlined />
          <span>Giao xe cho khách hàng</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <div className="mb-6">
        <Title level={4} className="mb-2">Thông tin booking</Title>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text strong>Khách hàng:</Text>
              <div>{rental.user_id.name}</div>
              <div className="text-gray-500">{rental.user_id.email}</div>
              {rental.user_id.phoneNumber && (
                <div className="text-gray-500">{rental.user_id.phoneNumber}</div>
              )}
            </div>
            <div>
              <Text strong>Xe:</Text>
              <div>{rental.vehicle_id.name}</div>
              <div className="text-gray-500">{rental.vehicle_id.brand}</div>
              {rental.vehicle_id.licensePlate && (
                <div className="text-gray-500">Biển số: {rental.vehicle_id.licensePlate}</div>
              )}
            </div>
          </div>
          <Divider className="my-3" />
          <div>
            <Text strong>Thông tin booking:</Text>
            <div>Booking ID: {rental.booking_id}</div>
            <div>Trạng thái: {rental.status}</div>
            <div>Tạo lúc: {new Date(rental.createdAt).toLocaleString('vi-VN')}</div>
            {rental.pricing_snapshot.deposit && (
              <div>Đặt cọc: {rental.pricing_snapshot.deposit.toLocaleString()} {rental.pricing_snapshot.currency}</div>
            )}
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          soc: 100, // Default battery level
          action: 'accept'
        }}
      >
        {/* Action Selection */}
        <Form.Item
          name="action"
          label="Hành động"
          rules={[{ required: true, message: 'Vui lòng chọn hành động!' }]}
        >
          <Radio.Group 
            onChange={(e) => setHandoverAction(e.target.value)}
            value={handoverAction}
            size="large"
          >
            <Space direction="vertical">
              <Radio value="accept" className="text-green-600">
                <Space>
                  <CheckCircleOutlined />
                  <span>Chấp nhận giao xe cho khách hàng</span>
                </Space>
              </Radio>
              <Radio value="reject" className="text-red-600">
                <Space>
                  <CloseCircleOutlined />
                  <span>Từ chối giao xe (có vấn đề)</span>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {/* Reject Reason Section - Only show when reject is selected */}
        {handoverAction === 'reject' && (
          <>
            <Form.Item
              name="rejectReason"
              label="Lý do từ chối"
              rules={[
                { required: true, message: 'Vui lòng chọn lý do từ chối!' },
                { min: 5, message: 'Lý do phải có ít nhất 5 ký tự!' }
              ]}
            >
              <Select
                placeholder="Chọn lý do từ chối"
                onChange={setRejectReason}
                size="large"
              >
                {COMMON_REJECT_REASONS.map(reason => (
                  <Select.Option key={reason} value={reason}>
                    {reason}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Custom Reject Reason - Show when "Other" is selected */}
            {rejectReason === 'Other (specify below)' && (
              <Form.Item
                name="customRejectReason"
                label="Lý do cụ thể"
                rules={[
                  { required: true, message: 'Vui lòng nhập lý do cụ thể!' },
                  { min: 5, message: 'Lý do phải có ít nhất 5 ký tự!' }
                ]}
              >
                <TextArea
                  placeholder="Nhập lý do từ chối chi tiết..."
                  rows={3}
                  maxLength={200}
                  showCount
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                />
              </Form.Item>
            )}
          </>
        )}

        <Form.Item
          label={
            <Space>
              <CameraOutlined />
              <span>
                {handoverAction === 'accept' 
                  ? 'Ảnh tình trạng xe khi giao (tối thiểu 3 ảnh)' 
                  : 'Ảnh minh chứng vấn đề (tùy chọn)'
                }
              </span>
            </Space>
          }
          required={handoverAction === 'accept'}
          help={handoverAction === 'accept' 
            ? "Cần chụp: 1) Toàn cảnh phía trước, 2) Nội thất xe, 3) Bảng điều khiển/đồng hồ"
            : "Chụp ảnh minh chứng vấn đề nếu có"
          }
        >
          <Upload.Dragger {...uploadProps} className="mb-2">
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Nhấp hoặc kéo ảnh vào đây để tải lên</p>
            <p className="ant-upload-hint">
              Hỗ trợ nhiều ảnh cùng lúc. Chỉ chấp nhận file ảnh, tối đa 5MB mỗi ảnh.
            </p>
          </Upload.Dragger>
          
          {fileList.length > 0 && (
            <div className="mt-2">
              <Text 
                type={fileList.length >= 3 ? "success" : "warning"}
                className="flex items-center"
              >
                {fileList.length >= 3 ? <CheckCircleOutlined /> : <LoadingOutlined />}
                <span className="ml-1">
                  Đã chọn {fileList.length} ảnh {fileList.length >= 3 ? '(Đủ điều kiện)' : '(Cần thêm ảnh)'}
                </span>
              </Text>
            </div>
          )}
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Số km hiện tại"
            name="odo_km"
            tooltip="Ghi nhận số km trên đồng hồ xe (không bắt buộc)"
          >
            <InputNumber
              placeholder={`VD: ${rental.vehicle_id.odo_km}`}
              style={{ width: '100%' }}
              min={0}
              max={999999}
              addonAfter="km"
            />
          </Form.Item>

          <Form.Item
            label="Mức pin hiện tại"
            name="soc"
            tooltip="Mức pin hiện tại của xe (0-100%)"
          >
            <InputNumber
              placeholder="VD: 85"
              style={{ width: '100%' }}
              min={0}
              max={100}
              addonAfter="%"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Ghi chú của nhân viên"
          name="notes"
          tooltip="Ghi chú về tình trạng xe, giấy tờ khách hàng, v.v."
        >
          <TextArea
            rows={3}
            placeholder="VD: Xe trong tình trạng tốt. Đã kiểm tra giấy tờ khách hàng."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="flex justify-end space-x-3">
          <Button onClick={onCancel} disabled={submitting}>
            Hủy
          </Button>
          
          {handoverAction === 'accept' ? (
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={uploadedPhotos.length < 3}
              icon={<CheckCircleOutlined />}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Đang giao xe...' : 'Xác nhận giao xe'}
            </Button>
          ) : (
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={!rejectReason || (rejectReason === 'Other (specify below)' && customRejectReason.length < 5)}
              icon={<CloseCircleOutlined />}
              danger
            >
              {submitting ? 'Đang từ chối...' : 'Xác nhận từ chối'}
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default CheckinForm;