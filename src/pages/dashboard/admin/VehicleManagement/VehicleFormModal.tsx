import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Divider,
  Upload,
  Button,
  message
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { adminStationService, type AdminStation } from '../../../../services/adminStationService';
import api from '../../../../services/api';

const { Option } = Select;
const { TextArea } = Input;

// Form values interface matching backend requirements
interface VehicleFormValues {
  name: string;
  year: number;
  brand: string;
  model: string;
  type: string;
  licensePlate: string;
  seats: number;
  pricePerHour: number;
  pricePerDay: number;
  battery_kWh: number;
  batteryLevel: number;
  range: number;
  odo_km: number;
  features: string[];
  condition: 'excellent' | 'good' | 'fair';
  description: string;
  tags: string[];
  image: string;
  station_id: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'RESERVED';
  currency: string;
}

interface Vehicle {
  _id?: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  year: number;
  seats: number;
  batteryLevel: number;
  battery_kWh: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'RESERVED';
  image: string;
  licensePlate: string;
  odo_km: number;
  station_id?: string | {
    _id: string;
    name: string;
    city: string;
  };
  pricePerHour: number;
  pricePerDay: number;
  currency: string;
  condition: string;
  range: number;
  features: string[];
  tags: string[];
  description?: string;
}

interface VehicleFormModalProps {
  visible: boolean;
  vehicle: Vehicle | null;
  onCancel: () => void;
  onSubmit: (values: VehicleFormValues) => Promise<void>;
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  visible,
  vehicle,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();
  const [stations, setStations] = useState<AdminStation[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const isEditing = !!vehicle;

  // Upload image to backend immediately when selected
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      console.log('=== UPLOADING IMAGE TO CLOUDINARY ===');
      console.log('File:', file);
      
      const response = await api.post('/upload/vehicle-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      
      if (response.data.success && response.data.data?.url) {
        const cloudinaryUrl = response.data.data.url;
        console.log('Cloudinary URL:', cloudinaryUrl);
        return cloudinaryUrl;
      } else {
        throw new Error('No URL returned from upload service');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // Handle file selection - upload immediately to get Cloudinary URL
  const handleImageUpload = async (file: File) => {
    try {
      console.log('=== HANDLE IMAGE UPLOAD DEBUG ===');
      console.log('Received file:', file);
      
      // Show uploading state
      setImageFileList([{
        uid: '-1',
        name: file.name,
        status: 'uploading',
      }]);
      
      message.loading('Đang tải ảnh lên...', 0);
      
      // Upload to Cloudinary immediately
      const cloudinaryUrl = await uploadImageToCloudinary(file);
      
      // Update UI with success
      setImageFileList([{
        uid: '-1',
        name: file.name,
        status: 'done',
        url: cloudinaryUrl,
      }]);
      
      // Set the Cloudinary URL in form field
      form.setFieldValue('image', cloudinaryUrl);
      console.log('Form updated with Cloudinary URL:', cloudinaryUrl);
      
      message.destroy(); // Clear loading message
      message.success('Tải ảnh lên thành công!');
      
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Update UI with error
      setImageFileList([{
        uid: '-1',
        name: file.name,
        status: 'error',
      }]);
      
      message.destroy(); // Clear loading message
      message.error('Tải ảnh lên thất bại. Vui lòng thử lại.');
      return false;
    }
  };

  // Validate image file
  const beforeUpload = (file: File) => {
    console.log('=== BEFORE UPLOAD DEBUG ===');
    console.log('File:', file);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      console.error('Invalid file type:', file.type);
      message.error('Chỉ có thể tải lên file hình ảnh!');
      return false;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      console.error('File too large:', file.size);
      message.error('Kích thước ảnh phải nhỏ hơn 10MB!');
      return false;
    }
    
    console.log('File validation passed');
    return true;
  };

  // Load stations when modal opens
  useEffect(() => {
    if (visible) {
      loadStations();
    }
  }, [visible]);

  const loadStations = async () => {
    setLoadingStations(true);
    try {
      const response = await adminStationService.getAllStations({
        status: 'ACTIVE',
        limit: 100
      });
      
      if (response.success && response.data) {
        setStations(response.data);
      }
    } catch (error) {
      console.error('Error loading stations:', error);
    } finally {
      setLoadingStations(false);
    }
  };

  useEffect(() => {
    if (visible) {
      if (vehicle) {
        // Map vehicle data to form values, handling nested structures
        const formValues = {
          name: vehicle.name,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          seats: vehicle.seats,
          pricePerHour: vehicle.pricePerHour,
          pricePerDay: vehicle.pricePerDay,
          battery_kWh: vehicle.battery_kWh,
          batteryLevel: vehicle.batteryLevel,
          range: vehicle.range,
          odo_km: vehicle.odo_km,
          features: vehicle.features || [],
          condition: vehicle.condition,
          description: vehicle.description || '',
          tags: vehicle.tags || [],
          image: vehicle.image,
          // Handle nested station_id properly
          station_id: (vehicle.station_id && typeof vehicle.station_id === 'object') 
            ? (vehicle.station_id as { _id: string; name: string; city: string })._id 
            : vehicle.station_id as string,
          status: vehicle.status,
          currency: vehicle.currency || 'VND'
        };
        
        console.log('Setting form values for edit:', formValues);
        form.setFieldsValue(formValues);
        
        // Set existing image for file list display
        if (vehicle.image) {
          setImageFileList([{
            uid: '-1',
            name: 'Current Image',
            status: 'done',
            url: vehicle.image,
          }]);
        }
      } else {
        form.resetFields();
        setImageFileList([]);
      }
    }
  }, [visible, vehicle, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      console.log('=== HANDLE SUBMIT DEBUG ===');
      console.log('Form values:', values);
      console.log('Image URL in form:', values.image);
      
      // Always send as JSON since image is already uploaded to Cloudinary
      const submitData: VehicleFormValues = values;
      
      console.log('Submitting JSON data:', submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const vehicleTypes = [
    'Sedan EV',
    'SUV EV', 
    'Hatchback EV',
    'Crossover EV',
    'MPV EV',
    'Coupe EV',
    'Convertible EV',
    'Pickup EV'
  ];

  const vehicleBrands = [
    'VinFast',
    'Tesla',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Hyundai',
    'Kia',
    'Nissan',
    'BYD',
    'Polestar'
  ];

  const vehicleConditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];

  const vehicleStatuses = [
    { value: 'AVAILABLE', label: 'Có sẵn' },
    { value: 'RENTED', label: 'Đang thuê' },
    { value: 'MAINTENANCE', label: 'Bảo trì' },
    { value: 'RESERVED', label: 'Đã đặt' }
  ];

  const commonFeatures = [
    'Auto Parking',
    'Smart Cabin',
    'Fast Charging',
    'Autopilot',
    'Wireless Charging',
    'Premium Audio',
    'Heated Seats',
    'Sunroof',
    'Navigation',
    'Blind Spot Monitor',
    'Lane Keeping Assist',
    'Adaptive Cruise Control'
  ];

  const commonTags = [
    'Premium',
    'Electric',
    'Family',
    'Luxury',
    'Eco-Friendly',
    'Compact',
    'Spacious',
    'High-Tech',
    'Long Range',
    'Fast Charging'
  ];

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={900}
      okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Hủy"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          currency: 'VND',
          status: 'AVAILABLE',
          condition: 'excellent',
          batteryLevel: 100,
          seats: 5,
          range: 300,
          odo_km: 0,
          pricePerDay: 1500000,
          features: [],
          tags: []
        }}
      >
        <Row gutter={16}>
          {/* Basic Information */}
          <Col span={24}>
            <h3>Thông tin cơ bản</h3>
            <Divider />
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên xe"
              rules={[{ required: true, message: 'Vui lòng nhập tên xe' }]}
            >
              <Input placeholder="VD: VinFast VF 8 Eco" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="licensePlate"
              label="Biển số xe"
              rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
            >
              <Input placeholder="VD: 30A-12345" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="brand"
              label="Hãng xe"
              rules={[{ required: true, message: 'Vui lòng chọn hãng xe' }]}
            >
              <Select placeholder="Chọn hãng xe">
                {vehicleBrands.map(brand => (
                  <Option key={brand} value={brand}>{brand}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="model"
              label="Model"
              rules={[{ required: true, message: 'Vui lòng nhập model' }]}
            >
              <Input placeholder="VD: VF 8 Eco" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="type"
              label="Loại xe"
              rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
            >
              <Select placeholder="Chọn loại xe">
                {vehicleTypes.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="year"
              label="Năm sản xuất"
              rules={[{ required: true, message: 'Vui lòng nhập năm sản xuất' }]}
            >
              <InputNumber 
                min={2020} 
                max={new Date().getFullYear() + 1}
                style={{ width: '100%' }}
                placeholder="2024"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="seats"
              label="Số ghế"
              rules={[{ required: true, message: 'Vui lòng nhập số ghế' }]}
            >
              <InputNumber 
                min={2} 
                max={8}
                style={{ width: '100%' }}
                placeholder="5"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select>
                {vehicleStatuses.map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="condition"
              label="Tình trạng"
              rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
            >
              <Select>
                {vehicleConditions.map(condition => (
                  <Option key={condition.value} value={condition.value}>
                    {condition.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="station_id"
              label="Trạm xe"
              rules={[{ required: true, message: 'Vui lòng chọn trạm xe' }]}
            >
              <Select 
                placeholder="Chọn trạm xe"
                loading={loadingStations}
                showSearch
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {stations.map(station => (
                  <Option key={station._id} value={station._id}>
                    {station.name} - {station.city}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Technical Specifications */}
          <Col span={24}>
            <h3>Thông số kỹ thuật</h3>
            <Divider />
          </Col>

          <Col span={8}>
            <Form.Item
              name="battery_kWh"
              label="Dung lượng pin (kWh)"
              rules={[{ required: true, message: 'Vui lòng nhập dung lượng pin' }]}
            >
              <InputNumber 
                min={30} 
                max={200}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="87.7"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="batteryLevel"
              label="Mức pin hiện tại (%)"
              rules={[{ required: true, message: 'Vui lòng nhập mức pin' }]}
            >
              <InputNumber 
                min={0} 
                max={100}
                style={{ width: '100%' }}
                placeholder="85"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="range"
              label="Quãng đường (km)"
              rules={[{ required: true, message: 'Vui lòng nhập quãng đường' }]}
            >
              <InputNumber 
                min={100} 
                max={1000}
                style={{ width: '100%' }}
                placeholder="425"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="odo_km"
              label="Số km đã đi"
              rules={[{ required: true, message: 'Vui lòng nhập số km đã đi' }]}
            >
              <InputNumber 
                min={0}
                style={{ width: '100%' }}
                placeholder="12500"
              />
            </Form.Item>
          </Col>

          {/* Pricing */}
          <Col span={24}>
            <h3>Giá thuê</h3>
            <Divider />
          </Col>

          <Col span={8}>
            <Form.Item
              name="pricePerHour"
              label="Giá thuê/giờ"
              rules={[{ required: true, message: 'Vui lòng nhập giá thuê theo giờ' }]}
            >
              <InputNumber 
                min={1}
                style={{ width: '100%' }}
                placeholder="520000"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="pricePerDay"
              label="Giá thuê/ngày"
              rules={[{ required: true, message: 'Vui lòng nhập giá thuê theo ngày' }]}
            >
              <InputNumber 
                min={10}
                style={{ width: '100%' }}
                placeholder="3120000"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="currency"
              label="Đơn vị tiền tệ"
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị tiền tệ' }]}
            >
              <Select>
                <Option value="VND">VND</Option>
                <Option value="USD">USD</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Features & Tags */}
          <Col span={24}>
            <h3>Tính năng & Tags</h3>
            <Divider />
          </Col>

          <Col span={12}>
            <Form.Item
              name="features"
              label="Tính năng"
            >
              <Select
                mode="multiple"
                placeholder="Chọn tính năng"
                style={{ width: '100%' }}
              >
                {commonFeatures.map(feature => (
                  <Option key={feature} value={feature}>{feature}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="tags"
              label="Tags"
            >
              <Select
                mode="tags"
                placeholder="Chọn hoặc nhập tags"
                style={{ width: '100%' }}
              >
                {commonTags.map(tag => (
                  <Option key={tag} value={tag}>{tag}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Image & Description */}
          <Col span={24}>
            <h3>Hình ảnh & Mô tả</h3>
            <Divider />
          </Col>

          {/* Image Upload Section */}
          <Col span={12}>
            <Form.Item
              label="Tải ảnh từ máy tính"
            >
              <Upload
                fileList={imageFileList}
                beforeUpload={beforeUpload}
                customRequest={({ file }) => {
                  console.log('=== CUSTOM REQUEST DEBUG ===');
                  console.log('Received file:', file);
                  console.log('File type:', typeof file);
                  
                  if (file instanceof File) {
                    console.log('File is instance of File, calling handleImageUpload');
                    handleImageUpload(file);
                  } else {
                    console.error('File is not a File instance:', file);
                    message.error('Có lỗi khi xử lý file');
                  }
                }}
                onRemove={() => {
                  console.log('Removing image file');
                  setImageFileList([]);
                  form.setFieldValue('image', '');
                }}
                maxCount={1}
                accept="image/*"
                listType="picture-card"
                className="vehicle-image-upload"
              >
                {imageFileList.length === 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <PlusOutlined style={{ fontSize: '16px' }} />
                    <div style={{ marginTop: 8, fontSize: '12px' }}>Tải ảnh lên</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="image"
              label="Hoặc nhập URL hình ảnh"
              rules={[{ required: true, message: 'Vui lòng tải ảnh lên hoặc nhập URL hình ảnh' }]}
            >
              <Input 
                placeholder="https://example.com/vehicle-image.jpg"
                onChange={(e) => {
                  // Clear uploaded file when user types URL
                  if (e.target.value && imageFileList.length > 0) {
                    setImageFileList([]);
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea 
                rows={3} 
                placeholder="Mô tả chi tiết về xe..."
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default VehicleFormModal;