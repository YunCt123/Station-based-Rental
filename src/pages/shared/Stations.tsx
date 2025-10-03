import { Card, Col, Row, Typography, Button, Tag, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import {
  EnvironmentOutlined,
  ThunderboltFilled,
  CarOutlined,
  CheckCircleOutlined,
  WifiOutlined,
  CoffeeOutlined,
  StarFilled,
  CheckCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons';
import { stations } from '../../data/stations';


const { Title, Text, Paragraph } = Typography;

const amenityIcons: { [key: string]: React.ReactNode } = {
  'Hỗ trợ sạc nhanh': <ThunderboltFilled />,
  'Quán cà phê': <CoffeeOutlined />,
  'WiFi': <WifiOutlined />,
  'Nhà vệ sinh': <CheckCircleOutlined />,
  'Bãi đậu xe': <CarOutlined />,
};

const Stations = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Header */}
      <div style={{
        padding: '64px 0',
        background: 'linear-gradient(135deg, #1890ff, #26aA45)',
        textAlign: 'center'
      }}>
        <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
          Tìm Trạm Thuê Xe Điện
        </Title>
        <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
          Chọn một điểm thuê xe gần bạn để bắt đầu hành trình.
        </Paragraph>
      </div>

      {/* Station List */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <Row gutter={[32, 32]}>
          {stations.map((station) => (
            <Col key={station.id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}
                cover={<img alt={station.name} src={station.image} style={{ height: 200, objectFit: 'cover' }} />}
              >
                {/* Trạng thái hoạt động */}
                <Tag
                  icon={station.status === 'active' ? <CheckCircleFilled /> : <CloseCircleFilled />}
                  color={station.status === 'active' ? 'success' : 'error'}
                  style={{ position: 'absolute', top: 16, right: -8, fontSize: 14, padding: '4px 8px' }}
                >
                  {station.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                </Tag>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px' }}>
                  <Title level={4} style={{ marginBottom: 4, flexShrink: 0 }}>{station.name}</Title>
                  <Text type="secondary" style={{ marginBottom: 16, flexShrink: 0 }}><EnvironmentOutlined style={{ marginRight: 8 }} />{station.address}</Text>

                  <Row justify="space-around" align="middle" style={{ margin: '16px 0' }}>
                    <Col span={12} style={{ textAlign: 'center' }}>
                      <Title level={2} style={{ color: station.availableVehicles > 0 ? '#1890ff' : '#f5222d', marginBottom: 4 }}>
                        {station.availableVehicles}
                        <Text style={{ fontSize: 16, color: '#8c8c8c' }}> / {station.totalSlots}</Text>
                      </Title>
                      <Text>Xe có sẵn</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: 'center' }}>
                      <Title level={3} style={{ marginBottom: 4 }}>
                         <StarFilled style={{color: '#faad14'}} /> {station.rating}
                      </Title>
                      <Text>Đánh giá</Text>
                    </Col>
                  </Row>

                  <Divider style={{ margin: '16px 0', flexShrink: 0 }} />
                  
                  <div style={{ flex: 1 }}>
                    <Text strong>Tiện ích tại trạm:</Text>
                    <div style={{ marginTop: 8 }}>
                      <Space size={[8, 8]} wrap>
                        {station.amenities.map(amenity => (
                          <Tag key={amenity} icon={amenityIcons[amenity] || <CheckCircleOutlined />}>
                            {amenity}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </div>

                  <Divider style={{ margin: '16px 0', flexShrink: 0 }} />

                  <Link to={`/stations/${station.id}`} style={{ marginTop: 'auto' }}>
                    <Button type="primary" block disabled={station.status === 'inactive'}>
                      {station.status === 'active' ? (station.availableVehicles > 0 ? 'Chọn xe & đặt ngay' : 'Xem chi tiết trạm') : 'Trạm đang tạm ngưng'}
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Stations;