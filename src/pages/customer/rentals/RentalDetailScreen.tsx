/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Card,
  Typography,
  Space,
  Tag,
  Image,
  Row,
  Col,
  Button,
  Timeline,
  Divider,
  message,
} from "antd";
import {
  CarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { Rental, Payment } from "../../../services/customerService";
import PaymentHistory from "../../../components/customer/PaymentHistory";
import RejectedRentalInfo from "../../../components/customer/RejectedRentalInfo";
import ReportIssueModal from "../../../components/ReportIssueModal";

const { Title, Text, Paragraph } = Typography;

interface RentalDetailScreenProps {
  rental: Rental;
  payments: Payment[];
  onBack: () => void;
  onPayment?: (rental: Rental) => void;
}

/* -------------------------------------------------------------------------- */
/*  Helper: Định dạng tiền tệ (hỗ trợ VND, USD, …)                           */
/* -------------------------------------------------------------------------- */
const formatCurrency = (amount: number, currency: string) => {
  const opts: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };
  // Ant Design dùng locale 'en-US' → VND sẽ hiển thị ₫ ở cuối
  return new Intl.NumberFormat("vi-VN", opts).format(amount);
};

/* -------------------------------------------------------------------------- */
/*  Helper: Get rental type display info                                     */
/* -------------------------------------------------------------------------- */
const getRentalTypeInfo = (pricing_snapshot: {
  hourly_rate?: number;
  daily_rate?: number;
  details?: {
    rentalType?: string;
    peakMultiplier?: number;
    weekendMultiplier?: number;
  };
}) => {
  const rentalType = pricing_snapshot?.details?.rentalType;

  switch (rentalType) {
    case "daily":
      return {
        text: "Thuê theo ngày",
        color: "blue" as const,
      };
    case "hourly":
      return {
        text: "Thuê theo giờ",
        color: "green" as const,
      };
    default:
      // Fallback logic nếu không có rentalType
      if (pricing_snapshot?.hourly_rate && pricing_snapshot?.daily_rate) {
        return {
          text: "Kết hợp giờ và ngày",
          icon: "⏰",
          color: "purple" as const,
        };
      } else if (pricing_snapshot?.hourly_rate) {
        return { text: "Theo giờ", icon: "🕐", color: "green" as const };
      } else if (pricing_snapshot?.daily_rate) {
        return { text: "Theo ngày", icon: "📅", color: "blue" as const };
      }
      return { text: "Không xác định", icon: "❓", color: "default" as const };
  }
};

const RentalDetailScreen: React.FC<RentalDetailScreenProps> = ({
  rental,
  payments,
  onBack,
  onPayment,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);

  const {
    vehicle_id,
    station_id,
    status,
    booking_id,
    pickup,
    return: returnInfo,
    pricing_snapshot,
    charges,
  } = rental;

  /* ---------------------------------------------------------------------- */
  /*  Định dạng ngày giờ                                                    */
  /* ---------------------------------------------------------------------- */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ---------------------------------------------------------------------- */
  /*  Lấy URL ảnh (photo có thể là string hoặc object)                     */
  /* ---------------------------------------------------------------------- */
  const getPhotoUrl = (
    photo: string | { url: string; _id?: string }
  ): string => {
    return typeof photo === "string" ? photo : photo.url;
  };

  /* ---------------------------------------------------------------------- */
  /*  Cấu hình trạng thái                                                   */
  /* ---------------------------------------------------------------------- */
  const getStatusConfig = (st: string) => {
    const cfg = {
      CONFIRMED: { text: "Chờ nhận xe", color: "orange" },
      ONGOING: { text: "Đang sử dụng", color: "green" },
      REJECTED: { text: "Bị từ chối", color: "red" },
      RETURN_PENDING: { text: "Chờ thanh toán cuối", color: "red" },
      COMPLETED: { text: "Hoàn tất", color: "default" },
    };
    return cfg[st as keyof typeof cfg] ?? { text: st, color: "default" };
  };
  const statusConfig = getStatusConfig(status);

  /* ---------------------------------------------------------------------- */
  /*  Timeline                                                              */
  /* ---------------------------------------------------------------------- */
  const getTimelineItems = () => {
    const items = [
      {
        dot: <CalendarOutlined style={{ fontSize: "16px" }} />,
        color: "blue",
        children: (
          <div>
            <Text strong>Booking được tạo</Text>
            <br />
            <Text type="secondary">{formatDate(rental.createdAt)}</Text>
          </div>
        ),
      },
    ];

    if (status === "REJECTED" && pickup?.rejected?.reason) {
      items.push({
        dot: <CloseCircleOutlined style={{ fontSize: "16px" }} />,
        color: "red",
        children: (
          <div>
            <Text strong style={{ color: "#ff4d4f" }}>
              Yêu cầu nhận xe bị từ chối
            </Text>
            <br />
            <Text type="secondary">
              {pickup.rejected.at ? formatDate(pickup.rejected.at) : ""}
            </Text>
            <br />
            <Text>
              <strong>Lý do:</strong> {pickup.rejected.reason}
            </Text>
            {pickup.notes && (
              <>
                <br />
                <Text type="secondary">Ghi chú: {pickup.notes}</Text>
              </>
            )}
          </div>
        ),
      });
    } else if (pickup?.at) {
      items.push({
        dot: <CarOutlined style={{ fontSize: "16px" }} />,
        color: "green",
        children: (
          <div>
            <Text strong>Đã nhận xe</Text>
            <br />
            <Text type="secondary">{formatDate(pickup.at)}</Text>

            {/* Thông tin nhân viên giao xe */}
            {pickup.staff_id && (
              <>
                <br />
                <Text>
                  <Text strong>Giao xe bởi:</Text>{" "}
                  {typeof pickup.staff_id === "string"
                    ? pickup.staff_id
                    : (pickup.staff_id as any)?.name ||
                      (pickup.staff_id as any)?.email ||
                      "Nhân viên"}
                </Text>
                {typeof pickup.staff_id === "object" &&
                  (pickup.staff_id as any)?.phone && (
                    <>
                      <br />
                      <Text type="secondary">
                        SĐT: {(pickup.staff_id as any).phone}
                      </Text>
                    </>
                  )}
              </>
            )}

            {pickup.odo_km && (
              <>
                <br />
                <Text type="secondary">
                  Số km: {pickup.odo_km.toLocaleString()}
                </Text>
              </>
            )}
            {pickup.soc != null && (
              <>
                <br />
                <Text type="secondary">
                  Pin: {Math.round(pickup.soc * 100)}%
                </Text>
              </>
            )}
          </div>
        ),
      });
    }

    if (returnInfo?.at) {
      items.push({
        dot: <CheckCircleOutlined style={{ fontSize: "16px" }} />,
        color: status === "COMPLETED" ? "green" : "orange",
        children: (
          <div>
            <Text strong>Đã trả xe</Text>
            <br />
            <Text type="secondary">{formatDate(returnInfo.at)}</Text>

            {/* Thông tin nhân viên nhận xe */}
            {returnInfo.staff_id && (
              <>
                <br />
                <Text>
                  <Text strong>Nhận xe bởi:</Text>{" "}
                  {typeof returnInfo.staff_id === "string"
                    ? returnInfo.staff_id
                    : (returnInfo.staff_id as any)?.name ||
                      (returnInfo.staff_id as any)?.email ||
                      "Nhân viên"}
                </Text>
                {typeof returnInfo.staff_id === "object" &&
                  (returnInfo.staff_id as any)?.phone && (
                    <>
                      <br />
                      <Text type="secondary">
                        SĐT: {(returnInfo.staff_id as any).phone}
                      </Text>
                    </>
                  )}
              </>
            )}

            {returnInfo.odo_km && (
              <>
                <br />
                <Text type="secondary">
                  Số km cuối: {returnInfo.odo_km.toLocaleString()}
                </Text>
              </>
            )}
            {returnInfo.soc != null && (
              <>
                <br />
                <Text type="secondary">
                  Pin cuối: {Math.round(returnInfo.soc * 100)}%
                </Text>
              </>
            )}
          </div>
        ),
      });
    }

    if (status === "COMPLETED") {
      items.push({
        dot: <CreditCardOutlined style={{ fontSize: "16px" }} />,
        color: "green",
        children: (
          <div>
            <Text strong>Hoàn tất thanh toán</Text>
            <br />
            <Text type="secondary">Thuê xe đã hoàn tất</Text>
          </div>
        ),
      });
    }

    return items;
  };

  /* ---------------------------------------------------------------------- */
  /*  Tính tiền còn lại (total - deposit)                                   */
  /* ---------------------------------------------------------------------- */
  // const remainingAmount = charges?.total - (pricing_snapshot.deposit ?? 0);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Title level={2} style={{ margin: 0, lineHeight: 1 }}>
            Chi tiết thuê xe
          </Title>

          <Tag
            color={statusConfig.color}
            style={{
              fontSize: 14,
              padding: "0 12px",
              height: 28,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {statusConfig.text}
          </Tag>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* ---------- Thông tin xe ---------- */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <>
                <CarOutlined /> Thông tin xe
              </>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Image
                width="100%"
                height={200}
                src={vehicle_id.image}
                style={{ objectFit: "cover", borderRadius: 8 }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6U"
              />
            </div>

            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                {vehicle_id.name}
              </Title>

              <Text>
                <Text strong>Thương hiệu:</Text> {vehicle_id.brand}
              </Text>
              <Text>
                <Text strong>Model:</Text> {vehicle_id.model} ({vehicle_id.year}
                )
              </Text>
              <Text>
                <Text strong>Loại xe:</Text> {vehicle_id.type}
              </Text>
              <Text>
                <Text strong>Số chỗ:</Text> {vehicle_id.seats} chỗ
              </Text>
              <Text>
                <Text strong>Dung lượng pin:</Text> {vehicle_id.battery_kWh} kWh
              </Text>

              {vehicle_id.licensePlate && (
                <Text>
                  <Text strong>Biển số:</Text>{" "}
                  <Text code>{vehicle_id.licensePlate}</Text>
                </Text>
              )}

              <Divider style={{ margin: "12px 0" }} />

              {/* Thông tin giá thuê */}
              <div
                style={{
                  borderRadius: 6,
                  padding: 12,
                }}
              >
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Bảng giá thuê:
                </Text>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {pricing_snapshot.hourly_rate != null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 13 }}>Giá theo giờ:</Text>
                      <Text strong style={{ fontSize: 13 }}>
                        {formatCurrency(
                          pricing_snapshot.hourly_rate,
                          pricing_snapshot.currency
                        )}
                      </Text>
                    </div>
                  )}
                  {pricing_snapshot.daily_rate != null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 13 }}>Giá theo ngày:</Text>
                      <Text strong style={{ fontSize: 13 }}>
                        {formatCurrency(
                          pricing_snapshot.daily_rate,
                          pricing_snapshot.currency
                        )}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* ---------- Lịch trình thuê xe ---------- */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <>
                <ClockCircleOutlined /> Lịch trình thuê xe
              </>
            }
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div>
                <Text strong>Thời gian thuê:</Text>
                <br />
                <Text>
                  {formatDate(booking_id.start_at)} -{" "}
                  {formatDate(booking_id.end_at)}
                </Text>
              </div>

              <div>
                <Text strong>Lấy xe tại trạm:</Text>
                <br />
                <Text style={{ color: "#52c41a" }}>{station_id.name}</Text>
                <br />
                <Text type="secondary">
                  {station_id.address}, {station_id.city}
                </Text>
              </div>

              <Divider />
              <Timeline items={getTimelineItems()} />
            </Space>
          </Card>
        </Col>

        {/* ---------- Thông tin từ chối (chỉ hiện khi REJECTED) ---------- */}
        {status === "REJECTED" && pickup && (
          <Col xs={24}>
            <RejectedRentalInfo pickup={pickup} showPhotos={false} />
          </Col>
        )}

        {/* ---------- Thông tin thanh toán ---------- */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <>
                <CreditCardOutlined style={{ marginRight: 8 }} />
                Thông tin thanh toán
              </>
            }
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {/* Hình thức thuê */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong>Hình thức thuê:</Text>
                <Tag
                  color={getRentalTypeInfo(pricing_snapshot).color}
                  style={{ padding: "4px 12px", fontSize: "13px" }}
                >
                  <span style={{ marginRight: 6 }}>
                    {getRentalTypeInfo(pricing_snapshot).icon}
                  </span>
                  {getRentalTypeInfo(pricing_snapshot).text}
                </Tag>
              </div>

              {/* Thời gian thuê */}
              {(() => {
                const details = (
                  pricing_snapshot as {
                    details?: { days?: number; hours?: number };
                  }
                )?.details;
                return (
                  <>
                    {details?.days && details.days > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text>Thời gian:</Text>
                        <Text strong style={{ color: "#52c41a" }}>
                          {details.days} ngày
                          {details.hours &&
                            details.hours > 0 &&
                            ` (${details.hours} giờ)`}
                        </Text>
                      </div>
                    )}

                    {details?.hours && details.hours > 0 && !details.days && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text>Thời gian:</Text>
                        <Text strong style={{ color: "#52c41a" }}>
                          {details.hours} giờ
                        </Text>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Phụ phí (nếu có) */}
              {(() => {
                const details = (
                  pricing_snapshot as {
                    details?: {
                      peakMultiplier?: number;
                      weekendMultiplier?: number;
                    };
                  }
                )?.details;
                const hasPeakMultiplier =
                  details?.peakMultiplier && details.peakMultiplier > 1;
                const hasWeekendMultiplier =
                  details?.weekendMultiplier && details.weekendMultiplier > 1;

                return (
                  (hasPeakMultiplier || hasWeekendMultiplier) && (
                    <div
                      style={{
                        backgroundColor: "#fff7e6",
                        border: "1px solid #ffd591",
                        borderRadius: 6,
                        padding: 12,
                      }}
                    >
                      <Text
                        strong
                        style={{
                          color: "#d48806",
                          fontSize: 13,
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        Phụ phí áp dụng:
                      </Text>
                      <div
                        style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
                      >
                        {hasPeakMultiplier && (
                          <span style={{ fontSize: 12, color: "#d48806" }}>
                            Giờ cao điểm: x{details?.peakMultiplier}
                          </span>
                        )}
                        {hasWeekendMultiplier && (
                          <span style={{ fontSize: 12, color: "#d48806" }}>
                            Cuối tuần: x{details?.weekendMultiplier}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                );
              })()}

              <div
                style={{ borderTop: "1px dashed #f0f0f0", margin: "8px 0" }}
              ></div>

              {/* Chi phí chính */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text>Giá thuê:</Text>
                  <Text strong>
                    {formatCurrency(
                      (pricing_snapshot as unknown as { base_price?: number })
                        .base_price || 0,
                      pricing_snapshot.currency
                    )}
                  </Text>
                </div>

                {/* Bảo hiểm */}
                {(pricing_snapshot as unknown as { insurance_price?: number })
                  .insurance_price &&
                  (pricing_snapshot as unknown as { insurance_price: number })
                    .insurance_price > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text>Bảo hiểm (10%):</Text>
                      <Text>
                        {formatCurrency(
                          (
                            pricing_snapshot as unknown as {
                              insurance_price: number;
                            }
                          ).insurance_price,
                          pricing_snapshot.currency
                        )}
                      </Text>
                    </div>
                  )}

                {/* Thuế */}
                {(pricing_snapshot as unknown as { taxes?: number }).taxes &&
                  (pricing_snapshot as unknown as { taxes: number }).taxes >
                    0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text>Thuế & phí (10%):</Text>
                      <Text>
                        {formatCurrency(
                          (pricing_snapshot as unknown as { taxes: number })
                            .taxes,
                          pricing_snapshot.currency
                        )}
                      </Text>
                    </div>
                  )}

                <div
                  style={{ borderTop: "1px solid #f0f0f0", margin: "12px 0" }}
                ></div>

                {/* Tổng tiền */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Text strong style={{ fontSize: 16 }}>
                    Tổng tiền:
                  </Text>
                  <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                    {formatCurrency(
                      (pricing_snapshot as unknown as { total_price?: number })
                        .total_price || 0,
                      pricing_snapshot.currency
                    )}
                  </Text>
                </div>

                {/* Tiền cọc và còn lại */}
                {pricing_snapshot.deposit != null && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ color: "#8c8c8c" }}>
                        Đã thanh toán cọc:
                      </Text>
                      <Text style={{ color: "#8c8c8c" }}>
                        -
                        {formatCurrency(
                          pricing_snapshot.deposit,
                          pricing_snapshot.currency
                        )}
                      </Text>
                    </div>

                    {(() => {
                      const totalPrice =
                        (
                          pricing_snapshot as unknown as {
                            total_price?: number;
                          }
                        ).total_price || 0;
                      const deposit = pricing_snapshot.deposit || 0;
                      const remaining = totalPrice - deposit;

                      return (
                        remaining > 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "8px",
                              borderRadius: 4,
                              border: "1px solid #ffbb96",
                            }}
                          >
                            <Text strong style={{ color: "#fa541c" }}>
                              Còn lại cần trả (Dự kiến) :
                            </Text>
                            <Text
                              strong
                              style={{ color: "#fa541c", fontSize: 15 }}
                            >
                              {formatCurrency(
                                remaining,
                                pricing_snapshot.currency
                              )}
                            </Text>
                          </div>
                        )
                      );
                    })()}
                  </>
                )}
              </div>
            </Space>
          </Card>

          {/* ---------- Chi tiết hóa đơn (đầy đủ phí) ---------- */}
          {((status === "RETURN_PENDING" && onPayment) ||
            status === "COMPLETED") && (
            <Card
              title={
                <>
                  <CreditCardOutlined /> Chi tiết hóa đơn
                </>
              }
              style={{ marginTop: 16 }}
            >
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {/* Loại thuê xe */}
                <Text>
                  <Text strong>Loại thuê xe:</Text>{" "}
                  {pricing_snapshot.details?.rentalType === "daily"
                    ? "Theo ngày"
                    : pricing_snapshot.details?.rentalType === "hourly"
                    ? "Theo giờ"
                    : "Không xác định"}
                </Text>

                {/* Phí thuê xe (chính) */}
                <Text>
                  <div>
                    <Text strong>Giá thuê ban đầu:</Text>
                    <div
                      style={{
                        borderLeft: "2px solid #d9d9d9",
                        marginLeft: 10,
                        paddingLeft: 12,
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary">Giá cơ bản</Text>
                        <Text>
                          {formatCurrency(pricing_snapshot.base_price, "VND")}
                        </Text>
                      </div>
                      {pricing_snapshot.insurance_price > 0 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text type="secondary">Bảo hiểm</Text>
                          <Text>
                            {formatCurrency(
                              pricing_snapshot.insurance_price,
                              "VND"
                            )}
                          </Text>
                        </div>
                      )}
                      {pricing_snapshot.taxes > 0 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text type="secondary">Thuế & phí dịch vụ</Text>
                          <Text>
                            {formatCurrency(pricing_snapshot.taxes, "VND")}
                          </Text>
                        </div>
                      )}
                        {(rental.charges?.extra_fees ?? 0) > 0 && (
                        <div
                          style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          }}
                        >
                          {(rental.charges?.cleaning_fee ?? 0) > 0 && (
                          <div
                            style={{
                            display: "flex",
                            justifyContent: "space-between",
                            }}
                          >
                            <Text type="secondary">Phí vệ sinh</Text>
                            <Text>
                            {formatCurrency(rental.charges?.cleaning_fee ?? 0, "VND")}
                            </Text>
                          </div>
                          )}
                          {(rental.charges?.damage_fee ?? 0) > 0 && (
                          <div
                            style={{
                            display: "flex",
                            justifyContent: "space-between",
                            }}
                          >
                            <Text type="secondary">Phí hư hỏng</Text>
                            <Text>
                            {formatCurrency(rental.charges?.damage_fee ?? 0, "VND")}
                            </Text>
                          </div>
                          )}
                          {(rental.charges?.late_fee ?? 0) > 0 && (
                          <div
                            style={{
                            display: "flex",
                            justifyContent: "space-between",
                            }}
                          >
                            <Text type="secondary">Phí trễ hạn</Text>
                            <Text>
                            {formatCurrency(rental.charges?.late_fee ?? 0, "VND")}
                            </Text>
                          </div>
                          )}
                          {(rental.charges?.other_fees ?? 0)  > 0 && (
                          <div
                            style={{
                            display: "flex",
                            justifyContent: "space-between",
                            }}
                          >
                            <Text type="secondary">Phí khác</Text>
                            <Text>
                            {formatCurrency(rental.charges?.other_fees ?? 0, "VND")}
                            </Text>
                          </div>
                          )}
                        </div>
                        )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          paddingTop: 4,
                          borderTop: "1px dashed #e8e8e8",
                          marginTop: 4,
                        }}
                      >
                        <Text strong>Tổng giá thuê</Text>
                        <Text strong type="success">
                          {formatCurrency(pricing_snapshot.total_price, "VND")}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Text>

                {/* Các phí phát sinh riêng lẻ – chỉ hiện khi > 0 */}
                {/*charges?.cleaning_fee > 0 && (
                      <Text>
                        <Text strong>Phí vệ sinh:</Text>{' '}
                        <Text type="warning">
                          {formatCurrency(charges.cleaning_fee)}
                        </Text>
                      </Text>
                    )*/}

                {/*charges?.damage_fee > 0 && (
                      <Text>
                        <Text strong>Phí hư hỏng:</Text>{' '}
                        <Text type="warning">
                          {formatCurrency(charges.damage_fee)}
                        </Text>
                      </Text>
                    )*/}

                {/*charges?.late_fee > 0 && (
                      <Text>
                        <Text strong>Phí trễ hạn:</Text>{' '}
                        <Text type="warning">
                          {formatCurrency(charges.late_fee)}
                        </Text>
                      </Text>
                    )*/}

                {/*charges?.other_fees > 0 && (
                      <Text>
                        <Text strong>Phí khác:</Text>{' '}
                        <Text type="warning">
                          {formatCurrency(charges.other_fees)}
                        </Text>
                      </Text>
                    )*/}

                {/* === KHÔNG HIỂN THỊ extra_fees === */}
                {/* Vì extra_fees = cleaning + damage + late + other */}

                <Divider />

                {/* Tổng tiền (đã bao gồm tất cả phí) */}
                <Text>
                  <Text strong>Tổng tiền:</Text>{" "}
                  <Text type="danger" strong>
                    {formatCurrency(
                      pricing_snapshot.total_price + (charges?.extra_fees || 0),
                      "VND"
                    )}
                  </Text>
                </Text>

                {/* Tiền cọc đã thu */}
                {pricing_snapshot.deposit != null && (
                  <Text>
                    <Text strong>Tiền đặt cọc đã thu:</Text>{" "}
                    <Text type="secondary">
                      {formatCurrency(pricing_snapshot.deposit, "VND")}
                    </Text>
                  </Text>
                )}

                {/* Tiền còn lại cần thanh toán */}
                {status === "RETURN_PENDING" && (
                  <Text>
                    <Text strong style={{ color: "#d9363e" }}>
                      Tổng tiền còn lại cần thanh toán:
                    </Text>{" "}
                    <Text type="danger" strong>
                      {formatCurrency(
                        pricing_snapshot.total_price +
                          (charges?.extra_fees || 0) -
                          (pricing_snapshot.deposit ?? 0),
                        "VND"
                      )}
                    </Text>
                  </Text>
                )}
              </Space>
            </Card>
          )}
        </Col>

        {/* ---------- Ảnh nhận xe / Ảnh từ chối ---------- */}
        {status === "REJECTED" &&
        pickup?.rejected?.photos &&
        pickup.rejected.photos.length > 0 ? (
          <Col xs={24}>
            <Card title="Ảnh từ chối nhận xe" className="reject-photos-card">
              <Row gutter={[8, 8]}>
                {pickup.rejected.photos.map((photo, idx) => (
                  <Col key={idx} xs={12} sm={8} md={6} lg={4}>
                    <Image
                      width="100%"
                      height={120}
                      src={getPhotoUrl(photo)}
                      style={{
                        objectFit: "cover",
                        borderRadius: 4,
                        border: "2px solid #ff4d4f",
                      }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6U"
                    />
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        ) : (
          pickup?.photos &&
          pickup.photos.length > 0 && (
            <Col xs={24}>
              <Card title="Ảnh nhận xe">
                <Row gutter={[8, 8]}>
                  {pickup.photos.map((photo, idx) => (
                    <Col key={idx} xs={12} sm={8} md={6} lg={4}>
                      <Image
                        width="100%"
                        height={120}
                        src={getPhotoUrl(photo)}
                        style={{ objectFit: "cover", borderRadius: 4 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6U"
                      />
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          )
        )}

        {/* ---------- Ảnh trả xe ---------- */}
        {returnInfo?.photos && returnInfo.photos.length > 0 && (
          <Col xs={24}>
            <Card title="Ảnh trả xe">
              <Row gutter={[8, 8]}>
                {returnInfo.photos.map((photo, idx) => (
                  <Col key={idx} xs={12} sm={8} md={6} lg={4}>
                    <Image
                      width="100%"
                      height={120}
                      src={getPhotoUrl(photo)}
                      style={{ objectFit: "cover", borderRadius: 4 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6U"
                    />
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        )}

        {/* ---------- Lịch sử thanh toán ---------- */}
        <Col xs={24}>
          <PaymentHistory
            payments={payments}
            pricingSnapshot={pricing_snapshot}
          />
        </Col>

        {/* ---------- Nút báo cáo sự cố (ONGOING) ---------- */}
        {status === "ONGOING" && (
          <Col xs={24}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Paragraph>
                  Gặp sự cố trong quá trình sử dụng xe? Báo cáo ngay để được hỗ
                  trợ kịp thời.
                </Paragraph>
                <Button
                  type="default"
                  size="large"
                  danger
                  icon={<ExclamationCircleOutlined />}
                  onClick={() => setShowReportModal(true)}
                >
                  Báo cáo sự cố
                </Button>
              </div>
            </Card>
          </Col>
        )}

        {/* ---------- Nút thanh toán (RETURN_PENDING) ---------- */}
        {status === "RETURN_PENDING" && onPayment && (
          <Col xs={24}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Paragraph>
                  Nhân viên đã hoàn tất kiểm tra xe. Vui lòng thanh toán để hoàn
                  tất việc thuê xe.
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  icon={<CreditCardOutlined />}
                  onClick={() => onPayment(rental)}
                >
                  Thanh toán ngay
                </Button>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        rentalId={rental._id}
        vehicleName={vehicle_id?.name || "Xe thuê"}
        onSuccess={() => {
          message.success(
            "Báo cáo sự cố thành công! Nhân viên sẽ liên hệ sớm nhất."
          );
        }}
      />
    </div>
  );
};

export default RentalDetailScreen;
