import React from 'react';
import { Card, Typography, Alert, Space, Image, Row, Col } from 'antd';
import { CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { RentalPickup } from '../../services/customerService';

const { Title, Text, Paragraph } = Typography;

interface RejectedRentalInfoProps {
  pickup: RentalPickup;
  showPhotos?: boolean;
}

const getPhotoUrl = (photo: string | { url: string; _id?: string }): string => {
  return typeof photo === 'string' ? photo : photo.url;
};

const RejectedRentalInfo: React.FC<RejectedRentalInfoProps> = ({ 
  pickup, 
  showPhotos = true 
}) => {
  if (!pickup?.rejected?.reason) {
    return null;
  }

  const { rejected } = pickup;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Alert
        message="Yêu cầu nhận xe bị từ chối"
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text>
              <strong>Lý do từ chối:</strong> {rejected.reason}
            </Text>
            <Text type="secondary">
              <strong>Thời gian:</strong> {formatDate(rejected.at)}
            </Text>
            {pickup.notes && (
              <Text type="secondary">
                <strong>Ghi chú thêm:</strong> {pickup.notes}
              </Text>
            )}
          </Space>
        }
        type="error"
        icon={<CloseCircleOutlined />}
        showIcon
      />

      <Card size="small" style={{ backgroundColor: '#fff2f0', borderColor: '#ffccc7' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Title level={5} style={{ color: '#ff4d4f', margin: 0 }}>
            <InfoCircleOutlined /> Hướng dẫn tiếp theo
          </Title>
          <Paragraph style={{ margin: 0, color: '#262626' }}>
            • Kiểm tra lý do từ chối và khắc phục vấn đề (nếu có)
            <br />
            • Liên hệ với trạm để đặt lại lịch nhận xe
            <br />
            • Hoặc hủy booking và đặt xe khác nếu cần thiết
            <br />
            • Hotline hỗ trợ: <Text strong style={{ color: '#1890ff' }}>1900-xxxx</Text>
          </Paragraph>
        </Space>
      </Card>

      {showPhotos && rejected.photos && rejected.photos.length > 0 && (
        <Card title="Ảnh minh chứng từ chối" size="small">
          <Row gutter={[8, 8]}>
            {rejected.photos.map((photo: string | { url: string; _id?: string }, idx: number) => (
              <Col key={idx} xs={12} sm={8} md={6} lg={4}>
                <Image
                  width="100%"
                  height={120}
                  src={getPhotoUrl(photo)}
                  style={{ 
                    objectFit: 'cover', 
                    borderRadius: 4,
                    border: '2px solid #ff4d4f'
                  }}
                  fallback="/api/placeholder/120/120"
                />
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </Space>
  );
};

export default RejectedRentalInfo;