import { Card, Row, Col, Typography, Button, Space, Divider, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import {
  SearchOutlined,
  CalendarOutlined,
  KeyOutlined,
  IdcardOutlined,
  SolutionOutlined,
  UserOutlined,
  CreditCardOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const HowItWorks = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Header */}
      <div style={{
        padding: '64px 0',
        background: 'linear-gradient(135deg, #1890ff, #26aA45)',
        textAlign: 'center'
      }}>
        <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
          Thuê Xe Dễ Dàng Chỉ Với 3 Bước
        </Title>
        <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
          Trải nghiệm thuê xe điện chưa bao giờ đơn giản đến thế.
        </Paragraph>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {/* --- PHẦN STEPS SECTION ĐÃ ĐƯỢC LÀM LẠI --- */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 32 }}>Quy trình thuê xe của chúng tôi</Title>
            <Row gutter={[32, 32]} align="middle" justify="center">
                {/* Step 1 */}
                <Col xs={24} md={7}>
                    <Card hoverable style={{ height: '100%' }}>
                        <Avatar size={64} icon={<SearchOutlined />} style={{ backgroundColor: '#e6f7ff', color: '#1890ff', marginBottom: 24 }} />
                        <Title level={4}>1. Tìm kiếm & Lựa chọn</Title>
                        <Paragraph type="secondary">
                            Sử dụng bộ lọc để tìm kiếm điểm thuê và loại xe bạn muốn. Xem thông tin chi tiết, hình ảnh và đánh giá để đưa ra lựa chọn tốt nhất.
                        </Paragraph>
                    </Card>
                </Col>

                {/* Arrow */}
                <Col xs={0} md={1} style={{ textAlign: 'center' }}>
                    <ArrowRightOutlined style={{ fontSize: 24, color: '#ccc' }} />
                </Col>

                {/* Step 2 */}
                <Col xs={24} md={7}>
                    <Card hoverable style={{ height: '100%' }}>
                        <Avatar size={64} icon={<CalendarOutlined />} style={{ backgroundColor: '#f6ffed', color: '#52c41a', marginBottom: 24 }} />
                        <Title level={4}>2. Đặt xe & Thanh toán</Title>
                        <Paragraph type="secondary">
                            Chọn ngày giờ nhận và trả xe. Cung cấp thông tin cần thiết và hoàn tất thanh toán an toàn qua nhiều phương thức linh hoạt.
                        </Paragraph>
                    </Card>
                </Col>

                {/* Arrow */}
                <Col xs={0} md={1} style={{ textAlign: 'center' }}>
                    <ArrowRightOutlined style={{ fontSize: 24, color: '#ccc' }} />
                </Col>

                {/* Step 3 */}
                <Col xs={24} md={7}>
                    <Card hoverable style={{ height: '100%' }}>
                        <Avatar size={64} icon={<KeyOutlined />} style={{ backgroundColor: '#fffbe6', color: '#faad14', marginBottom: 24 }} />
                        <Title level={4}>3. Nhận xe & Bắt đầu</Title>
                        <Paragraph type="secondary">
                            Đến điểm thuê đúng giờ, xác thực với nhân viên và nhận chìa khóa (hoặc mở khóa qua ứng dụng). Bắt đầu hành trình của bạn!
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
        {/* --- KẾT THÚC PHẦN LÀM LẠI --- */}
        
        {/* Requirements Section */}
        <Card bordered={false} style={{ marginBottom: 48 }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>Những gì bạn cần để bắt đầu</Title>
            <Row gutter={[32, 32]} justify="center">
                <Col xs={24} sm={12} md={6} style={{ textAlign: 'center' }}>
                    <IdcardOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>Giấy tờ Tùy thân</Title>
                    <Text type="secondary">CCCD/CMND hoặc Hộ chiếu còn hiệu lực.</Text>
                </Col>
                <Col xs={24} sm={12} md={6} style={{ textAlign: 'center' }}>
                    <SolutionOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>Bằng lái xe</Title>
                    <Text type="secondary">Bằng lái xe hợp lệ (tối thiểu 1 năm kinh nghiệm).</Text>
                </Col>
                <Col xs={24} sm={12} md={6} style={{ textAlign: 'center' }}>
                    <UserOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>Độ tuổi</Title>
                    <Text type="secondary">Phải từ 21 tuổi trở lên để có thể thuê xe.</Text>
                </Col>
                <Col xs={24} sm={12} md={6} style={{ textAlign: 'center' }}>
                    <CreditCardOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>Thanh toán</Title>
                    <Text type="secondary">Thẻ tín dụng, chuyển khoản hoặc các ví điện tử.</Text>
                </Col>
            </Row>
        </Card>
        
        {/* CTA Section */}
        <div style={{ textAlign: 'center', background: 'white', padding: '48px 24px', borderRadius: 8 }}>
            <Title level={2} style={{ marginBottom: 16 }}>Sẵn sàng cho hành trình điện của bạn?</Title>
            <Paragraph style={{ fontSize: 16, color: '#595959', maxWidth: 600, margin: '0 auto 32px' }}>
                Tham gia cộng đồng lái xe bền vững và khám phá những chiếc xe điện tốt nhất của chúng tôi ngay hôm nay.
            </Paragraph>
            <Space size="large">
                <Link to="/vehicles">
                    <Button type="primary" size="large">
                        Khám phá phương tiện
                    </Button>
                </Link>
                <Link to="/register">
                    <Button size="large">
                        Tạo tài khoản ngay
                    </Button>
                </Link>
            </Space>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;