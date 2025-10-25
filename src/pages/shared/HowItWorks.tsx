import { Card, Row, Col, Typography, Button, Space, Avatar, Timeline, Divider } from 'antd';
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
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Rent a Car in 3 Easy Steps
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              The electric vehicle rental experience has never been simpler.
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {/* --- REWORKED STEPS SECTION --- */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 32 }}>Our Rental Process</Title>
            <Row gutter={[32, 32]} align="middle" justify="center">
                {/* Step 1 */}
                <Col xs={24} md={7}>
                    <Card hoverable style={{ height: '100%' }}>
                        <Avatar size={64} icon={<SearchOutlined />} style={{ backgroundColor: '#e6f7ff', color: '#1890ff', marginBottom: 24 }} />
                        <Title level={4}>1. Search & Select</Title>
                        <Paragraph type="secondary">
                            Use filters to find your desired station and vehicle type. View details, photos, and reviews to make the best choice.
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
                        <Title level={4}>2. Book & Pay</Title>
                        <Paragraph type="secondary">
                            Choose your pickup and return dates. Provide the necessary information and complete a secure payment through various flexible methods.
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
                        <Title level={4}>3. Pick Up & Go</Title>
                        <Paragraph type="secondary">
                            Arrive at the station on time, verify with our staff, and get the keys (or unlock via the app). Start your journey!
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
        {/* --- END REWORKED SECTION --- */}
        
        {/* Requirements Section */}
        <Card bordered={false} style={{ marginBottom: 48 }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>What You Need to Get Started</Title>
            <Row gutter={[32, 32]} justify="center">
                <Col xs={24} sm={12} md={6} style={{ textAlign: 'center' }}>
                    <IdcardOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>Personal ID</Title>
                    <Text type="secondary">Valid ID card or Passport.</Text>
                </Col>
                <Col xs={24} sm={12} md={6} style={{ textAlign: 'center' }}>
                    <SolutionOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>Driver's License</Title>
                    <Text type="secondary">Valid license (min. 1 year of experience).</Text>
                </Col>
                <Col xs={24} sm={12} md={6} style={{ textAlign: 'center' }}>
                    <UserOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>Age Requirement</Title>
                    <Text type="secondary">Must be 21 or older to rent.</Text>
                </Col>
                <Col xs={24} sm={12} md={6} style={{ textAlign: 'center' }}>
                    <CreditCardOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>Payment Method</Title>
                    <Text type="secondary">Credit card, bank transfer, or e-wallets.</Text>
                </Col>
            </Row>
        </Card>
        
        {/* CTA Section */}
        <div style={{ textAlign: 'center', background: 'white', padding: '48px 24px', borderRadius: 8 }}>
            <Title level={2} style={{ marginBottom: 16 }}>Ready for Your Electric Journey?</Title>
            <Paragraph style={{ fontSize: 16, color: '#595959', maxWidth: 600, margin: '0 auto 32px' }}>
                Join the sustainable driving community and discover our best electric vehicles today.
            </Paragraph>
            <Space size="large">
                <Link to="/vehicles">
                    <Button type="primary" size="large">
                        Explore Vehicles
                    </Button>
                </Link>
                <Link to="/register">
                    <Button size="large">
                        Create Account Now
                    </Button>
                </Link>
            </Space>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;