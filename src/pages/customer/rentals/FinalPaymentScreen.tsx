import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Alert, Image, Row, Col, Spin } from 'antd';
import { 
  CreditCardOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  CarOutlined
} from '@ant-design/icons';
import { useFinalPayment } from '../../../hooks/customer/useRentals';
import type { Rental } from '../../../services/customerService';

const { Title, Text, Paragraph } = Typography;

interface FinalPaymentScreenProps {
  rental: Rental;
  onSuccess: () => void;
  onBack: () => void;
}

interface PaymentInfo {
  depositPaid: number;
  totalCharges: number;
  finalAmount: number;
  breakdown: {
    rentalFee: number;
    extraFees: number;
  };
}

const FinalPaymentScreen: React.FC<FinalPaymentScreenProps> = ({ 
  rental, 
  onSuccess, 
  onBack 
}) => {
  const { handleFinalPayment, loading } = useFinalPayment();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Load rental charges (calculated by staff return inspection)
    const loadPaymentInfo = () => {
      const { charges, pricing_snapshot } = rental;
      
      if (charges) {
        // Use charges calculated by backend (after staff inspection)
        const finalAmount = charges.total - (pricing_snapshot.deposit || 0);
        
        setPaymentInfo({
          depositPaid: pricing_snapshot.deposit || 0,
          totalCharges: charges.total,
          finalAmount,
          breakdown: {
            rentalFee: charges.rental_fee || 0,
            extraFees: charges.extra_fees || 0
          }
        });
      } else {
        // Fallback: estimate based on rental type (should not happen after staff inspection)
        console.warn('⚠️ No charges found - using estimated calculation');
        
        const rentalType = pricing_snapshot.details?.rentalType || 'hourly';
        let estimatedTotal = 0;
        
        if (rentalType === 'daily') {
          const days = pricing_snapshot.details?.days || 1;
          estimatedTotal = days * (pricing_snapshot.daily_rate || 0);
        } else {
          const hours = pricing_snapshot.details?.hours || 1;
          estimatedTotal = hours * (pricing_snapshot.hourly_rate || 0);
        }
        
        const finalAmount = estimatedTotal - (pricing_snapshot.deposit || 0);
        
        setPaymentInfo({
          depositPaid: pricing_snapshot.deposit || 0,
          totalCharges: estimatedTotal,
          finalAmount,
          breakdown: {
            rentalFee: estimatedTotal,
            extraFees: 0
          }
        });
      }
      setPageLoading(false);
    };

    loadPaymentInfo();
  }, [rental]);

  const processPayment = async () => {
    try {
      const success = await handleFinalPayment(rental._id);
      if (success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
    }
  };

  if (pageLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip="Đang tải thông tin thanh toán..." />
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <Alert
        message="Lỗi"
        description="Không thể tải thông tin thanh toán"
        type="error"
        showIcon
        action={<Button onClick={onBack}>Quay lại</Button>}
      />
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>
        
        <Title level={2}>
          <CreditCardOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          Thanh toán cuối
        </Title>
        
        {/* Vehicle Info Card */}
        <Card size="small" style={{ marginTop: 16 }}>
          <Row gutter={16} align="middle">
            <Col flex="120px">
              <Image
                width={120}
                height={80}
                src={rental.vehicle_id.image}
                style={{ objectFit: 'cover', borderRadius: 8 }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6U"
              />
            </Col>
            <Col flex="auto">
              <Space direction="vertical" size={4}>
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                  {rental.vehicle_id.name}
                </Title>
                <Text>
                  <CarOutlined /> {rental.vehicle_id.licensePlate}
                </Text>
                <Text type="success" strong>
                  ✅ Kiểm tra trả xe đã hoàn tất
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Payment Breakdown */}
      <Card title={<><DollarOutlined /> Chi tiết thanh toán</>}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* Rental Type Information */}
          {rental.pricing_snapshot.details?.rentalType && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '8px',
              border: '1px solid #bae7ff'
            }}>
              <Text strong>📋 Thông tin booking:</Text>
              <div style={{ marginTop: 8 }}>
                <Text>Loại thuê: <Text strong>
                  {rental.pricing_snapshot.details.rentalType === 'daily' ? 'Theo ngày' : 'Theo giờ'}
                </Text></Text>
                {rental.pricing_snapshot.details.days && (
                  <Text> ({rental.pricing_snapshot.details.days} ngày)</Text>
                )}
                {rental.pricing_snapshot.details.hours && (
                  <Text> ({rental.pricing_snapshot.details.hours} giờ)</Text>
                )}
              </div>
              <div>
                <Text>Giá thuê: <Text strong>
                  {rental.pricing_snapshot.details.rentalType === 'daily' 
                    ? `${rental.pricing_snapshot.daily_rate?.toLocaleString()} VND/ngày`
                    : `${rental.pricing_snapshot.hourly_rate?.toLocaleString()} VND/giờ`
                  }
                </Text></Text>
              </div>
            </div>
          )}

          <div style={{ fontSize: '16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <Text>Phí thuê xe (đã tính toán):</Text>
              <Text strong>{paymentInfo.breakdown.rentalFee.toLocaleString()} VND</Text>
            </div>
            
            {paymentInfo.breakdown.extraFees > 0 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <Text>Phí phát sinh:</Text>
                <Text strong type="warning">
                  {paymentInfo.breakdown.extraFees.toLocaleString()} VND
                </Text>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0',
              borderBottom: '2px solid #e0e0e0',
              fontSize: '18px'
            }}>
              <Text strong>Tổng phí:</Text>
              <Text strong>{paymentInfo.totalCharges.toLocaleString()} VND</Text>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <Text>Đã đặt cọc:</Text>
              <Text type="success">-{paymentInfo.depositPaid.toLocaleString()} VND</Text>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '16px 0',
              borderTop: '2px solid #333',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              <Text strong>Số tiền cần thanh toán:</Text>
              <Text 
                strong 
                style={{ 
                  color: paymentInfo.finalAmount >= 0 ? '#f5222d' : '#52c41a',
                  fontSize: '24px'
                }}
              >
                {paymentInfo.finalAmount >= 0 ? '' : '-'}
                {Math.abs(paymentInfo.finalAmount).toLocaleString()} VND
              </Text>
            </div>
          </div>
        </Space>
      </Card>

      {/* Payment Actions */}
      <Card style={{ marginTop: 16 }}>
        <div style={{ textAlign: 'center' }}>
          {paymentInfo.finalAmount > 0 && (
            <div>
              <Alert
                message="Cần thanh toán thêm"
                description={`Bạn cần thanh toán thêm ${paymentInfo.finalAmount.toLocaleString()} VND để hoàn tất việc thuê xe.`}
                type="info"
                showIcon
                style={{ marginBottom: 16, textAlign: 'left' }}
              />
              <Button 
                type="primary"
                size="large"
                icon={<CreditCardOutlined />}
                loading={loading}
                onClick={processPayment}
                style={{ minWidth: '200px' }}
              >
                {loading ? 'Đang xử lý...' : `Thanh toán ${paymentInfo.finalAmount.toLocaleString()} VND`}
              </Button>
            </div>
          )}

          {paymentInfo.finalAmount < 0 && (
            <div>
              <Alert
                message="Sẽ được hoàn tiền"
                description={`Bạn sẽ được hoàn lại ${Math.abs(paymentInfo.finalAmount).toLocaleString()} VND. Tiền sẽ được chuyển về tài khoản của bạn trong vòng 3-5 ngày làm việc.`}
                type="success"
                showIcon
                style={{ marginBottom: 16, textAlign: 'left' }}
              />
              <Button 
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                loading={loading}
                onClick={processPayment}
                style={{ minWidth: '200px' }}
              >
                {loading ? 'Đang xử lý...' : 'Hoàn tất thuê xe'}
              </Button>
            </div>
          )}

          {paymentInfo.finalAmount === 0 && (
            <div>
              <Alert
                message="Không cần thanh toán thêm"
                description="Số tiền đặt cọc đã đủ để thanh toán toàn bộ phí thuê xe."
                type="success"
                showIcon
                style={{ marginBottom: 16, textAlign: 'left' }}
              />
              <Button 
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                loading={loading}
                onClick={processPayment}
                style={{ minWidth: '200px' }}
              >
                {loading ? 'Đang xử lý...' : 'Hoàn tất thuê xe'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Return Photos from Staff Inspection */}
      {rental.return?.photos && rental.return.photos.length > 0 && (
        <Card title="📸 Ảnh kiểm tra từ nhân viên" style={{ marginTop: 16 }}>
          <Paragraph type="secondary">
            Ảnh chụp bởi nhân viên trong quá trình kiểm tra xe trả
          </Paragraph>
          <Row gutter={[8, 8]}>
            {rental.return.photos.map((photo, index) => (
              <Col key={index} xs={12} sm={8} md={6} lg={4}>
                <Image
                  width="100%"
                  height={120}
                  src={typeof photo === 'string' ? photo : photo.url}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default FinalPaymentScreen;