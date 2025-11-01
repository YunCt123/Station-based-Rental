import React from 'react';
import {
  Modal,
  Descriptions,
  Image,
  Tag,
  Card,
  Row,
  Col,
  Progress,
  Divider,
  Typography,
  Space,
  Rate,
  List
} from 'antd';
import {
  EnvironmentOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Station {
  _id: string;
  name: string;
  address?: string;
  city: string;
  geo: {
    coordinates: [number, number];
  };
  totalSlots: number;
  amenities: string[];
  fastCharging: boolean;
  rating: {
    avg: number;
    count: number;
  };
  operatingHours: {
    mon_fri?: string;
    weekend?: string;
    holiday?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  metrics: {
    vehicles_total: number;
    vehicles_available: number;
    vehicles_in_use: number;
    utilization_rate: number;
  };
  image?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

interface StationDetailModalProps {
  visible: boolean;
  station: Station | null;
  onCancel: () => void;
}

const StationDetailModal: React.FC<StationDetailModalProps> = ({
  visible,
  station,
  onCancel
}) => {
  if (!station) return null;

  // Safe access to nested properties
  const coordinates = station.geo?.coordinates || [0, 0];
  const rating = station.rating || { avg: 0, count: 0 };
  const operatingHours = station.operatingHours || {};
  const metrics = station.metrics || {
    vehicles_total: 0,
    vehicles_available: 0,
    vehicles_in_use: 0,
    utilization_rate: 0
  };
  const amenities = station.amenities || [];

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'red';
      case 'UNDER_MAINTENANCE':
        return 'orange';
      default:
        return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'INACTIVE':
        return 'Ngưng hoạt động';
      case 'UNDER_MAINTENANCE':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  // Get utilization color
  const getUtilizationColor = (rate: number) => {
    if (rate >= 0.8) return '#ff4d4f';
    if (rate >= 0.6) return '#faad14';
    return '#52c41a';
  };

  // Amenity labels
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

  // Amenity icons
  const amenityIcons: Record<string, React.ReactNode> = {
    wifi: '📶',
    cafe: '☕',
    restroom: '🚻',
    parking: '🅿️',
    fast_charging: '⚡',
    shopping: '🛍️',
    atm: '🏧',
    food_court: '🍽️',
    security: '🔒',
    waiting_area: '🪑',
    phone_charging: '🔌',
    air_conditioning: '❄️'
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <EnvironmentOutlined className="mr-2" />
          Chi tiết trạm: {station.name}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
    >
      <Row gutter={24}>
        {/* Left Column - Image and Overview */}
        <Col span={8}>
          <Card>
            {station.image && (
              <Image
                src={station.image}
                alt={station.name}
                style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
                placeholder
                fallback="/placeholder-station.jpg"
              />
            )}
            
            <div>
              <Title level={4}>{station.name}</Title>
              <Space wrap style={{ marginBottom: 16 }}>
                <Tag color={getStatusColor(station.status)} className="text-sm">
                  {getStatusText(station.status)}
                </Tag>
                {station.fastCharging && (
                  <Tag color="gold" icon={<ThunderboltOutlined />}>
                    Sạc nhanh
                  </Tag>
                )}
                <Tag color="blue">{station.city}</Tag>
              </Space>
            </div>

            {/* Address */}
            <div className="mb-4">
              <Text strong>
                <EnvironmentOutlined /> Địa chỉ
              </Text>
              <div className="mt-1">
                <Text>{station.address}</Text>
                <br />
                <Text type="secondary">{station.city}</Text>
              </div>
            </div>

            {/* Coordinates */}
            <div className="mb-4">
              <Text strong>Tọa độ GPS</Text>
              <div className="mt-1">
                <Text code>
                  {(coordinates[1] || 0).toFixed(6)}, {(coordinates[0] || 0).toFixed(6)}
                </Text>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <Text strong>Đánh giá</Text>
              <div className="mt-1">
                <Rate disabled defaultValue={rating.avg || 0} style={{ fontSize: 16 }} />
                <div className="text-sm text-gray-500">
                  {(rating.avg || 0).toFixed(1)}/5 ({rating.count || 0} đánh giá)
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Middle Column - Details */}
        <Col span={8}>
          <Card title="Thông tin chi tiết">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="ID">
                <Text code>{station._id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số slot">
                <Text strong>{station.totalSlots}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Xe có sẵn">
                <span style={{ color: '#52c41a', fontWeight: 600 }}>
                  {metrics.vehicles_available}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Xe đang sử dụng">
                <span style={{ color: '#1890ff', fontWeight: 600 }}>
                  {metrics.vehicles_in_use}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng xe">
                <span style={{ color: '#722ed1', fontWeight: 600 }}>
                  {metrics.vehicles_total}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Utilization Rate */}
            <div className="mb-4">
              <Text strong>Tỷ lệ sử dụng</Text>
              <Progress
                percent={Math.round((metrics.utilization_rate || 0) * 100)}
                strokeColor={getUtilizationColor(metrics.utilization_rate || 0)}
                className="mt-2"
              />
            </div>

            <Divider />

            {/* Operating Hours */}
            <div className="mb-4">
              <Text strong>
                <ClockCircleOutlined /> Giờ hoạt động
              </Text>
              <div className="mt-2">
                {operatingHours.mon_fri && (
                  <div className="mb-1">
                    <Text>Thứ 2-6: </Text>
                    <Text strong>{operatingHours.mon_fri}</Text>
                  </div>
                )}
                {operatingHours.weekend && (
                  <div className="mb-1">
                    <Text>Cuối tuần: </Text>
                    <Text strong>{operatingHours.weekend}</Text>
                  </div>
                )}
                {operatingHours.holiday && (
                  <div className="mb-1">
                    <Text>Ngày lễ: </Text>
                    <Text strong>{operatingHours.holiday}</Text>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {station.description && (
              <>
                <Divider />
                <div>
                  <Text strong>Mô tả</Text>
                  <div className="mt-2">
                    <Text>{station.description}</Text>
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Divider />
            <div className="text-sm text-gray-500">
              <div>Tạo: {new Date(station.createdAt).toLocaleString()}</div>
              <div>Cập nhật: {new Date(station.updatedAt).toLocaleString()}</div>
            </div>
          </Card>
        </Col>

        {/* Right Column - Amenities and Stats */}
        <Col span={8}>
          <Card title="Tiện ích & Dịch vụ" className="mb-4">
            <List
              dataSource={amenities}
              renderItem={(amenity) => (
                <List.Item style={{ padding: '8px 0', border: 'none' }}>
                  <Space>
                    <span style={{ fontSize: '16px' }}>
                      {amenityIcons[amenity] || '•'}
                    </span>
                    <Text>{amenityLabels[amenity] || amenity}</Text>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  </Space>
                </List.Item>
              )}
              locale={{ emptyText: 'Không có tiện ích nào' }}
            />
          </Card>

          {/* Statistics */}
          <Card title="Thống kê">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div className="text-2xl font-bold text-blue-600">
                    {station.totalSlots}
                  </div>
                  <div className="text-sm text-gray-500">Tổng slot</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.vehicles_available}
                  </div>
                  <div className="text-sm text-gray-500">Xe sẵn sàng</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div className="text-2xl font-bold text-orange-600">
                    {metrics.vehicles_in_use}
                  </div>
                  <div className="text-sm text-gray-500">Đang sử dụng</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((metrics.utilization_rate || 0) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Tỷ lệ sử dụng</div>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Quick Actions Info */}
          <Card title="Thông tin quản lý" className="mt-4" size="small">
            <div className="text-sm">
              <div className="flex justify-between py-1">
                <Text>Trạng thái:</Text>
                <Tag color={getStatusColor(station.status)}>
                  {getStatusText(station.status)}
                </Tag>
              </div>
              <div className="flex justify-between py-1">
                <Text>Sạc nhanh:</Text>
                <Text>{station.fastCharging ? 'Có' : 'Không'}</Text>
              </div>
              <div className="flex justify-between py-1">
                <Text>Số tiện ích:</Text>
                <Text strong>{amenities.length}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default StationDetailModal;