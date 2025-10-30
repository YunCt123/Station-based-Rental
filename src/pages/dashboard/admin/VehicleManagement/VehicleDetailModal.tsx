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
  Rate
} from 'antd';
import {
  CarOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Vehicle {
  _id: string;
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
  station_id?: {
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
  rating: number;
  reviewCount: number;
  trips: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

interface VehicleDetailModalProps {
  visible: boolean;
  vehicle: Vehicle | null;
  onCancel: () => void;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  visible,
  vehicle,
  onCancel
}) => {
  if (!vehicle) return null;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'green';
      case 'RENTED':
        return 'blue';
      case 'MAINTENANCE':
        return 'orange';
      case 'RESERVED':
        return 'purple';
      default:
        return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Có sẵn';
      case 'RENTED':
        return 'Đang thuê';
      case 'MAINTENANCE':
        return 'Bảo trì';
      case 'RESERVED':
        return 'Đã đặt';
      default:
        return status;
    }
  };

  // Get battery color
  const getBatteryColor = (level: number) => {
    if (level >= 80) return '#52c41a';
    if (level >= 50) return '#faad14';
    return '#ff4d4f';
  };

  // Get condition color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent':
        return 'green';
      case 'Very Good':
        return 'blue';
      case 'Good':
        return 'cyan';
      case 'Fair':
        return 'orange';
      case 'Needs Repair':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <CarOutlined className="mr-2" />
          Chi tiết xe: {vehicle.name}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
    >
      <Row gutter={24}>
        {/* Left Column - Image and Basic Info */}
        <Col span={12}>
          <Card>
            <Image
              src={vehicle.image}
              alt={vehicle.name}
              style={{ width: '100%', borderRadius: 8 }}
              placeholder
            />
            
            <div className="mt-4">
              <Title level={3}>{vehicle.name}</Title>
              <Space wrap>
                <Tag color={getStatusColor(vehicle.status)} className="text-sm">
                  {getStatusText(vehicle.status)}
                </Tag>
                <Tag color="blue">{vehicle.type}</Tag>
                <Tag color="geekblue">{vehicle.brand}</Tag>
                {vehicle.tags?.map(tag => (
                  <Tag key={tag} color="default">{tag}</Tag>
                ))}
              </Space>
            </div>

            {/* Rating & Stats */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {vehicle.rating}
                    </div>
                    <Rate disabled defaultValue={vehicle.rating} />
                    <div className="text-sm text-gray-500">
                      {vehicle.reviewCount} đánh giá
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {vehicle.trips}
                    </div>
                    <div className="text-sm text-gray-500">Chuyến đi</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {vehicle.odo_km.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">km đã đi</div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* Right Column - Detailed Information */}
        <Col span={12}>
          <Card title="Thông tin chi tiết">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="ID">
                <Text code>{vehicle._id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Biển số xe">
                <Text strong>{vehicle.licensePlate}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Hãng xe">
                {vehicle.brand}
              </Descriptions.Item>
              <Descriptions.Item label="Model">
                {vehicle.model}
              </Descriptions.Item>
              <Descriptions.Item label="Năm sản xuất">
                {vehicle.year}
              </Descriptions.Item>
              <Descriptions.Item label="Số ghế">
                {vehicle.seats} chỗ
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng">
                <Tag color={getConditionColor(vehicle.condition)}>
                  {vehicle.condition}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Battery Information */}
            <div className="mb-4">
              <Text strong>
                <ThunderboltOutlined /> Thông tin pin
              </Text>
              <div className="mt-2">
                <Row gutter={16}>
                  <Col span={12}>
                    <Text>Mức pin hiện tại:</Text>
                    <Progress
                      percent={vehicle.batteryLevel}
                      strokeColor={getBatteryColor(vehicle.batteryLevel)}
                      format={percent => `${percent}%`}
                    />
                  </Col>
                  <Col span={12}>
                    <Text>Dung lượng pin:</Text>
                    <div className="text-lg font-semibold">
                      {vehicle.battery_kWh} kWh
                    </div>
                  </Col>
                </Row>
                <div className="mt-2">
                  <Text>Quãng đường tối đa: </Text>
                  <Text strong>{vehicle.range} km</Text>
                </div>
              </div>
            </div>

            <Divider />

            {/* Location */}
            <div className="mb-4">
              <Text strong>
                <EnvironmentOutlined /> Vị trí hiện tại
              </Text>
              <div className="mt-2">
                {vehicle.station_id ? (
                  <div>
                    <div className="font-semibold">
                      {vehicle.station_id.name}
                    </div>
                    <div className="text-gray-500">
                      {vehicle.station_id.city}
                    </div>
                  </div>
                ) : (
                  <Text type="secondary">Chưa có thông tin vị trí</Text>
                )}
              </div>
            </div>

            <Divider />

            {/* Pricing */}
            <div className="mb-4">
              <Text strong>Giá thuê</Text>
              <div className="mt-2">
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text>Theo giờ:</Text>
                      <div className="text-lg font-semibold text-green-600">
                        {vehicle.pricePerHour.toLocaleString()} {vehicle.currency}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text>Theo ngày:</Text>
                      <div className="text-lg font-semibold text-green-600">
                        {vehicle.pricePerDay.toLocaleString()} {vehicle.currency}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <>
                <Divider />
                <div className="mb-4">
                  <Text strong>Tính năng</Text>
                  <div className="mt-2">
                    <Space wrap>
                      {vehicle.features.map(feature => (
                        <Tag key={feature} color="processing">
                          {feature}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            {vehicle.description && (
              <>
                <Divider />
                <div>
                  <Text strong>
                    <FileTextOutlined /> Mô tả
                  </Text>
                  <div className="mt-2">
                    <Text>{vehicle.description}</Text>
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Divider />
            <div className="text-sm text-gray-500">
              <div>Tạo: {new Date(vehicle.createdAt).toLocaleString()}</div>
              <div>Cập nhật: {new Date(vehicle.updatedAt).toLocaleString()}</div>
            </div>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default VehicleDetailModal;