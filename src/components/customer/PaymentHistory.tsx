import React from 'react';
import { Card, Space, Typography, Tag, Empty } from 'antd';
import { 
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { Payment } from '../../services/customerService';

const { Title, Text } = Typography;

interface PaymentHistoryProps {
  payments: Payment[];
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
  const getTotalPaid = () => {
    return payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((total, p) => total + p.amount, 0);
  };

  const getPaymentIcon = (type: string) => {
    const icons = {
      'DEPOSIT': '💰',
      'RENTAL_FINAL': '🏁',
      'REFUND': '↩️'
    };
    return icons[type as keyof typeof icons] || '💳';
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      'SUCCESS': { text: 'Thành công', color: 'success', icon: <CheckCircleOutlined /> },
      'PENDING': { text: 'Đang xử lý', color: 'processing', icon: <ClockCircleOutlined /> },
      'FAILED': { text: 'Thất bại', color: 'error', icon: <CloseCircleOutlined /> }
    };
    return configs[status as keyof typeof configs] || { 
      text: status, 
      color: 'default' as const, 
      icon: <CreditCardOutlined /> 
    };
  };

  const getTypeText = (type: string) => {
    const types = {
      'DEPOSIT': 'Đặt cọc',
      'RENTAL_FINAL': 'Thanh toán cuối',
      'REFUND': 'Hoàn tiền'
    };
    return types[type as keyof typeof types] || type;
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
          Tổng đã thanh toán: {getTotalPaid().toLocaleString()} VND
        </Text>
      </div>

      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {payments.map(payment => {
          const statusConfig = getStatusConfig(payment.status);
          
          return (
            <div 
              key={payment._id} 
              style={{ 
                padding: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: 8
              }}>
                <Space>
                  <span style={{ fontSize: '20px' }}>
                    {getPaymentIcon(payment.type)}
                  </span>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {getTypeText(payment.type)}
                    </Title>
                    <Text type="secondary">
                      {new Date(payment.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </div>
                </Space>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 4 }}>
                    {payment.amount.toLocaleString()} {payment.currency}
                  </div>
                  <Tag color={statusConfig.color} icon={statusConfig.icon}>
                    {statusConfig.text}
                  </Tag>
                </div>
              </div>

              {payment.vnpay_transaction_id && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Mã giao dịch: {payment.vnpay_transaction_id}
                </Text>
              )}

              {payment.metadata && (
                <div style={{ marginTop: 8 }}>
                  {payment.metadata.totalCharges && (
                    <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                      Tổng phí: {payment.metadata.totalCharges.toLocaleString()} VND
                    </Text>
                  )}
                  {payment.metadata.depositPaid && (
                    <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                      Đã đặt cọc: {payment.metadata.depositPaid.toLocaleString()} VND
                    </Text>
                  )}
                  {payment.metadata.extraFees && payment.metadata.extraFees.length > 0 && (
                    <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                      Phí phát sinh: {payment.metadata.extraFees.length} khoản
                    </Text>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </Space>
    </Card>
  );
};

export default PaymentHistory;