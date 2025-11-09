import React, { useState, useEffect } from 'react';
import { Modal, Form, Upload, InputNumber, Input, Button, message, Typography, Space, Divider, Card, Tag } from 'antd';
import { UploadOutlined, CheckCircleOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import type { RcFile } from 'antd/es/upload/interface';
import api from '../../../../services/api';
import bookingService from '../../../../services/bookingService';

const { Title, Text } = Typography;

interface VehicleReturnFormProps {
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

interface ExtraFee {
  type: 'DAMAGE' | 'CLEANING' | 'LATE' | 'OTHER';
  amount: number;
  description: string;
}

interface ReturnData {
  photos: string[];
  odo_km: number;
  soc: number;
  extraFees?: ExtraFee[];
}

const VehicleReturnForm: React.FC<VehicleReturnFormProps> = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  rental 
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [extraFees, setExtraFees] = useState<ExtraFee[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [bookingData, setBookingData] = useState<{ end_at?: string; [key: string]: unknown } | null>(null); // Store booking info

  // Fetch booking data when modal opens
  useEffect(() => {
    if (visible && rental.booking_id) {
      const fetchBookingData = async () => {
        try {
          const booking = await bookingService.getBookingById(rental.booking_id);
          setBookingData(booking as { end_at?: string; [key: string]: unknown });
        } catch (error) {
          console.warn('Could not fetch booking data:', error);
        }
      };
      fetchBookingData();
    }
  }, [visible, rental.booking_id]);

  // Calculate if rental is overdue and suggest late fee
  const overdueInfo = React.useMemo(() => {
    const now = new Date();
    let expectedReturnDate: Date | null = null;
    
    // First try to use booking end_at
    if (bookingData && bookingData.end_at) {
      expectedReturnDate = new Date(bookingData.end_at);
    } 
    // Fallback: calculate from pickup time
    else if (rental.pickup?.at) {
      const pickupDate = new Date(rental.pickup.at);
      expectedReturnDate = new Date(pickupDate);
      
      if (rental.pricing_snapshot?.daily_rate) {
        expectedReturnDate.setDate(expectedReturnDate.getDate() + 1);
      } else if (rental.pricing_snapshot?.hourly_rate) {
        expectedReturnDate.setHours(expectedReturnDate.getHours() + 8);
      } else {
        expectedReturnDate.setHours(expectedReturnDate.getHours() + 24);
      }
    } else {
      return null;
    }
    
    if (expectedReturnDate && now > expectedReturnDate) {
      expectedReturnDate.setHours(expectedReturnDate.getHours() + 8);
    } else {
      expectedReturnDate.setHours(expectedReturnDate.getHours() + 24);
    }
    
    if (now > expectedReturnDate) {
      const timeDiff = now.getTime() - expectedReturnDate.getTime();
      const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      // Calculate late fee: 50,000 VND per hour or 500,000 VND per day
      let lateFee = 0;
      if (rental.pricing_snapshot?.daily_rate) {
        lateFee = daysDiff * 500000; // 500k per day
      } else {
        lateFee = hoursDiff * 50000; // 50k per hour
      }
      
      return {
        isOverdue: true,
        hoursDiff,
        daysDiff,
        suggestedFee: lateFee,
        description: `Trả muộn ${daysDiff > 0 ? `${daysDiff} ngày` : `${hoursDiff} giờ`}`
      };
    }
    
    return { isOverdue: false };
  }, [rental.pickup?.at, rental.pricing_snapshot]);

  // Auto-add late fee if overdue
  React.useEffect(() => {
    if (overdueInfo?.isOverdue && 
        overdueInfo.suggestedFee !== undefined && 
        overdueInfo.description !== undefined &&
        overdueInfo.suggestedFee > 0) {
      // Check if late fee already exists
      const hasLateFee = extraFees.some(fee => fee.type === 'LATE');
      if (!hasLateFee) {
        setExtraFees(prev => [...prev, {
          type: 'LATE',
          amount: overdueInfo.suggestedFee!,
          description: overdueInfo.description!
        }]);
      }
    }
  }, [overdueInfo, extraFees]);

  // Upload single file immediately when selected
  const uploadSingleFile = async (file: RcFile): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/upload/single-return-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('📤 Return upload response:', response.data);
      
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
          console.log('✅ Return photo uploaded:', photoUrl);
          message.success('Tải ảnh thành công!');
          return photoUrl;
        } else {
          throw new Error('No photo URL found in response');
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Return photo upload error:', error);
      
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

  // Perform vehicle return inspection (new API)
  const performReturnInspection = async (imageUrls: string[], formData: ReturnData) => {
    try {
      console.log('🔙 Processing vehicle return inspection...');
      
      const inspectionPayload = {
        photos: imageUrls,
        odo_km: formData.odo_km,
        soc: formData.soc / 100, // Convert percentage to decimal
        extraFees: formData.extraFees || []
      };

      console.log('Return inspection payload:', inspectionPayload);

      const response = await api.post(`/rentals/${rental._id}/return-inspection`, inspectionPayload);
      
      if (response.data.success) {
        console.log('✅ Return inspection successful:', response.data);
        message.success('Kiểm tra trả xe thành công! Chờ khách hàng thanh toán cuối.');
        
        // Show charges information
        const { charges } = response.data.data;
        if (charges) {
          const rentalFee = charges.rental_fee?.toLocaleString() || '0';
          const extraFees = charges.extra_fees?.toLocaleString() || '0';
          const total = charges.total?.toLocaleString() || '0';
          
          message.info({
            content: (
              <div>
                <div><strong>Phí thuê xe:</strong> {rentalFee} VND</div>
                <div><strong>Phí phát sinh:</strong> {extraFees} VND</div>
                <div><strong>Tổng cộng:</strong> {total} VND</div>
                <div style={{ marginTop: 8, fontWeight: 'bold' }}>
                  Trạng thái: Chờ khách hàng thanh toán cuối
                </div>
              </div>
            ),
            duration: 10
          });
        }
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Return inspection failed');
      }
    } catch (error: unknown) {
      console.error('❌ Return inspection failed:', error);
      
      let errorMessage = 'Không thể kiểm tra xe trả';
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
    odo_km: number;
    soc: number;
  }) => {
    try {
      // Validate images
      if (uploadedPhotos.length < 4) {
        message.error('Vui lòng chụp ít nhất 4 ảnh để kiểm tra xe trả');
        return;
      }

      setSubmitting(true);

      // Use pre-uploaded photos
      const returnData: ReturnData = {
        photos: uploadedPhotos,
        odo_km: values.odo_km,
        soc: values.soc,
        extraFees: extraFees.length > 0 ? extraFees : undefined
      };

      await performReturnInspection(uploadedPhotos, returnData);

      // Success - close modal and refresh
      form.resetFields();
      setFileList([]);
      setUploadedPhotos([]);
      setExtraFees([]);
      onSuccess();

    } catch (error) {
      console.error('Submit error:', error);
      message.error(`Lỗi kiểm tra xe trả: ${(error as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Add extra fee
  const addExtraFee = () => {
    setExtraFees([...extraFees, { type: 'DAMAGE', amount: 0, description: '' }]);
  };

  // Remove extra fee
  const removeExtraFee = (index: number) => {
    const newFees = extraFees.filter((_, i) => i !== index);
    setExtraFees(newFees);
  };

  // Update extra fee
  const updateExtraFee = (index: number, field: keyof ExtraFee, value: string | number) => {
    const newFees = [...extraFees];
    newFees[index] = { ...newFees[index], [field]: value };
    setExtraFees(newFees);
  };

  // Custom upload handling
  const uploadProps: UploadProps = {
    multiple: true,
    accept: 'image/*',
    fileList,
    listType: 'picture-card',
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const photoUrl = await uploadSingleFile(file as RcFile);
        setUploadedPhotos(prev => [...prev, photoUrl]);
        onSuccess?.(photoUrl);
      } catch (error) {
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
      // Remove from uploaded photos array
      const fileIndex = fileList.indexOf(file);
      if (fileIndex !== -1) {
        const newUploadedPhotos = [...uploadedPhotos];
        newUploadedPhotos.splice(fileIndex, 1);
        setUploadedPhotos(newUploadedPhotos);
      }
      
      // Remove from file list
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
  };

  return (
    <Modal
      title={
        <Space>
          <CheckCircleOutlined />
          <span>Kiểm tra xe trả từ khách hàng</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={null}
      destroyOnClose
    >
      <div className="mb-6">
        <Title level={4} className="mb-2">Thông tin rental</Title>
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
              <div className="text-gray-500">{rental.vehicle_id.brand} {rental.vehicle_id.model}</div>
              {rental.vehicle_id.licensePlate && (
                <div className="text-gray-500">Biển số: {rental.vehicle_id.licensePlate}</div>
              )}
            </div>
          </div>
          
          {rental.pickup?.at && (() => {
            const pickupDate = new Date(rental.pickup.at);
            const now = new Date();
            
            // Calculate expected return date
            const expectedReturnDate = new Date(pickupDate);
            if (rental.pricing_snapshot?.daily_rate) {
              expectedReturnDate.setDate(expectedReturnDate.getDate() + 1);
            } else if (rental.pricing_snapshot?.hourly_rate) {
              expectedReturnDate.setHours(expectedReturnDate.getHours() + 8);
            } else {
              expectedReturnDate.setHours(expectedReturnDate.getHours() + 24);
            }
            
            const isOverdue = now > expectedReturnDate;
            const timeDiff = Math.abs(now.getTime() - expectedReturnDate.getTime());
            const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            
            let timeDisplay = '';
            if (daysDiff > 1) {
              timeDisplay = `${daysDiff} ngày`;
            } else {
              timeDisplay = `${hoursDiff} giờ`;
            }

            return (
              <>
                <Divider className="my-3" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text strong>Thông tin giao xe:</Text>
                    <div>Đã giao lúc: {new Date(rental.pickup.at).toLocaleString('vi-VN')}</div>
                    {rental.pickup.odo_km && (
                      <div>Km khi giao: {rental.pickup.odo_km.toLocaleString()} km</div>
                    )}
                    {rental.pickup.soc && (
                      <div>Pin khi giao: {Math.round(rental.pickup.soc * 100)}%</div>
                    )}
                  </div>
                  <div>
                    <Text strong>Thời hạn trả xe:</Text>
                    <div className={isOverdue ? "text-red-600 font-semibold" : "font-medium"}>
                      Dự kiến: {expectedReturnDate.toLocaleDateString('vi-VN')} {expectedReturnDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={`text-sm ${isOverdue ? "text-red-500 font-medium" : "text-orange-500"}`}>
                      {isOverdue ? `Quá hạn ${timeDisplay}` : `Còn ${timeDisplay}`}
                    </div>
                    {isOverdue && (
                      <div className="text-xs text-red-400 mt-1">
                         Phát sinh phí trả muộn
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          odo_km: rental.pickup?.odo_km || rental.vehicle_id.odo_km,
          soc: rental.pickup?.soc ? Math.round(rental.pickup.soc * 100) : rental.vehicle_id.batteryLevel
        }}
      >
        <Form.Item
          label={
            <Space>
              <UploadOutlined />
              <span>Ảnh tình trạng xe khi trả</span>
              <Tag color={uploadedPhotos.length >= 4 ? "success" : "warning"}>
                {uploadedPhotos.length}/4 bức
              </Tag>
            </Space>
          }
          required
        >
          <div className="space-y-4">
            {/* Upload Area with Picture Cards */}
            <div className="space-y-3">
              {/* Progress Indicator */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                </div>
                
                <Text 
                  type={uploadedPhotos.length >= 4 ? "success" : "warning"}
                  className="flex items-center"
                >
                  {uploadedPhotos.length >= 4 ? 
                    <>
                      <CheckCircleOutlined className="mr-1" />
                      <span>Đã đủ ảnh yêu cầu</span>
                    </> :
                    <>
                    </>
                  }
                </Text>
              </div>

              {/* Picture Upload */}
              <Upload {...uploadProps}>
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all duration-200 cursor-pointer">
                  <PlusOutlined className="text-xl text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Thêm ảnh</span>
                </div>
              </Upload>
            </div>
          </div>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Số km cuối cùng"
            name="odo_km"
            tooltip="Ghi nhận số km trên đồng hồ xe khi trả"
            rules={[{ required: true, message: 'Vui lòng nhập số km cuối cùng' }]}
          >
            <InputNumber
              placeholder="VD: 15450"
              style={{ width: '100%' }}
              min={rental.pickup?.odo_km || 0}
              max={999999}
              addonAfter="km"
            />
          </Form.Item>

          <Form.Item
            label="Mức pin cuối cùng"
            name="soc"
            tooltip="Mức pin hiện tại của xe khi trả (0-100%)"
            rules={[{ required: true, message: 'Vui lòng nhập mức pin cuối cùng' }]}
          >
            <InputNumber
              placeholder="VD: 75"
              style={{ width: '100%' }}
              min={0}
              max={100}
              addonAfter="%"
            />
          </Form.Item>
        </div>

        {/* Extra Fees Section */}
        <Form.Item label="Phí phát sinh">
          <Card size="small" className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <Text strong>Danh sách phí phát sinh</Text>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={addExtraFee}
                size="small"
              >
                Thêm phí
              </Button>
            </div>
            
            {extraFees.length === 0 ? (
              <Text type="secondary">Không có phí phát sinh</Text>
            ) : (
              extraFees.map((fee, index) => (
                <div key={index} className="border p-3 rounded mb-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <select
                        value={fee.type}
                        onChange={(e) => updateExtraFee(index, 'type', e.target.value)}
                        className="w-full p-1 border rounded"
                      >
                        <option value="DAMAGE">Hư hỏng</option>
                        <option value="CLEANING">Vệ sinh</option>
                        <option value="LATE">Trả muộn</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <InputNumber
                        placeholder="Số tiền"
                        value={fee.amount}
                        onChange={(value) => updateExtraFee(index, 'amount', value || 0)}
                        style={{ width: '100%' }}
                        min={0}
                        addonAfter="VND"
                      />
                    </div>
                    <div className="col-span-5">
                      <Input
                        placeholder="Mô tả chi tiết"
                        value={fee.description}
                        onChange={(e) => updateExtraFee(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => removeExtraFee(index)}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {extraFees.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <Text strong>
                  Tổng phí phát sinh: {extraFees.reduce((sum, fee) => sum + fee.amount, 0).toLocaleString()} VND
                </Text>
              </div>
            )}
          </Card>
        </Form.Item>

        <div className="flex justify-end space-x-3">
          <Button onClick={onCancel} disabled={submitting}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            disabled={uploadedPhotos.length < 4}
            icon={<CheckCircleOutlined />}
          >
            {submitting ? 'Đang kiểm tra...' : 'Xác nhận kiểm tra xe trả'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default VehicleReturnForm;