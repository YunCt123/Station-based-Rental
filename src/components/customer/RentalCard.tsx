import React from 'react';
import { Card, Button, Tag, Space, Typography, Image } from 'antd';
import { 
  CalendarOutlined, 
  CarOutlined, 
  EnvironmentOutlined,
  CreditCardOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { Rental } from '../../services/customerService';

const { Title, Text } = Typography;
const { Meta } = Card;

interface RentalCardProps {
  rental: Rental;
  type: 'active' | 'pending_payment' | 'confirmed' | 'completed';
  onViewDetail: (rentalId: string) => void;
  onPayment?: (rental: Rental) => void;
}

const RentalCard: React.FC<RentalCardProps> = ({ 
  rental, 
  onViewDetail, 
  onPayment 
}) => {
    const { vehicle_id, station_id, status, booking_id, pricing_snapshot } = rental;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      'CONFIRMED': { text: 'Chờ nhận xe', color: 'orange', },
      'ONGOING': { text: 'Đang sử dụng', color: 'green' },
      'RETURN_PENDING': { text: 'Cần thanh toán', color: 'red' },
      'COMPLETED': { text: 'Hoàn tất', color: 'default' }
    };
    return configs[status as keyof typeof configs] || { text: status, color: 'default' };
  };

  const statusConfig = getStatusConfig(status);

  const actions = [
    <Button 
      key="detail"
      type="link" 
      icon={<EyeOutlined />}
      onClick={() => onViewDetail(rental._id)}
    >
      Xem chi tiết
    </Button>
  ];

  if (status === 'RETURN_PENDING' && onPayment) {
    actions.push(
      <Button 
        key="payment"
        type="primary" 
        icon={<CreditCardOutlined />}
        onClick={() => onPayment(rental)}
      >
        Thanh toán
      </Button>
    );
  }

  return (
    <Card
      className="rental-card"
      actions={actions}
      cover={
        <div style={{ height: 200, overflow: 'hidden' }}>
          <Image
            alt={vehicle_id.name}
            src={vehicle_id.image}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FmuHH4SRwoRhJXAcOBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBARkRUBgQECzwgAOgYGAgMCAgICAgMCzgp/79KdW9/T2dM+8z6ururu6u/t9e+/r7q8nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB1RV1/cdf7K89fNIAoQRgxkHQQjJCSGkIMSQkuTr00V5++RrVdV8v1vt/B4pSEJyQojJCSFFRoUFIYaUJCEqQABxJIdcLIIQQhBCSEpSAYkSRUYJSUJIllQhKUAIISUJCCEpSUApSUJIkpScJCUJIQQhhKQAIYSQlAAhJCEpQUAIIQkhOQkgJAlJSQJCSEpKEpKSlJQkgQQJSQFJQFJSQFJCkpISpAQhhJCEBAghhBCSkiQkSQIQQkhOEpKShCQJSQlJQlKShKQkJUlIEpKUlAQkJSQlSUhKEpKSlKQkCSVJSUpSkpKU"
          />
        </div>
      }
    >
      <Meta
        title={
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              {vehicle_id.name}
            </Title>
            <Tag color={statusConfig.color} style={{ fontSize: '12px' }}>
               {statusConfig.text}
            </Tag>
          </Space>
        }
        description={
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {/* Vehicle Details */}
            <Space>
              <CarOutlined style={{ color: '#666' }} />
              <Text type="secondary">
                {vehicle_id.brand} {vehicle_id.model} • {vehicle_id.year}
              </Text>
            </Space>
            
            {vehicle_id.licensePlate && (
              <Text strong style={{ color: '#1890ff' }}>
                🪪 {vehicle_id.licensePlate}
              </Text>
            )}

            {/* Station */}
            <Space>
              <EnvironmentOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary">
                {station_id.name}
              </Text>
            </Space>

            {/* Time Info */}
            <Space direction="vertical" size={2}>
              <Space>
                <CalendarOutlined style={{ color: '#faad14' }} />
                <Text type="secondary">
                  <strong>Bắt đầu:</strong> {formatDate(booking_id.start_at)}
                </Text>
              </Space>
              <Space>
                <CalendarOutlined style={{ color: '#faad14' }} />
                <Text type="secondary">
                  <strong>Kết thúc:</strong> {formatDate(booking_id.end_at)}
                </Text>
              </Space>
            </Space>

            {/* Price Info */}
            <Space direction="vertical" size={2}>
              {pricing_snapshot.daily_rate && (
                <Text>
                  <strong>Giá thuê/ngày:</strong>{' '}
                  <Text type="success">
                    {pricing_snapshot.daily_rate.toLocaleString()} {pricing_snapshot.currency}
                  </Text>
                </Text>
              )}
              {pricing_snapshot.deposit && (
                <Text>
                  <strong>Đặt cọc:</strong>{' '}
                  <Text type="warning">
                    {pricing_snapshot.deposit.toLocaleString()} {pricing_snapshot.currency}
                  </Text>
                </Text>
              )}
            </Space>
          </Space>
        }
      />
    </Card>
  );
};

export default RentalCard;