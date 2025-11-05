import React from 'react';
import { Card, Space, Typography, Tag, Empty, Collapse } from 'antd';
import { 
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownOutlined
} from '@ant-design/icons';
import type { Payment } from '../../services/customerService';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface PaymentHistoryProps {
  payments: Payment[];
  pricingSnapshot: unknown
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments, pricingSnapshot }) => {
  const getTotalPaid = () => {
    return payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((total, p) => total + p.amount, 0);
  };

  const getPaymentIcon = (type: string) => {
    const icons: Record<string, string> = {
      'DEPOSIT': 'Đặt cọc',
      'RENTAL_FINAL': 'Thanh toán cuối',
      'REFUND': 'Hoàn tiền'
    };
    return icons[type] || 'Thanh toán';
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { text: string; color: 'success' | 'processing' | 'error' | 'default'; icon: React.ReactNode }> = {
      'SUCCESS': { text: 'Thành công', color: 'success', icon: <CheckCircleOutlined /> },
      'PENDING': { text: 'Đang xử lý', color: 'processing', icon: <ClockCircleOutlined /> },
      'FAILED': { text: 'Thất bại', color: 'error', icon: <CloseCircleOutlined /> }
    };
    return configs[status] || { 
      text: status, 
      color: 'default', 
      icon: <CreditCardOutlined /> 
    };
  };

  // Sửa lỗi múi giờ: chuyển về GMT+7 (Việt Nam)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (payments.length === 0) {
    return (
      <Card title={<><CreditCardOutlined /> Lịch sử thanh toán</>}>
        <Empty description="Chưa có giao dịch nào" />
      </Card>
    );
  }

  return (
    <Card title={<><CreditCardOutlined /> Lịch sử thanh toán</>}>
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: '16px' }}>
          Tổng đã thanh toán: <Text strong type="success">{getTotalPaid().toLocaleString()} VND</Text>
        </Text>
      </div>

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {payments.map(payment => {
          const statusConfig = getStatusConfig(payment.status);
          const rental = payment.rental_id;
          const charges = rental?.charges;
          const metadata = payment.metadata;
          console.log(pricingSnapshot)
          return (
            <Card
              key={payment._id}
              size="small"
              style={{ borderRadius: 8, backgroundColor: '#fafafa' }}
              bodyStyle={{ padding: '16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <Space>
                  <Text strong style={{ fontSize: '20px' }}>
                   <CreditCardOutlined  />
                  </Text>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {getPaymentIcon(payment.type)}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      {formatDate(payment.createdAt)}
                    </Text>
                  </div>
                </Space>

                <div style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                    {payment.amount.toLocaleString()} {payment.currency}
                  </Text>
                  <br />
                  <Tag color={statusConfig.color} icon={statusConfig.icon} style={{ marginTop: 4 }}>
                    {statusConfig.text}
                  </Tag>
                </div>
              </div>

              {/* Mã giao dịch */}
              {payment.vnpay_transaction_id && (
                <Paragraph type="secondary" style={{ margin: '8px 0', fontSize: '12px' }}>
                  <Text strong>Mã giao dịch:</Text> {payment.vnpay_transaction_id}
                </Paragraph>
              )}

              {/* Collapse chi tiết thanh toán */}
              <Collapse
                ghost
                expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
                style={{ marginTop: 8, padding: 0 }}
              >
                <Panel
                  header={<Text strong type="secondary">Xem chi tiết thanh toán</Text>}
                  key="1"
                  style={{ padding: 0 }}
                >
                  <Space direction="vertical" size={4} style={{ width: '100%', fontSize: '13px' }}>
                    {/* Tổng chi phí */}
                    {charges && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>Tổng chi phí thuê xe:</Text>
                          <Text strong>{(pricingSnapshot.total_price + charges?.extra_fees).toLocaleString()} VND</Text>
                        </div>

                        <div style={{ borderLeft: '2px solid #d9d9d9', marginLeft: 10, paddingLeft: 12 }}>
                          {charges.rental_fee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">Phí thuê xe</Text>
                              <Text>{charges.rental_fee.toLocaleString()} VND</Text>
                            </div>
                          )}
                          {pricingSnapshot?.taxes > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">Taxs</Text>
                              <Text>{pricingSnapshot?.taxes.toLocaleString()} VND</Text>
                            </div>
                          )}
                          {pricingSnapshot?.insurance_price > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">Bảo hiểm</Text>
                              <Text>{pricingSnapshot?.insurance_price.toLocaleString()} VND</Text>
                            </div>
                          )}
                          {charges.cleaning_fee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">Phí vệ sinh</Text>
                              <Text>{charges.cleaning_fee.toLocaleString()} VND</Text>
                            </div>
                          )}
                          {charges.damage_fee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">Phí hư hỏng</Text>
                              <Text>{charges.damage_fee.toLocaleString()} VND</Text>
                            </div>
                          )}
                          {charges.late_fee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">Phí trễ hạn</Text>
                              <Text>{charges.late_fee.toLocaleString()} VND</Text>
                            </div>
                          )}
                          {charges.other_fees > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">Phí khác</Text>
                              <Text>{charges.other_fees.toLocaleString()} VND</Text>
                            </div>
                          )}
                          {charges.extra_fees > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">Phí phát sinh</Text>
                              <Text strong type="danger">{charges.extra_fees.toLocaleString()} VND</Text>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Đặt cọc đã trả */}
                    {metadata?.deposit_paid !== undefined && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                        <Text type="secondary">Đã đặt cọc trước:</Text>
                        <Text>{metadata.deposit_paid.toLocaleString()} VND</Text>
                      </div>
                    )}

                    {/* Số tiền thanh toán lần này */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      paddingTop: 8, 
                      borderTop: '1px dashed #d9d9d9', 
                      marginTop: 8 
                    }}>
                      <Text strong>Thanh toán lần này:</Text>
                      <Text strong type="success" style={{ fontSize: '15px' }}>
                        {payment.amount.toLocaleString()} VND
                      </Text>
                    </div>
                  </Space>
                </Panel>
              </Collapse>
            </Card>
          );
        })}
      </Space>
    </Card>
  );
};

export default PaymentHistory;