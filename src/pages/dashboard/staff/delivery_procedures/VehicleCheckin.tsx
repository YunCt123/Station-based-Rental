import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Input, Upload, Button, message, Steps, Spin, Alert, Space, Typography, Divider } from 'antd';
import { CheckCircleOutlined, CameraOutlined, CarOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../../hooks/use-toast';
import { Toaster } from '../../../../components/ui/toaster';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;

interface CheckinFormData {
  photos: string[];
  odo_km?: number;
  soc?: number;
  notes?: string;
}

interface Rental {
  _id: string;
  status: string;
  vehicle_snapshot?: {
    name: string;
    type: string;
    brand: string;
    licensePlate: string;
  };
  station_snapshot?: {
    name: string;
    address: string;
  };
  start_at: string;
  end_at: string;
}

const VehicleCheckin: React.FC = () => {
  const { id: rentalId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [rental, setRental] = useState<Rental | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Fetch rental details
  useEffect(() => {
    const fetchRental = async () => {
      if (!rentalId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/rentals/${rentalId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRental(data.data);
          } else {
            throw new Error('Failed to fetch rental');
          }
        } else {
          throw new Error('Failed to fetch rental');
        }
      } catch (error) {
        console.error('Error fetching rental:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin booking",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRental();
  }, [rentalId, toast]);

  // Handle photo upload
  const handleUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/v1/upload/rental-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.url) {
          return data.data.url;
        }
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const uploadProps: UploadProps = {
    name: 'photo',
    multiple: true,
    listType: 'picture-card',
    fileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ được upload file ảnh!');
        return false;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Kích thước ảnh phải nhỏ hơn 10MB!');
        return false;
      }
      
      return false; // Prevent automatic upload
    },
    onChange: async ({ fileList: newFileList }) => {
      setFileList(newFileList);

      // Upload new files
      const newFiles = newFileList.filter(file => 
        file.status === undefined && 
        file.originFileObj &&
        !uploadedPhotos.some(url => file.uid === url)
      );

      if (newFiles.length > 0) {
        setUploading(true);
        try {
          const uploadPromises = newFiles.map(async (file) => {
            if (file.originFileObj) {
              const url = await handleUpload(file.originFileObj);
              file.status = 'done';
              file.url = url;
              return url;
            }
            return '';
          });

          const urls = await Promise.all(uploadPromises);
          const validUrls = urls.filter(url => url !== '');
          setUploadedPhotos(prev => [...prev, ...validUrls]);
          
          toast({
            title: "Thành công",
            description: `Đã tải lên ${validUrls.length} ảnh`,
          });
        } catch (error) {
          message.error('Lỗi khi tải ảnh lên');
        } finally {
          setUploading(false);
        }
      }
    },
    onRemove: (file) => {
      if (file.url) {
        setUploadedPhotos(prev => prev.filter(url => url !== file.url));
      }
    }
  };

  const handleCheckin = async (values: CheckinFormData) => {
    if (!rentalId || uploadedPhotos.length < 3) {
      message.error('Cần tối thiểu 3 ảnh để thực hiện checkin');
      return;
    }

    setLoading(true);
    try {
      const checkinData = {
        photos: uploadedPhotos,
        odo_km: values.odo_km,
        soc: values.soc ? values.soc / 100 : undefined, // Convert percentage to decimal
        notes: values.notes
      };

      const response = await fetch(`/api/v1/rentals/${rentalId}/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkinData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: "Thành công",
            description: "Đã giao xe thành công cho khách hàng",
          });
          
          setCurrentStep(2); // Move to success step
          
          // Navigate to staff dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard/staff');
          }, 2000);
        } else {
          throw new Error(data.message || 'Checkin failed');
        }
      } else {
        throw new Error('Network error');
      }
    } catch (error: any) {
      console.error('Checkin error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thực hiện giao xe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Thông tin booking',
      icon: <EyeOutlined />,
    },
    {
      title: 'Chụp ảnh & ghi nhận',
      icon: <CameraOutlined />,
    },
    {
      title: 'Hoàn tất giao xe',
      icon: <CheckCircleOutlined />,
    },
  ];

  if (loading && !rental) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Đang tải thông tin booking..." />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="p-6">
        <Alert
          message="Không tìm thấy booking"
          description="Booking không tồn tại hoặc bạn không có quyền truy cập"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster />
      
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="flex items-center">
          <CarOutlined className="mr-3 text-blue-600" />
          Giao xe cho khách hàng
        </Title>
        <Text type="secondary">
          Thực hiện checkin và giao xe theo quy trình chuẩn
        </Text>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <Steps current={currentStep} items={steps} />
      </div>

      {/* Step 0: Rental Information */}
      {currentStep === 0 && (
        <Card title="Thông tin booking cần giao xe" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Title level={4}>Thông tin xe</Title>
              <Space direction="vertical" size="small" className="w-full">
                <div><strong>Xe:</strong> {rental.vehicle_snapshot?.name}</div>
                <div><strong>Loại:</strong> {rental.vehicle_snapshot?.type}</div>
                <div><strong>Hãng:</strong> {rental.vehicle_snapshot?.brand}</div>
                <div><strong>Biển số:</strong> {rental.vehicle_snapshot?.licensePlate}</div>
              </Space>
            </div>
            
            <div>
              <Title level={4}>Thông tin thuê</Title>
              <Space direction="vertical" size="small" className="w-full">
                <div><strong>Trạm:</strong> {rental.station_snapshot?.name}</div>
                <div><strong>Địa chỉ:</strong> {rental.station_snapshot?.address}</div>
                <div><strong>Bắt đầu:</strong> {new Date(rental.start_at).toLocaleString('vi-VN')}</div>
                <div><strong>Kết thúc:</strong> {new Date(rental.end_at).toLocaleString('vi-VN')}</div>
              </Space>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="primary" 
              onClick={() => setCurrentStep(1)}
              size="large"
            >
              Tiếp tục giao xe
            </Button>
          </div>
        </Card>
      )}

      {/* Step 1: Photo Upload & Details */}
      {currentStep === 1 && (
        <Card title="Chụp ảnh và ghi nhận tình trạng xe">
          <Form form={form} layout="vertical" onFinish={handleCheckin}>
            
            {/* Photo Upload Section */}
            <div className="mb-8">
              <Title level={4}>📸 Chụp ảnh xe (Tối thiểu 3 ảnh)</Title>
              <Text type="secondary" className="block mb-4">
                Bắt buộc: Mặt trước xe, Nội thất, Dashboard. Khuyến nghị thêm: Mặt sau, Bánh xe, Cổng sạc
              </Text>
              
              <Upload {...uploadProps} className="upload-list-inline">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer">
                  <CameraOutlined className="text-4xl text-gray-400 mb-2" />
                  <div className="text-lg font-medium">Chụp/Tải ảnh</div>
                  <div className="text-sm text-gray-500">PNG, JPG tối đa 10MB</div>
                </div>
              </Upload>
              
              {uploadedPhotos.length > 0 && (
                <Alert
                  message={`Đã tải lên ${uploadedPhotos.length} ảnh`}
                  type={uploadedPhotos.length >= 3 ? "success" : "warning"}
                  className="mt-4"
                />
              )}
            </div>

            <Divider />

            {/* Vehicle Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Form.Item
                name="odo_km"
                label="Số km hiện tại"
                rules={[{ type: 'number', min: 0, message: 'Số km phải lớn hơn 0' }]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="Nhập số km"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="km"
                />
              </Form.Item>

              <Form.Item
                name="soc"
                label="Mức pin hiện tại (%)"
                rules={[
                  { type: 'number', min: 0, max: 100, message: 'Mức pin từ 0-100%' }
                ]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="Nhập % pin"
                  addonAfter={<BatteryChargingOutlined />}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="notes"
              label="Ghi chú"
            >
              <TextArea
                rows={4}
                placeholder="Ghi chú về tình trạng xe, xác nhận danh tính khách hàng..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button 
                onClick={() => setCurrentStep(0)}
                size="large"
              >
                Quay lại
              </Button>
              
              <Button
                type="primary"
                htmlType="submit"
                loading={loading || uploading}
                disabled={uploadedPhotos.length < 3}
                size="large"
              >
                Hoàn tất giao xe
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* Step 2: Success */}
      {currentStep === 2 && (
        <Card className="text-center">
          <div className="py-12">
            <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
            <Title level={2} className="text-green-600">Giao xe thành công!</Title>
            <Text type="secondary" className="text-lg">
              Xe {rental.vehicle_snapshot?.name} ({rental.vehicle_snapshot?.licensePlate}) 
              đã được giao cho khách hàng
            </Text>
            
            <div className="mt-8">
              <Space>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/dashboard/staff')}
                  size="large"
                >
                  Về Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard/staff/vehicle/rented')}
                  size="large"
                >
                  Xem xe đang thuê
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      )}

      {/* Validation Alert */}
      {rental.status !== 'CONFIRMED' && (
        <Alert
          message="Trạng thái booking không hợp lệ"
          description={`Booking phải ở trạng thái CONFIRMED để có thể giao xe. Trạng thái hiện tại: ${rental.status}`}
          type="warning"
          showIcon
          className="mt-4"
        />
      )}
    </div>
  );
};

export default VehicleCheckin;