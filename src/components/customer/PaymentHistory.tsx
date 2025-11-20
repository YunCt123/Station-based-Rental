import React from 'react';
import { Card, Space, Typography, Tag, Empty, Collapse } from 'antd';
import {
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  MobileOutlined,
  QrcodeOutlined,
  BankOutlined,
  DollarOutlined
} from '@ant-design/icons';
import type { Payment, Rental } from '../../services/customerService';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface PaymentHistoryProps {
  payments: Payment[];
  pricingSnapshot: any;
}



const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments, pricingSnapshot }) => {
  const snapshot = {
    total_price: pricingSnapshot?.total_price ?? 0,
    taxes: pricingSnapshot?.taxes ?? 0,
    insurance_price: pricingSnapshot?.insurance_price ?? 0,
  };

  const getTotalPaid = () => {
    return payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((total, p) => total + (p.amount ?? 0), 0);
  };

  const getPaymentMethod = (method: string) => {
  switch (method) {
    case "VNPAY":
      return (
        <Space>
          <QrcodeOutlined style={{ fontSize: 22 }} />
          <div>VNPAY</div>
        </Space>
      );

    case "PAYOS":
      return (
        <Space>
          <QrcodeOutlined style={{ fontSize: 22 }} />
          <div>PayOS</div>
        </Space>
      );

    case "CASH":
      return (
        <Space>
          <DollarOutlined style={{ fontSize: 22 }} />
          <div>Tiền mặt</div>
        </Space>
      );

    case "CARD":
      return (
        <Space>
          <CreditCardOutlined style={{ fontSize: 22 }} />
          <div>Thẻ ngân hàng</div>
        </Space>
      );

    case "BANK_TRANSFER":
      return (
        <Space>
          <BankOutlined style={{ fontSize: 22 }} />
          <div>Chuyển khoản</div>
        </Space>
      );

    case "QR_CODE":
      return (
        <Space>
          <QrcodeOutlined style={{ fontSize: 22 }} />
          <div>QR Code</div>
        </Space>
      );

    case "MOMO":
      return (
        <Space>
          <MobileOutlined style={{ fontSize: 22 }} />
          <div>Momo</div>
        </Space>
      );

    default:
      return (
        <Space>
          <CreditCardOutlined style={{ fontSize: 22 }} />
          <div>Không xác định</div>
        </Space>
      );
  }
};


  const getPaymentIcon = (type: string) => {
    const map: Record<string, string> = {
      DEPOSIT: 'Đặt cọc',
      RENTAL_FINAL: 'Thanh toán cuối',
      REFUND: 'Hoàn tiền',
    };
    return map[type] || 'Thanh toán';
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, any> = {
      SUCCESS: { text: 'Thành công', color: 'success', icon: <CheckCircleOutlined /> },
      PENDING: { text: 'Đang xử lý', color: 'processing', icon: <ClockCircleOutlined /> },
      FAILED: { text: 'Thất bại', color: 'error', icon: <CloseCircleOutlined /> },
    };
    return config[status] || { text: status, color: 'default', icon: <CreditCardOutlined /> };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Không xác định';
    return new Date(dateString).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const RowItem: React.FC<{ label: string; value: number | string; danger?: boolean }> = ({
    label,
    value,
    danger = false,
  }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Text type="secondary">{label}</Text>
      <Text style={{ color: danger ? '#ff4d4f' : undefined }}>
        {typeof value === 'number' ? value.toLocaleString() : value} VND
      </Text>
    </div>
  );

  if (!payments || payments.length === 0) {
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
          Tổng đã thanh toán:{' '}
          <Text strong type="success">
            {getTotalPaid().toLocaleString()} VND
          </Text>
        </Text>
      </div>

      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {payments.map((payment) => {
          const statusConfig = getStatusConfig(payment.status);

          // rental_id có thể là string (ID) hoặc object Rental đầy đủ
          const rental: Rental | null =
            payment.rental_id && typeof payment.rental_id === 'object'
              ? (payment.rental_id as Rental)
              : null;

          // Đảm bảo charges luôn tồn tại và có giá trị mặc định
          const charges = rental?.charges ?? {
            rental_fee: 0,
            cleaning_fee: 0,
            damage_fee: 0,
            late_fee: 0,
            other_fees: 0,
            extra_fees: 0,
          };

          const metadata = payment.metadata ?? {};

          return (
            <Card
              key={payment._id}
              size="small"
              style={{ borderRadius: 8, backgroundColor: '#fafafa' }}
              bodyStyle={{ padding: '16px' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Space>
                  <CreditCardOutlined style={{ fontSize: 22 }} />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {getPaymentIcon(payment.type)}
                    </Title>
                    <Text type="secondary">{formatDate(payment.createdAt)}</Text>
                  </div>
                </Space>

                <div style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                    {(payment.amount ?? 0).toLocaleString()} {payment.currency || 'VND'}
                  </Text>
                  <br />
                 <div>
                  <Tag color={statusConfig.color}>
                    {getPaymentMethod(payment.method)}
                  </Tag>
                   <Tag color={statusConfig.color} icon={statusConfig.icon}>
                    {statusConfig.text}
                  </Tag>
                 </div>
                </div>
              </div>

              {/* Mã giao dịch VNPAY */}
              {payment.vnpay_transaction_id && (
                <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
                  <Text strong>Mã giao dịch:</Text> {payment.vnpay_transaction_id}
                </Paragraph>
              )}

              {/* Chi tiết thanh toán */}
              <Collapse
                ghost
                expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
                style={{ marginTop: 8 }}
              >
                <Panel header={<Text strong type="secondary">Xem chi tiết thanh toán</Text>} key="1">
                  <Space direction="vertical" size={5} style={{ width: '100%' }}>
                    {/* Tổng chi phí */}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Tổng chi phí thuê xe:</Text>
                      <Text strong>
                        {(snapshot.total_price + (charges.extra_fees ?? 0)).toLocaleString()} VND
                      </Text>
                    </div>

                    <div style={{ borderLeft: '2px solid #d9d9d9', paddingLeft: 12 }}>
                      {charges.rental_fee > 0 && <RowItem label="Phí thuê xe" value={charges.rental_fee} />}
                      {snapshot.taxes > 0 && <RowItem label="Thuế VAT" value={snapshot.taxes} />}
                      {snapshot.insurance_price > 0 && <RowItem label="Bảo hiểm" value={snapshot.insurance_price} />}
                      {charges.cleaning_fee > 0 && (
                        <RowItem label="Phí vệ sinh" value={charges.cleaning_fee} />
                      )}
                      {charges.damage_fee > 0 && (
                        <RowItem label="Phí hư hỏng" value={charges.damage_fee} />
                      )}
                      {charges?.late_fee > 0 && (
                        <RowItem label="Phí trễ hạn" value={charges.late_fee} />
                      )}
                      {charges?.other_fees > 0 && (
                        <RowItem label="Phí khác" value={charges.other_fees} />
                      )}
                    </div>

                    {/* Đặt cọc đã trả */}
                    {'deposit_paid' in metadata && metadata.deposit_paid !== undefined && (
                      <RowItem label="Đặt cọc đã trả" value={- (metadata.deposit_paid as number)} />
                    )}

                    {/* Thanh toán lần này */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: 8,
                        marginTop: 8,
                        borderTop: '1px dashed #d9d9d9',
                      }}
                    >
                      <Text strong>Thanh toán lần này:</Text>
                      <Text strong type="success" style={{ fontSize: 15 }}>
                        {(payment.amount ?? 0).toLocaleString()} VND
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