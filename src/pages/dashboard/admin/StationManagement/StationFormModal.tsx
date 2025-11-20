/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Switch,
  Divider,
  Checkbox
} from 'antd';
// import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Group: CheckboxGroup } = Checkbox;

interface Station {
  _id?: string;
  name: string;
  address: string;
  city: string;
  geo: {
    coordinates: [number, number];
  };
  totalSlots: number;
  amenities: string[];
  fastCharging: boolean;
  operatingHours: {
    mon_fri?: string;
    weekend?: string;
    holiday?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  image?: string;
  description?: string;
}

interface StationFormModalProps {
  visible: boolean;
  station: Station | null;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

const StationFormModal: React.FC<StationFormModalProps> = ({
  visible,
  station,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();
  const isEditing = !!station;

  useEffect(() => {
    if (visible) {
      if (station) {
        // Transform backend data for form
        const formData = {
          ...station,
          lat: station.geo.coordinates[1],
          lng: station.geo.coordinates[0],
          mon_fri_open: station.operatingHours.mon_fri?.split('-')[0]?.trim(),
          mon_fri_close: station.operatingHours.mon_fri?.split('-')[1]?.trim(),
          weekend_open: station.operatingHours.weekend?.split('-')[0]?.trim(),
          weekend_close: station.operatingHours.weekend?.split('-')[1]?.trim(),
          holiday_open: station.operatingHours.holiday?.split('-')[0]?.trim(),
          holiday_close: station.operatingHours.holiday?.split('-')[1]?.trim(),
        };
        form.setFieldsValue(formData);
      } else {
        form.resetFields();
      }
    }
  }, [visible, station, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      console.log('Form values before transformation:', values);
      
      // Check if lat/lng exist
      if (values.lat === undefined || values.lat === null || values.lng === undefined || values.lng === null) {
        Modal.error({
          title: 'Thiếu tọa độ',
          content: 'Vui lòng nhập đầy đủ vĩ độ (Latitude) và kinh độ (Longitude)'
        });
        return;
      }
      
      // Ensure coordinates are numbers
      const lat = typeof values.lat === 'number' ? values.lat : parseFloat(String(values.lat));
      const lng = typeof values.lng === 'number' ? values.lng : parseFloat(String(values.lng));
      
      // Validate coordinates
      if (isNaN(lat) || isNaN(lng)) {
        console.error('Invalid coordinates:', { lat: values.lat, lng: values.lng });
        Modal.error({
          title: 'Lỗi tọa độ',
          content: 'Vui lòng nhập đúng giá trị vĩ độ và kinh độ (phải là số)'
        });
        return;
      }
      
      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        Modal.error({
          title: 'Tọa độ không hợp lệ',
          content: 'Vĩ độ phải từ -90 đến 90, Kinh độ phải từ -180 đến 180'
        });
        return;
      }
      
      // Transform form data to backend format
      // Backend expects geo.coordinates = [lng, lat] (GeoJSON format)
      const transformedValues = {
        name: values.name,
        address: values.address,
        city: values.city,
        geo: {
          coordinates: [lng, lat]  // [longitude, latitude] - GeoJSON standard
        },
        capacity: values.totalSlots || 10,
        operatingHours: {
          open: values.mon_fri_open || '06:00',
          close: values.mon_fri_close || '22:00'
        },
        amenities: values.amenities || [],
        contactInfo: {
          phone: values.phone || '',
          email: values.email || ''
        },
        image: values.image || '',
        description: values.description || '',
        ...(isEditing && { isActive: values.status === 'ACTIVE' })
      };
      
      console.log('Submitting station data:', transformedValues);
      await onSubmit(transformedValues);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const vietnamCities = [
    'Ho Chi Minh',
    'Ha Noi',
    'Da Nang',
    'Hai Phong',
    'Can Tho',
    'Bien Hoa',
    'Hue',
    'Nha Trang',
    'Buon Ma Thuot',
    'Quy Nhon',
    'Vung Tau',
    'Nam Dinh',
    'Phan Thiet',
    'Long Xuyen',
    'Ha Long',
    'Thai Nguyen',
    'Thanh Hoa',
    'Rach Gia',
    'Cam Pha',
    'Vinh'
  ];

  const stationStatuses = [
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'INACTIVE', label: 'Ngưng hoạt động' },
    { value: 'UNDER_MAINTENANCE', label: 'Bảo trì' }
  ];

  const commonAmenities = [
    'wifi',
    'cafe', 
    'restroom',
    'parking',
    'fast_charging',
    'shopping',
    'atm',
    'food_court',
    'security',
    'waiting_area',
    'phone_charging',
    'air_conditioning'
  ];

  const amenityLabels: Record<string, string> = {
    wifi: 'Wi-Fi',
    cafe: 'Quán cà phê',
    restroom: 'Nhà vệ sinh',
    parking: 'Bãi đỗ xe',
    fast_charging: 'Sạc nhanh',
    shopping: 'Mua sắm',
    atm: 'ATM',
    food_court: 'Khu ăn uống',
    security: 'An ninh',
    waiting_area: 'Khu chờ',
    phone_charging: 'Sạc điện thoại',
    air_conditioning: 'Điều hòa'
  };

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa trạm' : 'Thêm trạm mới'}
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
          status: 'ACTIVE',
          fastCharging: false,
          totalSlots: 10,
          amenities: []
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
              label="Tên trạm"
              rules={[{ required: true, message: 'Vui lòng nhập tên trạm' }]}
            >
              <Input placeholder="VD: EV Station - Nguyen Hue" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="city"
              label="Thành phố"
              rules={[{ required: true, message: 'Vui lòng chọn thành phố' }]}
            >
              <Select placeholder="Chọn thành phố" showSearch>
                {vietnamCities.map(city => (
                  <Option key={city} value={city}>{city}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <Input placeholder="VD: 70 Nguyen Hue, Ben Nghe Ward, District 1" />
            </Form.Item>
          </Col>

          {/* Location Coordinates */}
          <Col span={24}>
            <h3>Tọa độ GPS</h3>
            <Divider />
          </Col>

          <Col span={12}>
            <Form.Item
              name="lat"
              label="Vĩ độ (Latitude)"
              rules={[
                { required: true, message: 'Vui lòng nhập vĩ độ' },
                { type: 'number', min: -90, max: 90, message: 'Vĩ độ phải từ -90 đến 90' }
              ]}
            >
              <InputNumber 
                style={{ width: '100%' }}
                placeholder="10.7763"
                step={0.000001}
                precision={6}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="lng"
              label="Kinh độ (Longitude)"
              rules={[
                { required: true, message: 'Vui lòng nhập kinh độ' },
                { type: 'number', min: -180, max: 180, message: 'Kinh độ phải từ -180 đến 180' }
              ]}
            >
              <InputNumber 
                style={{ width: '100%' }}
                placeholder="106.7018"
                step={0.000001}
                precision={6}
              />
            </Form.Item>
          </Col>

          {/* Station Configuration */}
          <Col span={24}>
            <h3>Cấu hình trạm</h3>
            <Divider />
          </Col>

          <Col span={8}>
            <Form.Item
              name="totalSlots"
              label="Tổng số slot"
              rules={[{ required: true, message: 'Vui lòng nhập số slot' }]}
            >
              <InputNumber 
                min={1} 
                max={100}
                style={{ width: '100%' }}
                placeholder="20"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="fastCharging"
              label="Sạc nhanh"
              valuePropName="checked"
            >
              <Switch checkedChildren="Có" unCheckedChildren="Không" />
            </Form.Item>
          </Col>

          {isEditing && (
            <Col span={8}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  {stationStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}

          {/* Operating Hours */}
          <Col span={24}>
            <h3>Giờ hoạt động</h3>
            <Divider />
          </Col>

          <Col span={12}>
            <Form.Item
              name="mon_fri_open"
              label="Thứ 2-6: Giờ mở"
            >
              <Input 
                style={{ width: '100%' }}
                placeholder="06:00"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="mon_fri_close"
              label="Thứ 2-6: Giờ đóng"
            >
              <Input 
                style={{ width: '100%' }}
                placeholder="22:00"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="weekend_open"
              label="Cuối tuần: Giờ mở"
            >
              <Input 
                style={{ width: '100%' }}
                placeholder="08:00"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="weekend_close"
              label="Cuối tuần: Giờ đóng"
            >
              <Input 
                style={{ width: '100%' }}
                placeholder="20:00"
              />
            </Form.Item>
          </Col>

          {/* Amenities */}
          <Col span={24}>
            <h3>Tiện ích</h3>
            <Divider />
          </Col>

          <Col span={24}>
            <Form.Item
              name="amenities"
              label="Các tiện ích có sẵn"
            >
              <CheckboxGroup>
                <Row>
                  {commonAmenities.map(amenity => (
                    <Col span={8} key={amenity} style={{ marginBottom: 8 }}>
                      <Checkbox value={amenity}>
                        {amenityLabels[amenity]}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </CheckboxGroup>
            </Form.Item>
          </Col>

          {/* Contact Information */}
          <Col span={24}>
            <h3>Thông tin liên hệ</h3>
            <Divider />
          </Col>

          <Col span={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
            >
              <Input placeholder="+84123456789" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
            >
              <Input placeholder="station@evstation.com" />
            </Form.Item>
          </Col>

          {/* Image & Description */}
          <Col span={24}>
            <h3>Hình ảnh & Mô tả</h3>
            <Divider />
          </Col>

          <Col span={24}>
            <Form.Item
              name="image"
              label="URL hình ảnh"
            >
              <Input placeholder="https://example.com/station-image.jpg" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea 
                rows={3} 
                placeholder="Mô tả chi tiết về trạm sạc..."
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default StationFormModal;