import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Input, Upload, Button, message, Steps, Spin, Alert, Space, Typography, Divider, Select, Modal } from 'antd';
import { CheckCircleOutlined, CameraOutlined, CarOutlined, BatteryChargingOutlined, DollarOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../../hooks/use-toast';
import { Toaster } from '../../../../components/ui/toaster';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

interface ExtraFee {
  type: 'DAMAGE' | 'CLEANING' | 'LATE' | 'OTHER';
  amount: number;
  description: string;
}

interface ReturnFormData {
  photos: string[];
  odo_km: number;
  soc: number;
  extraFees?: ExtraFee[];
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
  pickup?: {
    odo_km?: number;
    soc?: number;
  };
}

interface PaymentBreakdown {
  totalCharges: number;
  depositPaid: number;
  finalAmount: number;
  extraFees: ExtraFee[];
}

const VehicleReturn: React.FC = () => {
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
  const [extraFees, setExtraFees] = useState<ExtraFee[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string>('');

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
          description: "Không thể tải thông tin rental",
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

  const addExtraFee = () => {
    setExtraFees(prev => [...prev, { type: 'DAMAGE', amount: 0, description: '' }]);
  };

  const removeExtraFee = (index: number) => {
    setExtraFees(prev => prev.filter((_, i) => i !== index));
  };

  const updateExtraFee = (index: number, field: keyof ExtraFee, value: any) => {
    setExtraFees(prev => prev.map((fee, i) => 
      i === index ? { ...fee, [field]: value } : fee
    ));
  };

  const handleReturn = async (values: ReturnFormData) => {
    if (!rentalId || uploadedPhotos.length < 4) {
      message.error('Cần tối thiểu 4 ảnh để thực hiện trả xe');
      return;
    }

    setLoading(true);
    try {
      const returnData = {
        photos: uploadedPhotos,
        odo_km: values.odo_km,
        soc: values.soc / 100, // Convert percentage to decimal
        extraFees: extraFees.filter(fee => fee.amount > 0 && fee.description.trim())
      };

      const response = await fetch(`/api/v1/rentals/${rentalId}/return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(returnData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const { finalPayment, paymentBreakdown } = data.data;
          
          setPaymentBreakdown(paymentBreakdown);
          
          if (finalPayment.amount > 0) {
            // Need additional payment
            setPaymentUrl(finalPayment.vnpay_checkout_url);
            setCurrentStep(2); // Payment step
          } else if (finalPayment.amount < 0) {
            // Refund required
            setCurrentStep(3); // Success with refund
          } else {
            // No additional payment needed
            setCurrentStep(3); // Success
          }
          
          toast({
            title: "Thành công",
            description: "Đã nhận xe trả về thành công",
          });
        } else {
          throw new Error(data.message || 'Return failed');
        }
      } else {
        throw new Error('Network error');
      }
    } catch (error: any) {
      console.error('Return error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thực hiện trả xe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalPayment = async () => {
    if (!rentalId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/v1/payments/rentals/${rentalId}/final`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/payment-result`
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.payment.vnpay_checkout_url) {
          // Redirect to VNPay
          window.location.href = data.data.payment.vnpay_checkout_url;
        } else {
          throw new Error('Failed to create payment');
        }
      } else {
        throw new Error('Network error');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo thanh toán",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Thông tin rental',
      icon: <CarOutlined />,
    },
    {
      title: 'Chụp ảnh & kiểm tra',
      icon: <CameraOutlined />,
    },
    {
      title: 'Thanh toán cuối',
      icon: <DollarOutlined />,
    },
    {
      title: 'Hoàn tất',
      icon: <CheckCircleOutlined />,
    },
  ];

  if (loading && !rental) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Đang tải thông tin rental..." />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="p-6">
        <Alert
          message="Không tìm thấy rental"
          description="Rental không tồn tại hoặc bạn không có quyền truy cập"
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
          <CarOutlined className="mr-3 text-orange-600" />
          Nhận xe trả về
        </Title>
        <Text type="secondary">
          Kiểm tra và nhận xe từ khách hàng theo quy trình chuẩn
        </Text>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <Steps current={currentStep} items={steps} />
      </div>

      {/* Step 0: Rental Information */}
      {currentStep === 0 && (
        <Card title="Thông tin rental cần trả xe">
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
              <Title level={4}>Thông tin ban đầu</Title>
              <Space direction="vertical" size="small" className="w-full">
                <div><strong>Trạm:</strong> {rental.station_snapshot?.name}</div>
                <div><strong>Giao lúc:</strong> {new Date(rental.start_at).toLocaleString('vi-VN')}</div>
                <div><strong>Hạn trả:</strong> {new Date(rental.end_at).toLocaleString('vi-VN')}</div>
                {rental.pickup?.odo_km && <div><strong>Km lúc giao:</strong> {rental.pickup.odo_km.toLocaleString()} km</div>}
                {rental.pickup?.soc && <div><strong>Pin lúc giao:</strong> {Math.round(rental.pickup.soc * 100)}%</div>}
              </Space>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="primary" 
              onClick={() => setCurrentStep(1)}
              size="large"
            >
              Tiếp tục nhận xe
            </Button>
          </div>
        </Card>
      )}

      {/* Step 1: Photo Upload & Return Details */}
      {currentStep === 1 && (
        <Card title="Chụp ảnh và ghi nhận tình trạng xe trả về">
          <Form form={form} layout="vertical" onFinish={handleReturn}>
            
            {/* Photo Upload Section */}
            <div className="mb-8">
              <Title level={4}>📸 Chụp ảnh xe (Tối thiểu 4 ảnh)</Title>
              <Text type="secondary" className="block mb-4">
                Bắt buộc: Mặt trước, Nội thất, Dashboard, Mặt sau. Khuyến nghị thêm: Chi tiết hư hỏng (nếu có)
              </Text>
              
              <Upload {...uploadProps} className="upload-list-inline">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 cursor-pointer">
                  <CameraOutlined className="text-4xl text-gray-400 mb-2" />
                  <div className="text-lg font-medium">Chụp/Tải ảnh</div>
                  <div className="text-sm text-gray-500">PNG, JPG tối đa 10MB</div>
                </div>
              </Upload>
              
              {uploadedPhotos.length > 0 && (
                <Alert
                  message={`Đã tải lên ${uploadedPhotos.length} ảnh`}
                  type={uploadedPhotos.length >= 4 ? "success" : "warning"}
                  className="mt-4"
                />
              )}
            </div>

            <Divider />

            {/* Vehicle Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Form.Item
                name="odo_km"
                label="Số km hiện tại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số km' },
                  { type: 'number', min: rental.pickup?.odo_km || 0, message: `Số km phải lớn hơn ${rental.pickup?.odo_km || 0} km` }
                ]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="Nhập số km hiện tại"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="km"
                />
              </Form.Item>

              <Form.Item
                name="soc"
                label="Mức pin hiện tại (%)"
                rules={[
                  { required: true, message: 'Vui lòng nhập mức pin' },
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

            {/* Extra Fees Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <Title level={4}>Phí phát sinh</Title>
                <Button onClick={addExtraFee} type="dashed">
                  Thêm phí
                </Button>
              </div>
              
              {extraFees.map((fee, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 mb-4 p-4 border rounded-lg">
                  <div className="col-span-3">
                    <Select
                      value={fee.type}
                      onChange={(value) => updateExtraFee(index, 'type', value)}
                      className="w-full"
                      placeholder="Loại phí"
                    >
                      <Option value="DAMAGE">Hư hỏng</Option>
                      <Option value="CLEANING">Vệ sinh</Option>
                      <Option value="LATE">Trả muộn</Option>
                      <Option value="OTHER">Khác</Option>
                    </Select>
                  </div>
                  
                  <div className="col-span-3">
                    <InputNumber
                      value={fee.amount}
                      onChange={(value) => updateExtraFee(index, 'amount', value || 0)}
                      className="w-full"
                      placeholder="Số tiền"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      addonAfter="VND"
                    />
                  </div>
                  
                  <div className="col-span-5">
                    <Input
                      value={fee.description}
                      onChange={(e) => updateExtraFee(index, 'description', e.target.value)}
                      placeholder="Mô tả chi tiết"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <Button 
                      onClick={() => removeExtraFee(index)}
                      danger
                      type="text"
                      icon={<ExclamationCircleOutlined />}
                    />
                  </div>
                </div>
              ))}
            </div>

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
                disabled={uploadedPhotos.length < 4}
                size="large"
              >
                Hoàn tất nhận xe
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* Step 2: Payment Required */}
      {currentStep === 2 && paymentBreakdown && (
        <Card title="Thanh toán bổ sung cần thiết">
          <div className="text-center py-8">
            <DollarOutlined className="text-6xl text-orange-500 mb-4" />
            <Title level={3}>Cần thanh toán thêm</Title>
            
            <div className="bg-gray-50 rounded-lg p-6 my-6 max-w-md mx-auto">
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span>Tổng chi phí:</span>
                  <span className="font-semibold">{paymentBreakdown.totalCharges.toLocaleString()} VND</span>
                </div>
                <div className="flex justify-between">
                  <span>Đã cọc:</span>
                  <span className="text-green-600">-{paymentBreakdown.depositPaid.toLocaleString()} VND</span>
                </div>
                {paymentBreakdown.extraFees.map((fee, index) => (
                  <div key={index} className="flex justify-between text-sm text-orange-600">
                    <span>{fee.description}:</span>
                    <span>+{fee.amount.toLocaleString()} VND</span>
                  </div>
                ))}
                <Divider className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Cần thanh toán:</span>
                  <span className="text-red-600">{paymentBreakdown.finalAmount.toLocaleString()} VND</span>
                </div>
              </div>
            </div>

            <Space>
              <Button 
                type="primary" 
                size="large"
                onClick={handleFinalPayment}
                loading={loading}
              >
                Thanh toán qua VNPay
              </Button>
              
              {paymentUrl && (
                <Button 
                  onClick={() => window.open(paymentUrl, '_blank')}
                  size="large"
                >
                  Mở link thanh toán
                </Button>
              )}
            </Space>
          </div>
        </Card>
      )}

      {/* Step 3: Success */}
      {currentStep === 3 && (
        <Card className="text-center">
          <div className="py-12">
            <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
            <Title level={2} className="text-green-600">Nhận xe thành công!</Title>
            <Text type="secondary" className="text-lg">
              Xe {rental.vehicle_snapshot?.name} ({rental.vehicle_snapshot?.licensePlate}) 
              đã được nhận trả về
            </Text>
            
            {paymentBreakdown && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                <div className="text-sm space-y-1">
                  {paymentBreakdown.finalAmount > 0 && (
                    <div className="text-orange-600">
                      ⚠️ Khách hàng cần thanh toán thêm: {paymentBreakdown.finalAmount.toLocaleString()} VND
                    </div>
                  )}
                  {paymentBreakdown.finalAmount < 0 && (
                    <div className="text-blue-600">
                      💰 Hoàn tiền cho khách: {Math.abs(paymentBreakdown.finalAmount).toLocaleString()} VND
                    </div>
                  )}
                  {paymentBreakdown.finalAmount === 0 && (
                    <div className="text-green-600">
                      ✅ Không cần thanh toán thêm
                    </div>
                  )}
                </div>
              </div>
            )}
            
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
                  onClick={() => navigate('/dashboard/staff/vehicle/available')}
                  size="large"
                >
                  Xem xe có sẵn
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      )}

      {/* Validation Alert */}
      {rental.status !== 'ONGOING' && (
        <Alert
          message="Trạng thái rental không hợp lệ"
          description={`Rental phải ở trạng thái ONGOING để có thể trả xe. Trạng thái hiện tại: ${rental.status}`}
          type="warning"
          showIcon
          className="mt-4"
        />
      )}
    </div>
  );
};

export default VehicleReturn;