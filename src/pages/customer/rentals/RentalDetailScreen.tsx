import React from 'react';
import { Card, Typography, Space, Tag, Image, Row, Col, Button, Timeline, Divider } from 'antd';
import { 
  CarOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import type { Rental, Payment } from '../../../services/customerService';
import PaymentHistory from '../../../components/customer/PaymentHistory';

const { Title, Text, Paragraph } = Typography;

interface RentalDetailScreenProps {
  rental: Rental;
  payments: Payment[];
  onBack: () => void;
  onPayment?: (rental: Rental) => void;
}

const RentalDetailScreen: React.FC<RentalDetailScreenProps> = ({
  rental,
  payments,
  onBack,
  onPayment
}) => {
  const { vehicle_id, station_id, status, booking_id, pickup, return: returnInfo } = rental;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPhotoUrl = (photo: string | { url: string; _id?: string }): string => {
    return typeof photo === 'string' ? photo : photo.url;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      'CONFIRMED': { text: 'Chờ nhận xe', color: 'orange' },
      'ONGOING': { text: 'Đang sử dụng', color: 'green' },
      'RETURN_PENDING': { text: 'Cần thanh toán', color: 'red' },
      'COMPLETED': { text: 'Hoàn tất', color: 'default' }
    };
    return configs[status as keyof typeof configs] || { text: status, color: 'default' };
  };

  const statusConfig = getStatusConfig(status);

  const getTimelineItems = () => {
    const items = [
      {
        dot: <CalendarOutlined style={{ fontSize: '16px' }} />,
        color: 'blue',
        children: (
          <div>
            <Text strong>Booking được tạo</Text>
            <br />
            <Text type="secondary">{formatDate(rental.createdAt)}</Text>
          </div>
        )
      }
    ];

    if (pickup?.at) {
      items.push({
        dot: <CarOutlined style={{ fontSize: '16px' }} />,
        color: 'green',
        children: (
          <div>
            <Text strong>Đã nhận xe</Text>
            <br />
            <Text type="secondary">{formatDate(pickup.at)}</Text>
            {pickup.odo_km && (
              <>
                <br />
                <Text type="secondary">Số km: {pickup.odo_km.toLocaleString()}</Text>
              </>
            )}
            {pickup.soc && (
              <>
                <br />
                <Text type="secondary">Pin: {Math.round(pickup.soc * 100)}%</Text>
              </>
            )}
          </div>
        )
      });
    }

    if (returnInfo?.at) {
      items.push({
        dot: <CheckCircleOutlined style={{ fontSize: '16px' }} />,
        color: status === 'COMPLETED' ? 'green' : 'orange',
        children: (
          <div>
            <Text strong>Đã trả xe</Text>
            <br />
            <Text type="secondary">{formatDate(returnInfo.at)}</Text>
            {returnInfo.odo_km && (
              <>
                <br />
                <Text type="secondary">Số km cuối: {returnInfo.odo_km.toLocaleString()}</Text>
              </>
            )}
            {returnInfo.soc && (
              <>
                <br />
                <Text type="secondary">Pin cuối: {Math.round(returnInfo.soc * 100)}%</Text>
              </>
            )}
          </div>
        )
      });
    }

    if (status === 'COMPLETED') {
      items.push({
        dot: <CreditCardOutlined style={{ fontSize: '16px' }} />,
        color: 'green',
        children: (
          <div>
            <Text strong>Hoàn tất thanh toán</Text>
            <br />
            <Text type="secondary">Thuê xe đã hoàn tất</Text>
          </div>
        )
      });
    }

    return items;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>
        
        <Space align="start" size={16}>
          <Title level={2} style={{ margin: 0 }}>
            Chi tiết thuê xe
          </Title>
          <Tag color={statusConfig.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
            {statusConfig.text}
          </Tag>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Vehicle Info */}
        <Col xs={24} lg={12}>
          <Card title={<><CarOutlined /> Thông tin xe</>}>
            <div style={{ marginBottom: 16 }}>
              <Image
                width="100%"
                height={200}
                src={vehicle_id.image}
                style={{ objectFit: 'cover', borderRadius: 8 }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6U"
              />
            </div>
            
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                {vehicle_id.name}
              </Title>
              
              <Text>
                <Text strong>Thương hiệu:</Text> {vehicle_id.brand}
              </Text>
              
              <Text>
                <Text strong>Model:</Text> {vehicle_id.model} ({vehicle_id.year})
              </Text>
              
              <Text>
                <Text strong>Loại xe:</Text> {vehicle_id.type}
              </Text>
              
              <Text>
                <Text strong>Số chỗ:</Text> {vehicle_id.seats} chỗ
              </Text>
              
              <Text>
                <Text strong>Dung lượng pin:</Text> {vehicle_id.battery_kWh} kWh
              </Text>
              
              {vehicle_id.licensePlate && (
                <Text>
                  <Text strong>Biển số:</Text> <Text code>{vehicle_id.licensePlate}</Text>
                </Text>
              )}
            </Space>
          </Card>
        </Col>

        {/* Station Info */}
        <Col xs={24} lg={12}>
          <Card title={<><EnvironmentOutlined /> Trạm thuê</>}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                {station_id.name}
              </Title>
              
              <Text>
                <Text strong>Địa chỉ:</Text> {station_id.address}
              </Text>
              
              <Text>
                <Text strong>Thành phố:</Text> {station_id.city}
              </Text>
            </Space>
          </Card>
        </Col>

        {/* Rental Timeline */}
        <Col xs={24} lg={12}>
          <Card title={<><ClockCircleOutlined /> Lịch trình thuê xe</>}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Text strong>Thời gian thuê:</Text>
                <br />
                <Text>{formatDate(booking_id.start_at)} - {formatDate(booking_id.end_at)}</Text>
              </div>
              
              <Divider />
              
              <Timeline items={getTimelineItems()} />
            </Space>
          </Card>
        </Col>

        {/* Pricing Info */}
        <Col xs={24} lg={12}>
          <Card title={<><CreditCardOutlined /> Thông tin giá</>}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {rental.pricing_snapshot.hourly_rate && (
                <Text>
                  <Text strong>Giá theo giờ:</Text>{' '}
                  <Text type="success">
                    {rental.pricing_snapshot.hourly_rate.toLocaleString()} {rental.pricing_snapshot.currency}
                  </Text>
                </Text>
              )}
              
              {rental.pricing_snapshot.daily_rate && (
                <Text>
                  <Text strong>Giá theo ngày:</Text>{' '}
                  <Text type="success">
                    {rental.pricing_snapshot.daily_rate.toLocaleString()} {rental.pricing_snapshot.currency}
                  </Text>
                </Text>
              )}
              
              {rental.pricing_snapshot.deposit && (
                <Text>
                  <Text strong>Tiền đặt cọc:</Text>{' '}
                  <Text type="warning">
                    {rental.pricing_snapshot.deposit.toLocaleString()} {rental.pricing_snapshot.currency}
                  </Text>
                </Text>
              )}
            </Space>
          </Card>
        </Col>

        {/* Photos */}
        {pickup?.photos && pickup.photos.length > 0 && (
          <Col xs={24}>
            <Card title="📸 Ảnh nhận xe">
              <Row gutter={[8, 8]}>
                {pickup.photos.map((photo, index) => (
                  <Col key={index} xs={12} sm={8} md={6} lg={4}>
                    <Image
                      width="100%"
                      height={120}
                      src={getPhotoUrl(photo)}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6U"
                    />
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        )}

        {returnInfo?.photos && returnInfo.photos.length > 0 && (
          <Col xs={24}>
            <Card title="📸 Ảnh trả xe">
              <Row gutter={[8, 8]}>
                {returnInfo.photos.map((photo, index) => (
                  <Col key={index} xs={12} sm={8} md={6} lg={4}>
                    <Image
                      width="100%"
                      height={120}
                      src={getPhotoUrl(photo)}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6U"
                    />
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        )}

        {/* Payment History */}
        <Col xs={24}>
          <PaymentHistory payments={payments} />
        </Col>

        {/* Actions */}
        {status === 'RETURN_PENDING' && onPayment && (
          <Col xs={24}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Paragraph>
                  Nhân viên đã hoàn tất kiểm tra xe. Vui lòng thanh toán để hoàn tất việc thuê xe.
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  icon={<CreditCardOutlined />}
                  onClick={() => onPayment(rental)}
                >
                  Thanh toán ngay
                </Button>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default RentalDetailScreen;