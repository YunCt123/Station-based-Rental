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
      label: 'Tôi cần tải lên những giấy tờ gì?',
      children: (
        <Paragraph type="secondary">
          Một giấy tờ tùy thân hợp lệ (mặt trước & mặt sau) và giấy phép lái xe.  
          Vui lòng đảm bảo ảnh rõ ràng và thông tin dễ đọc.
        </Paragraph>
      ),
    },
    {
      key: '2',
      label: 'Có cần đặt cọc không?',
      children: (
        <Paragraph type="secondary">
          Một số xe/trạm yêu cầu đặt cọc bảo đảm có thể hoàn lại.  
          Số tiền sẽ được hiển thị minh bạch trong quá trình thanh toán.
        </Paragraph>
      ),
    },
    {
      key: '3',
      label: 'Tôi có thể thay đổi hoặc hủy đặt xe không?',
      children: (
        <Paragraph type="secondary">
          Có. Việc thay đổi/hủy đặt xe tuân theo chính sách của từng trạm.  
          Bạn sẽ thấy các điều khoản cụ thể trước khi xác nhận thanh toán.
        </Paragraph>
      ),
    },
    {
      key: '4',
      label: 'Tôi lấy và trả xe ở đâu?',
      children: (
        <Paragraph type="secondary">
          Tại trạm bạn đã chọn khi đặt xe.  
          Hướng dẫn nhận xe và bản đồ sẽ được gửi trong email xác nhận của bạn.
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
                Thuê xe điện dễ dàng
              </Tag>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                Thuê xe điện chỉ với <span className="font-bold">3 bước đơn giản</span>
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto mt-4">
                Giá cả minh bạch. Xác nhận ngay lập tức. Nhận xe tại trạm bạn chọn và lái xe sạch hơn ngay hôm nay.
              </p>

              <Space size="middle" className="mt-8">
                <Link to="/vehicles">
                  <Button type="primary" size="large">
                    Xem xe
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="large" ghost>
                    Tạo tài khoản
                  </Button>
                </Link>
              </Space>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap gap-4 items-center justify-center opacity-90">
                <Space size="large" wrap>
                  <Space>
                    <SafetyCertificateOutlined />
                    <Text className="text-white/90">Thanh toán an toàn</Text>
                  </Space>
                  <Space>
                    <CheckCircleOutlined />
                    <Text className="text-white/90">Không phí ẩn</Text>
                  </Space>
                  <Space>
                    <ThunderboltOutlined />
                    <Text className="text-white/90">Xác nhận tức thì</Text>
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
            <Title level={2} style={{ marginBottom: 8 }}>Quy trình thuê xe</Title>
            <Text type="secondary">Từ tìm kiếm đến nhận xe — chỉ mất vài phút.</Text>
          </div>

          <Row gutter={[24, 24]} align="stretch" justify="center">
            {/* Step 1 */}
            <Col xs={24} md={7}>
              <Card hoverable className="h-full">
                <Avatar size={60} icon={<SearchOutlined />} style={{ background: "#e6f4ff", color: "#1677ff", margin: "18px 0" }} />
                <Title level={4}>Tìm kiếm & Chọn xe</Title>
                <Paragraph type="secondary">
                  Lọc theo trạm, phạm vi, loại xe và giá cả. Xem ảnh, thông số kỹ thuật và các tính năng chính để chọn xe phù hợp.
                </Paragraph>
                <Tag bordered={false}>Tình trạng xe trực tiếp</Tag>
                <Tag bordered={false}>Giá cả theo thời gian thực</Tag>
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
                <Title level={4}>Đặt xe & Thanh toán</Title>
                <Paragraph type="secondary">
                  Chọn ngày & giờ nhận xe, nhập thông tin tài xế, tải lên giấy tờ và thanh toán an toàn qua thẻ, ngân hàng hoặc ví điện tử.
                </Paragraph>
                <Tag bordered={false}>Bảo mật SSL 256-bit</Tag>
                <Tag bordered={false}>Hóa đơn tức thì</Tag>
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
                <Title level={4}>Nhận xe & Lên đường</Title>
                <Paragraph type="secondary">
                  Đến trạm, xác minh với nhân viên, nhận chìa khóa (hoặc mở khóa qua ứng dụng) và bắt đầu chuyến đi của bạn.
                </Paragraph>
                <Tag bordered={false}>Hỗ trợ 24/7</Tag>
                <Tag bordered={false}>Mở khóa qua ứng dụng</Tag>
              </Card>
            </Col>
          </Row>
        </section>

        {/* ===== REQUIREMENTS ===== */}
        <section className="mb-12 md:mb-16">
          <Card bordered={false} className="shadow-sm">
            <div className="text-center">
              <Title level={2} style={{ marginBottom: 8 }}>Những gì bạn cần</Title>
              <Text type="secondary">Mang theo những thứ này để đảm bảo nhận xe suôn sẻ.</Text>
            </div>

            <Row gutter={[24, 24]} justify="center" style={{ marginTop: 24 }}>
              <Col xs={24} sm={12} md={6} className="text-center">
                <IdcardOutlined style={{ fontSize: 44, color: "#1677ff", marginBottom: 14 }} />
                <Title level={4}>Giấy tờ tùy thân</Title>
                <Text type="secondary">CMND hoặc Hộ chiếu (hợp lệ & không hết hạn).</Text>
              </Col>
              <Col xs={24} sm={12} md={6} className="text-center">
                <SolutionOutlined style={{ fontSize: 44, color: "#1677ff", marginBottom: 14 }} />
                <Title level={4}>Giấy phép lái xe</Title>
                <Text type="secondary">Sở hữu giấy phép lái xe hợp lệ.</Text>
              </Col>
              <Col xs={24} sm={12} md={6} className="text-center">
                <UserOutlined style={{ fontSize: 44, color: "#1677ff", marginBottom: 14 }} />
                <Title level={4}>Độ tuổi</Title>
                <Text type="secondary">Từ 18 tuổi trở lên tại thời điểm thuê xe.</Text>
              </Col>
              <Col xs={24} sm={12} md={6} className="text-center">
                <CreditCardOutlined style={{ fontSize: 44, color: "#1677ff", marginBottom: 14 }} />
                <Title level={4}>Thanh toán</Title>
                <Text type="secondary">Tiền mặt, chuyển khoản ngân hàng.</Text>
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
                    <Title level={4} style={{ margin: 0 }}>Tại sao chọn chúng tôi?</Title>
                  </Space>
                  <ul className="list-disc ml-5 text-gray-600">
                    <li>Đa dạng xe điện: xe đô thị, crossover, sedan đường dài.</li>
                    <li>Giá cả minh bạch, bao gồm tất cả — không phí ẩn.</li>
                    <li>Xác nhận đặt xe tức thì.</li>
                  </ul>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card hoverable>
                <Space direction="vertical" size="small">
                  <Space size="small">
                    <SafetyCertificateOutlined className="text-blue-500" />
                    <Title level={4} style={{ margin: 0 }}>Bảo hiểm & an toàn</Title>
                  </Space>
                  <ul className="list-disc ml-5 text-gray-600">
                    <li>Bảo hiểm cơ bản đi kèm; tùy chọn nâng cao có sẵn.</li>
                    <li>Xe được kiểm tra & khử trùng trước mỗi chuyến đi.</li>
                    <li>Giám sát xe theo thời gian thực để hỗ trợ khẩn cấp.</li>
                  </ul>
                </Space>
              </Card>
            </Col>
          </Row>
        </section>

        {/* ===== FAQ ===== */}
        <section className="mb-12 md:mb-16">
          <div className="text-center mb-8">
            <Title level={2} style={{ marginBottom: 8 }}>Câu hỏi thường gặp</Title>
            <Text type="secondary">Tất cả những gì bạn cần biết trước khi đi.</Text>
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
          <Title level={2} style={{ marginBottom: 12 }}>Sẵn sàng cho hành trình điện của bạn?</Title>
          <Paragraph className="max-w-2xl mx-auto" type="secondary">
            Tham gia cùng hàng ngàn tài xế chuyển sang di chuyển sạch hơn.  
            Đặt xe điện của bạn trong vài phút và tận hưởng chuyến đi êm ái, yên tĩnh.
          </Paragraph>
          <Space size="large" className="mt-4">
            <Link to="/vehicles">
              <Button type="primary" size="large">Khám phá xe</Button>
            </Link>
            <Tooltip title="Cần hỗ trợ? Đội ngũ của chúng tôi luôn sẵn sàng 24/7">
              <Link to="/support">
                <Button size="large" icon={<CustomerServiceOutlined />}>Liên hệ hỗ trợ</Button>
              </Link>
            </Tooltip>
          </Space>
        </section>
      </main>
    </div>
  );
};

export default HowItWorks;