import React from "react";
import { Card, Row, Col, Typography, Button, Space, Avatar, Tag, Collapse, Divider, Tooltip } from "antd";
import { Link } from "react-router-dom";
import {
  SearchOutlined,
  CalendarOutlined,
  KeyOutlined,
  IdcardOutlined,
  SolutionOutlined,
  UserOutlined,
  CreditCardOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const HowItWorks: React.FC = () => {
  const faqItems = [
    {
      key: '1',
      label: 'What documents do I need to upload?',
      children: (
        <Paragraph type="secondary">
          A valid government ID (front & back) and a driver's license.  
          Please ensure photos are clear and information is readable.
        </Paragraph>
      ),
    },
    {
      key: '2',
      label: 'Is there a deposit?',
      children: (
        <Paragraph type="secondary">
          Some vehicles/stations require a refundable security deposit.  
          The amount is shown transparently during checkout.
        </Paragraph>
      ),
    },
    {
      key: '3',
      label: 'Can I change or cancel my booking?',
      children: (
        <Paragraph type="secondary">
          Yes. Changes/cancellations follow each station's policy.  
          You'll see exact terms before confirming your payment.
        </Paragraph>
      ),
    },
    {
      key: '4',
      label: 'Where do I pick up and return the vehicle?',
      children: (
        <Paragraph type="secondary">
          At the station you chose during booking.  
          Pick-up instructions and a map are included in your confirmation email.
        </Paragraph>
      ),
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HERO ===== */}
      <header className="relative w-full overflow-hidden">
        <div className="bg-blue-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-white">
            <div className="text-center">
              <Tag color="gold" className="mb-3 text-[13px] px-3 py-1 rounded-full">
                EV Rental made effortless
              </Tag>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                Rent an Electric Car in <span className="font-bold">3 simple steps</span>
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto mt-4">
                Transparent pricing. Instant confirmation. Pick up at your chosen station and drive cleaner today.
              </p>

              <Space size="middle" className="mt-8">
                <Link to="/vehicles">
                  <Button type="primary" size="large">
                    Browse Vehicles
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="large" ghost>
                    Create Account
                  </Button>
                </Link>
              </Space>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap gap-4 items-center justify-center opacity-90">
                <Space size="large" wrap>
                  <Space>
                    <SafetyCertificateOutlined />
                    <Text className="text-white/90">Secure checkout</Text>
                  </Space>
                  <Space>
                    <CheckCircleOutlined />
                    <Text className="text-white/90">No hidden fees</Text>
                  </Space>
                  <Space>
                    <ThunderboltOutlined />
                    <Text className="text-white/90">Instant confirmation</Text>
                  </Space>
                </Space>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 16px 80px" }}>
        {/* ===== PROCESS ===== */}
        <section className="mb-12 md:mb-16">
          <div className="text-center mb-8">
            <Title level={2} style={{ marginBottom: 8 }}>How the rental works</Title>
            <Text type="secondary">From browsing to pickup — it takes just minutes.</Text>
          </div>

          <Row gutter={[24, 24]} align="stretch" justify="center">
            {/* Step 1 */}
            <Col xs={24} md={7}>
              <Card hoverable className="h-full">
                <Avatar size={60} icon={<SearchOutlined />} style={{ background: "#e6f4ff", color: "#1677ff", margin: "18px 0" }} />
                <Title level={4}>Search & Select</Title>
                <Paragraph type="secondary">
                  Filter by station, range, body type and price. View photos, specs, and key features to pick the right EV.
                </Paragraph>
                <Tag bordered={false}>Live availability</Tag>
                <Tag bordered={false}>Real-time pricing</Tag>
              </Card>
            </Col>

            {/* Arrow */}
            <Col xs={0} md={1} className="hidden md:flex items-center justify-center">
              <ArrowRightOutlined style={{ fontSize: 22, color: "#bfbfbf" }} />
            </Col>

            {/* Step 2 */}
            <Col xs={24} md={7}>
              <Card hoverable className="h-full">
                <Avatar size={60} icon={<CalendarOutlined />} style={{ background: "#f6ffed", color: "#52c41a", margin: "18px 0" }} />
                <Title level={4}>Book & Pay</Title>
                <Paragraph type="secondary">
                  Choose dates & pickup time, enter driver details, upload documents, and pay securely via card, bank, or wallet.
                </Paragraph>
                <Tag bordered={false}>SSL 256-bit</Tag>
                <Tag bordered={false}>Instant receipt</Tag>
              </Card>
            </Col>

            {/* Arrow */}
            <Col xs={0} md={1} className="hidden md:flex items-center justify-center">
              <ArrowRightOutlined style={{ fontSize: 22, color: "#bfbfbf" }} />
            </Col>

            {/* Step 3 */}
            <Col xs={24} md={7}>
              <Card hoverable className="h-full">
                <Avatar size={60} icon={<KeyOutlined />} style={{ background: "#fffbe6", color: "#faad14", margin: "18px 0" }} />
                <Title level={4}>Pick up & go</Title>
                <Paragraph type="secondary">
                  Arrive at the station, verify with our staff, receive keys (or unlock via app), and start your trip.
                </Paragraph>
                <Tag bordered={false}>24/7 roadside</Tag>
                <Tag bordered={false}>App unlock</Tag>
              </Card>
            </Col>
          </Row>
        </section>

        {/* ===== REQUIREMENTS ===== */}
        <section className="mb-12 md:mb-16">
          <Card bordered={false} className="shadow-sm">
            <div className="text-center">
              <Title level={2} style={{ marginBottom: 8 }}>What you need</Title>
              <Text type="secondary">Bring these to ensure a smooth pickup.</Text>
            </div>

            <Row gutter={[24, 24]} justify="center" style={{ marginTop: 24 }}>
              <Col xs={24} sm={12} md={6} className="text-center">
                <IdcardOutlined style={{ fontSize: 44, color: "#1677ff", marginBottom: 14 }} />
                <Title level={4}>Government ID</Title>
                <Text type="secondary">Citizen ID or Passport (valid & not expired).</Text>
              </Col>
              <Col xs={24} sm={12} md={6} className="text-center">
                <SolutionOutlined style={{ fontSize: 44, color: "#1677ff", marginBottom: 14 }} />
                <Title level={4}>Driver’s License</Title>
                <Text type="secondary">At least 1 year of driving experience.</Text>
              </Col>
              <Col xs={24} sm={12} md={6} className="text-center">
                <UserOutlined style={{ fontSize: 44, color: "#1677ff", marginBottom: 14 }} />
                <Title level={4}>Age</Title>
                <Text type="secondary">21+ years old at the time of rental.</Text>
              </Col>
              <Col xs={24} sm={12} md={6} className="text-center">
                <CreditCardOutlined style={{ fontSize: 44, color: "#1677ff", marginBottom: 14 }} />
                <Title level={4}>Payment</Title>
                <Text type="secondary">Credit/Debit card, bank transfer, or e-wallet.</Text>
              </Col>
            </Row>
          </Card>
        </section>

        {/* ===== WHY CHOOSE US / VALUE PROPS ===== */}
        <section className="mb-12 md:mb-16">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card hoverable>
                <Space direction="vertical" size="small">
                  <Space size="small">
                    <ThunderboltOutlined className="text-emerald-500" />
                    <Title level={4} style={{ margin: 0 }}>Why rent with us?</Title>
                  </Space>
                  <ul className="list-disc ml-5 text-gray-600">
                    <li>Wide EV selection: city cars, crossovers, long-range sedans.</li>
                    <li>Transparent, all-inclusive pricing — no hidden fees.</li>
                    <li>Free charging at partner stations (selected plans).</li>
                    <li>Instant booking confirmation & flexible changes.</li>
                    <li>24/7 customer support & roadside assistance.</li>
                  </ul>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card hoverable>
                <Space direction="vertical" size="small">
                  <Space size="small">
                    <SafetyCertificateOutlined className="text-blue-500" />
                    <Title level={4} style={{ margin: 0 }}>Insurance & safety</Title>
                  </Space>
                  <ul className="list-disc ml-5 text-gray-600">
                    <li>Basic insurance included; premium options available.</li>
                    <li>Vehicles are checked & sanitized before every trip.</li>
                    <li>Real-time vehicle monitoring to support emergencies.</li>
                  </ul>
                </Space>
              </Card>
            </Col>
          </Row>
        </section>

        {/* ===== FAQ ===== */}
        <section className="mb-12 md:mb-16">
          <div className="text-center mb-8">
            <Title level={2} style={{ marginBottom: 8 }}>FAQs</Title>
            <Text type="secondary">Everything you need to know, before you go.</Text>
          </div>
          <Row gutter={[24, 24]}>
                        <Col xs={24} md={16} className="mx-auto">
              <Collapse 
                accordion 
                bordered={false} 
                defaultActiveKey={["1"]}
                items={faqItems}
              />
            </Col>
          </Row>
        </section>

        <Divider />

        {/* ===== SUPPORT / CTA ===== */}
        <section className="text-center">
          <Title level={2} style={{ marginBottom: 12 }}>Ready for your electric journey?</Title>
          <Paragraph className="max-w-2xl mx-auto" type="secondary">
            Join thousands of drivers switching to cleaner mobility.  
            Book your EV in minutes and enjoy a smooth, quiet ride.
          </Paragraph>
          <Space size="large" className="mt-4">
            <Link to="/vehicles">
              <Button type="primary" size="large">Explore Vehicles</Button>
            </Link>
            <Tooltip title="Need help? Our team is here 24/7">
              <Link to="/support">
                <Button size="large" icon={<CustomerServiceOutlined />}>Contact Support</Button>
              </Link>
            </Tooltip>
          </Space>
        </section>
      </main>
    </div>
  );
};

export default HowItWorks;