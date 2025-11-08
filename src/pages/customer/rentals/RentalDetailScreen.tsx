import React from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Image,
  Row,
  Col,
  Button,
  Timeline,
  Divider,
} from 'antd';
import {
  CarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import type { Rental, Payment } from '../../../services/customerService';
import PaymentHistory from '../../../components/customer/PaymentHistory';
import RejectedRentalInfo from '../../../components/customer/RejectedRentalInfo';

const { Title, Text, Paragraph } = Typography;

interface RentalDetailScreenProps {
  rental: Rental;
  payments: Payment[];
  onBack: () => void;
  onPayment?: (rental: Rental) => void;
}

/* -------------------------------------------------------------------------- */
/*  Helper: Định dạng tiền tệ (hỗ trợ VND, USD, …)                           */
/* -------------------------------------------------------------------------- */
const formatCurrency = (amount: number, currency: string) => {
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };
  // Ant Design dùng locale 'en-US' → VND sẽ hiển thị ₫ ở cuối
  return new Intl.NumberFormat('vi-VN', opts).format(amount);
};

const RentalDetailScreen: React.FC<RentalDetailScreenProps> = ({
  rental,
  payments,
  onBack,
  onPayment,
}) => {
  const {
    vehicle_id,
    station_id,
    status,
    booking_id,
    pickup,
    return: returnInfo,
    pricing_snapshot,
    charges,
  } = rental;

  /* ---------------------------------------------------------------------- */
  /*  Định dạng ngày giờ                                                    */
  /* ---------------------------------------------------------------------- */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /* ---------------------------------------------------------------------- */
  /*  Lấy URL ảnh (photo có thể là string hoặc object)                     */
  /* ---------------------------------------------------------------------- */
  const getPhotoUrl = (photo: string | { url: string; _id?: string }): string => {
    return typeof photo === 'string' ? photo : photo.url;
  };

  /* ---------------------------------------------------------------------- */
  /*  Cấu hình trạng thái                                                   */
  /* ---------------------------------------------------------------------- */
  const getStatusConfig = (st: string) => {
    const cfg = {
      CONFIRMED: { text: 'Chờ nhận xe', color: 'orange' },
      ONGOING: { text: 'Đang sử dụng', color: 'green' },
      REJECTED: { text: 'Bị từ chối', color: 'red' },
      RETURN_PENDING: { text: 'Chờ thanh toán cuối', color: 'red' },
      COMPLETED: { text: 'Hoàn tất', color: 'default' },
    };
    return cfg[st as keyof typeof cfg] ?? { text: st, color: 'default' };
  };
  const statusConfig = getStatusConfig(status);

  /* ---------------------------------------------------------------------- */
  /*  Timeline                                                              */
  /* ---------------------------------------------------------------------- */
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
        ),
      },
    ];

    if (status === 'REJECTED' && pickup?.rejected?.reason) {
      items.push({
        dot: <CloseCircleOutlined style={{ fontSize: '16px' }} />,
        color: 'red',
        children: (
          <div>
            <Text strong style={{ color: '#ff4d4f' }}>Yêu cầu nhận xe bị từ chối</Text>
            <br />
            <Text type="secondary">{pickup.rejected.at ? formatDate(pickup.rejected.at) : ''}</Text>
            <br />
            <Text>
              <strong>Lý do:</strong> {pickup.rejected.reason}
            </Text>
            {pickup.notes && (
              <>
                <br />
                <Text type="secondary">
                  Ghi chú: {pickup.notes}
                </Text>
              </>
            )}
          </div>
        ),
      });
    } else if (pickup?.at) {
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
                <Text type="secondary">
                  Số km: {pickup.odo_km.toLocaleString()}
                </Text>
              </>
            )}
            {pickup.soc != null && (
              <>
                <br />
                <Text type="secondary">
                  Pin: {Math.round(pickup.soc * 100)}%
                </Text>
              </>
            )}
          </div>
        ),
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
                <Text type="secondary">
                  Số km cuối: {returnInfo.odo_km.toLocaleString()}
                </Text>
              </>
            )}
            {returnInfo.soc != null && (
              <>
                <br />
                <Text type="secondary">
                  Pin cuối: {Math.round(returnInfo.soc * 100)}%
                </Text>
              </>
            )}
          </div>
        ),
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
        ),
      });
    }

    return items;
  };

  /* ---------------------------------------------------------------------- */
  /*  Tính tiền còn lại (total - deposit)                                   */
  /* ---------------------------------------------------------------------- */
  const remainingAmount =
    charges.total - (pricing_snapshot.deposit ?? 0);

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

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    }}
  >
    <Title level={2} style={{ margin: 0, lineHeight: 1 }}>
      Chi tiết thuê xe
    </Title>

    <Tag
      color={statusConfig.color}
      style={{
        fontSize: 14,
        padding: "0 12px",
        height: 28,
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {statusConfig.text}
    </Tag>
  </div>
</div>

      <Row gutter={[24, 24]}>
        {/* ---------- Thông tin xe ---------- */}
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

              <Text><Text strong>Thương hiệu:</Text> {vehicle_id.brand}</Text>
              <Text><Text strong>Model:</Text> {vehicle_id.model} ({vehicle_id.year})</Text>
              <Text><Text strong>Loại xe:</Text> {vehicle_id.type}</Text>
              <Text><Text strong>Số chỗ:</Text> {vehicle_id.seats} chỗ</Text>
              <Text><Text strong>Dung lượng pin:</Text> {vehicle_id.battery_kWh} kWh</Text>

              {vehicle_id.licensePlate && (
                <Text>
                  <Text strong>Biển số:</Text>{' '}
                  <Text code>{vehicle_id.licensePlate}</Text>
                </Text>
              )}
            </Space>
          </Card>
        </Col>

        {/* ---------- Trạm thuê ---------- */}
        <Col xs={24} lg={12}>
          <Card title={<><EnvironmentOutlined /> Trạm thuê</>}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                {station_id.name}
              </Title>

              <Text><Text strong>Địa chỉ:</Text> {station_id.address}</Text>
              <Text><Text strong>Thành phố:</Text> {station_id.city}</Text>
            </Space>
          </Card>
        </Col>

        {/* ---------- Lịch trình thuê xe ---------- */}
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

        {/* ---------- Thông tin từ chối (chỉ hiện khi REJECTED) ---------- */}
        {status === 'REJECTED' && pickup && (
          <Col xs={24}>
            <RejectedRentalInfo pickup={pickup} showPhotos={false} />
          </Col>
        )}

        {/* ---------- Thông tin trạm ---------- */}
        <Col xs={24} lg={12}>
          <Card title={<><CreditCardOutlined /> Thông tin giá</>}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {pricing_snapshot.hourly_rate != null && (
                <Text>
                  <Text strong>Giá theo giờ:</Text>{' '}
                  <Text type="success">
                    {formatCurrency(pricing_snapshot.hourly_rate, pricing_snapshot.currency)}
                  </Text>
                </Text>
              )}

              {pricing_snapshot.daily_rate != null && (
                <Text>
                  <Text strong>Giá theo ngày:</Text>{' '}
                  <Text type="success">
                    {formatCurrency(pricing_snapshot.daily_rate, pricing_snapshot.currency)}
                  </Text>
                </Text>
              )}

              {pricing_snapshot.deposit != null && (
                <Text>
                  <Text strong>Tiền đặt cọc:</Text>{' '}
                  <Text type="warning">
                    {formatCurrency(pricing_snapshot.deposit, pricing_snapshot.currency)}
                  </Text>
                </Text>
              )}
            </Space>
          </Card>

          {/* ---------- Chi tiết hóa đơn (đầy đủ phí) ---------- */}
                {((status === 'RETURN_PENDING' && onPayment) || status === "COMPLETED") && (
                <Card title={<><CreditCardOutlined /> Chi tiết hóa đơn</>} style={{ marginTop: 16 }}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    {/* Loại thuê xe */}
                    <Text>
                      <Text strong>Loại thuê xe:</Text>{' '}
                      {pricing_snapshot.hourly_rate && pricing_snapshot.daily_rate
                        ? 'Kết hợp giờ và ngày'
                        : pricing_snapshot.hourly_rate
                          ? 'Theo giờ'
                          : pricing_snapshot.daily_rate
                            ? 'Theo ngày'
                            : 'Không xác định'}
                    </Text>

                    {/* Phí thuê xe (chính) */}
                    <Text>
                      <div>
                        <Text strong>Giá thuê ban đầu:</Text>
                        <div style={{ borderLeft: '2px solid #d9d9d9', marginLeft: 10, paddingLeft: 12, marginTop: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Giá cơ bản</Text>
                            <Text>{formatCurrency(pricing_snapshot.base_price, pricing_snapshot.currency)}</Text>
                          </div>
                          {pricing_snapshot.insurance_price > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">Bảo hiểm</Text>
                              <Text>{formatCurrency(pricing_snapshot.insurance_price, pricing_snapshot.currency)}</Text>
                            </div>
                          )}
                          {pricing_snapshot.taxes > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">Thuế & phí dịch vụ</Text>
                              <Text>{formatCurrency(pricing_snapshot.taxes, pricing_snapshot.currency)}</Text>
                            </div>
                          )}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            paddingTop: 4, 
                            borderTop: '1px dashed #e8e8e8',
                            marginTop: 4
                          }}>
                            <Text strong>Tổng giá thuê</Text>
                            <Text strong type="success">
                              {formatCurrency(pricing_snapshot.total_price, pricing_snapshot.currency)}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Text>

                    {/* Các phí phát sinh riêng lẻ – chỉ hiện khi > 0 */}
                    {charges.cleaning_fee > 0 && (
                      <Text>
                        <Text strong>Phí vệ sinh:</Text>{' '}
                        <Text type="warning">
                          {formatCurrency(charges.cleaning_fee, pricing_snapshot.currency)}
                        </Text>
                      </Text>
                    )}

                    {charges.damage_fee > 0 && (
                      <Text>
                        <Text strong>Phí hư hỏng:</Text>{' '}
                        <Text type="warning">
                          {formatCurrency(charges.damage_fee, pricing_snapshot.currency)}
                        </Text>
                      </Text>
                    )}

                    {charges.late_fee > 0 && (
                      <Text>
                        <Text strong>Phí trễ hạn:</Text>{' '}
                        <Text type="warning">
                          {formatCurrency(charges.late_fee, pricing_snapshot.currency)}
                        </Text>
                      </Text>
                    )}

                    {charges.other_fees > 0 && (
                      <Text>
                        <Text strong>Phí khác:</Text>{' '}
                        <Text type="warning">
                          {formatCurrency(charges.other_fees, pricing_snapshot.currency)}
                        </Text>
                      </Text>
                    )}

                    {/* === KHÔNG HIỂN THỊ extra_fees === */}
                    {/* Vì extra_fees = cleaning + damage + late + other */}

                    <Divider />

                    {/* Tổng tiền (đã bao gồm tất cả phí) */}
                    <Text>
                      <Text strong>Tổng tiền:</Text>{' '}
                      <Text type="danger" strong>
                      {formatCurrency(
                          pricing_snapshot.total_price + charges.extra_fees,
                          pricing_snapshot.currency
                        )}
                      </Text>
                    </Text>

                    {/* Tiền cọc đã thu */}
                    {pricing_snapshot.deposit != null && (
                      <Text>
                        <Text strong>Tiền đặt cọc đã thu:</Text>{' '}
                        <Text type="secondary">
                          {formatCurrency(pricing_snapshot.deposit, pricing_snapshot.currency)}
                        </Text>
                      </Text>
                    )}

                    {/* Tiền còn lại cần thanh toán */}
                    {status === 'RETURN_PENDING' && (
                      <Text>
                        <Text strong style={{ color: '#d9363e' }}>
                          Tổng tiền còn lại cần thanh toán:
                        </Text>{' '}
                        <Text type="danger" strong>
                          {formatCurrency(
                            (pricing_snapshot.total_price + charges.extra_fees) - (pricing_snapshot.deposit ?? 0),
                            pricing_snapshot.currency
                          )}
                        </Text>
                      </Text>
                    )}
                  </Space>
                </Card>
                )}
        </Col>

        {/* ---------- Ảnh nhận xe / Ảnh từ chối ---------- */}
        {status === 'REJECTED' && pickup?.rejected?.photos && pickup.rejected.photos.length > 0 ? (
          <Col xs={24}>
            <Card title="Ảnh từ chối nhận xe" className="reject-photos-card">
              <Row gutter={[8, 8]}>
                {pickup.rejected.photos.map((photo, idx) => (
                  <Col key={idx} xs={12} sm={8} md={6} lg={4}>
                    <Image
                      width="100%"
                      height={120}
                      src={getPhotoUrl(photo)}
                      style={{ objectFit: 'cover', borderRadius: 4, border: '2px solid #ff4d4f' }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6U"
                    />
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        ) : pickup?.photos && pickup.photos.length > 0 && (
          <Col xs={24}>
            <Card title="Ảnh nhận xe">
              <Row gutter={[8, 8]}>
                {pickup.photos.map((photo, idx) => (
                  <Col key={idx} xs={12} sm={8} md={6} lg={4}>
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

        {/* ---------- Ảnh trả xe ---------- */}
        {returnInfo?.photos && returnInfo.photos.length > 0 && (
          <Col xs={24}>
            <Card title="Ảnh trả xe">
              <Row gutter={[8, 8]}>
                {returnInfo.photos.map((photo, idx) => (
                  <Col key={idx} xs={12} sm={8} md={6} lg={4}>
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

        {/* ---------- Lịch sử thanh toán ---------- */}
        <Col xs={24}>
          <PaymentHistory payments={payments} pricingSnapshot={pricing_snapshot}/>
        </Col>

        {/* ---------- Nút thanh toán (RETURN_PENDING) ---------- */}
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