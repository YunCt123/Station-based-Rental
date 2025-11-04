import React, { useState } from 'react';
import { Row, Col, Typography, Spin, Alert, Empty, Tabs, Space, Badge } from 'antd';
import { 
  CarOutlined, 
  ClockCircleOutlined, 
  CreditCardOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useMyRentals } from '../../../hooks/customer/useRentals';
import RentalCard from '../../../components/customer/RentalCard';
import type { Rental } from '../../../services/customerService';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface MyRentalsScreenProps {
  onRentalSelect: (rentalId: string) => void;
  onPaymentSelect: (rental: Rental) => void;
}

const MyRentalsScreen: React.FC<MyRentalsScreenProps> = ({ 
  onRentalSelect, 
  onPaymentSelect 
}) => {
  const { rentals, loading, error, refetch } = useMyRentals();
  const [activeTab, setActiveTab] = useState('active');

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip="Đang tải danh sách thuê xe..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={error}
        type="error"
        showIcon
        action={
          <button onClick={refetch}>
            Thử lại
          </button>
        }
      />
    );
  }

  // Filter rentals by status
  const activeRentals = rentals.filter((r: Rental) => r.status === 'ONGOING');
  const confirmedRentals = rentals.filter((r: Rental) => r.status === 'CONFIRMED');
  const pendingPaymentRentals = rentals.filter((r: Rental) => r.status === 'RETURN_PENDING');
  const completedRentals = rentals.filter((r: Rental) => r.status === 'COMPLETED');

  const renderRentalSection = (
    title: string, 
    rentals: Rental[], 
    type: 'active' | 'pending_payment' | 'confirmed' | 'completed',
    description?: string
  ) => {
    if (rentals.length === 0) {
      return (
        <Empty 
          description={`Không có ${title.toLowerCase()}`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div>
        {description && (
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {description}
          </Paragraph>
        )}
        <Row gutter={[16, 16]}>
          {rentals.map(rental => (
            <Col key={rental._id} xs={24} sm={12} lg={8} xl={6}>
              <RentalCard 
                rental={rental} 
                type={type}
                onViewDetail={onRentalSelect}
                onPayment={type === 'pending_payment' ? onPaymentSelect : undefined}
              />
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CarOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          Xe thuê của tôi
        </Title>
        <Paragraph type="secondary">
          Quản lý và theo dõi tình trạng các xe bạn đã thuê
        </Paragraph>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        style={{ marginBottom: 24 }}
      >
        <TabPane 
          tab={
            <Space>
              <CarOutlined />
              <span>Đang sử dụng</span>
              {activeRentals.length > 0 && (
                <Badge count={activeRentals.length} size="small" />
              )}
            </Space>
          } 
          key="active"
        >
          {renderRentalSection(
            'Xe đang sử dụng',
            activeRentals,
            'active',
            'Các xe bạn đang thuê và sử dụng'
          )}
        </TabPane>

        <TabPane 
          tab={
            <Space>
              <CreditCardOutlined />
              <span>Cần thanh toán</span>
              {pendingPaymentRentals.length > 0 && (
                <Badge count={pendingPaymentRentals.length} size="small" />
              )}
            </Space>
          } 
          key="pending_payment"
        >
          {renderRentalSection(
            'Xe cần thanh toán',
            pendingPaymentRentals,
            'pending_payment',
            'Nhân viên đã hoàn tất kiểm tra. Vui lòng thanh toán để hoàn tất việc thuê xe.'
          )}
        </TabPane>

        <TabPane 
          tab={
            <Space>
              <ClockCircleOutlined />
              <span>Chờ nhận xe</span>
              {confirmedRentals.length > 0 && (
                <Badge count={confirmedRentals.length} size="small" />
              )}
            </Space>
          } 
          key="confirmed"
        >
          {renderRentalSection(
            'Xe chờ nhận',
            confirmedRentals,
            'confirmed',
            'Các booking đã được xác nhận, chờ đến trạm để nhận xe'
          )}
        </TabPane>

        <TabPane 
          tab={
            <Space>
              <HistoryOutlined />
              <span>Lịch sử</span>
              {completedRentals.length > 0 && (
                <Badge count={completedRentals.length} size="small" />
              )}
            </Space>
          } 
          key="completed"
        >
          {renderRentalSection(
            'Lịch sử thuê xe',
            completedRentals,
            'completed',
            'Các chuyến thuê xe đã hoàn tất'
          )}
        </TabPane>
      </Tabs>

      {rentals.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={4} type="secondary">
                  Chưa có chuyến thuê xe nào
                </Title>
                <Paragraph type="secondary">
                  Hãy đặt xe để bắt đầu trải nghiệm của bạn
                </Paragraph>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
};

export default MyRentalsScreen;