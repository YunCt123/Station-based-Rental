import React, { useState, useEffect, useCallback } from "react";
import { Card, Typography, Table, Tag, Button, message, Space } from "antd";
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import type { Booking } from "../../services/bookingService";

const { Title } = Typography;

const BookingsPage: React.FC = () => {
  console.log('🎯 Đang render component BookingsPage...');
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Hàm trợ giúp để định dạng giá VND hiển thị
  const formatVndPrice = (vndAmount: number): string => {
    if (!vndAmount) return '0 VND';
    return new Intl.NumberFormat('vi-VN').format(vndAmount) + ' VND';
  };

  // Hàm trợ giúp để định dạng giá hiển thị
  const formatPrice = (pricing?: { 
    total_price?: number;
    base_price?: number;
    taxes?: number;
    insurance_price?: number;
    deposit?: number;
    currency?: string;
    details?: {
      days?: number;
      hours?: number;
    }
  }) => {
    if (!pricing) return { total: 0, deposit: 0 };

    // Lấy tổng giá trực tiếp từ API
    const total = pricing.total_price || 0;
    const deposit = pricing.deposit || 0;

    // Hiển thị giá VND trực tiếp
    if ((pricing.currency === 'VND') || (total > 1000)) {
      console.log('Sử dụng giá VND trực tiếp:', { 
        total, 
        deposit,
        base: pricing.base_price,
        insurance: pricing.insurance_price,
        taxes: pricing.taxes,
        days: pricing.details?.days,
        hours: pricing.details?.hours
      });
      return {
        total: total,
        deposit: deposit
      };
    }
    
    // Đã ở VND
    return {
      total: total,
      deposit: deposit
    };
  };

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const userBookings = await bookingService.getUserBookings();
      setBookings(userBookings);
      console.log('Đã tải danh sách đặt xe:', userBookings);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đặt xe:', error);
      message.error('Không thể tải danh sách đặt xe');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Tự động làm mới mỗi 2 phút để kiểm tra cập nhật trạng thái
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Đang tự động làm mới danh sách đặt xe...');
      loadBookings();
    }, 120000); // 2 phút

    return () => clearInterval(interval);
  }, [loadBookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HELD':
        return 'orange';
      case 'CONFIRMED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      case 'EXPIRED':
        return 'gray';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Mã Đặt Xe',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => (
        <span className="font-mono text-xs">
          {id.substring(0, 8)}...
        </span>
      ),
    },
    {
      title: 'Phương Tiện',
      dataIndex: 'vehicle_snapshot',
      key: 'vehicle',
      render: (vehicle: { name?: string; type?: string; licensePlate?: string }) => (
        <div>
          <div className="font-semibold">{vehicle?.name || 'Phương tiện không xác định'}</div>
          <div className="text-xs text-gray-500">{vehicle?.type} • {vehicle?.licensePlate}</div>
        </div>
      ),
    },
    {
      title: 'Ngày Nhận Xe',
      dataIndex: 'start_at',
      key: 'start_at',
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(date).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      title: 'Ngày Trả Xe',
      dataIndex: 'end_at',
      key: 'end_at',
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(date).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      title: 'Tổng Số Tiền',
      dataIndex: 'pricing_snapshot',
      key: 'total',
      render: (pricing: { 
        total_price?: number;
        base_price?: number;
        taxes?: number;
        insurance_price?: number;
        deposit?: number;
        currency?: string;
        details?: {
          days?: number;
          hours?: number;
        }
      }) => {
        console.log('Chi tiết giá:', pricing);
        const prices = formatPrice(pricing);
        console.log('Giá đã định dạng:', prices);
        return (
          <div>
            <div className="font-semibold">
              {formatVndPrice(prices.total)}
            </div>
            <div className="text-xs text-gray-500">
              Tiền cọc: {formatVndPrice(prices.deposit)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_: unknown, record: Booking) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              if (record.status === 'HELD') {
                navigate(`/payment?bookingId=${record._id}`);
              } else {
                navigate(`/bookings/${record._id}`);
              }
            }}
          >
            {record.status === 'HELD' ? 'Thanh Toán' : 'Xem'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
        <Title level={2}>Danh Sách Đặt Xe</Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={loadBookings}
          loading={loading}
        >
          Làm Mới
        </Button>
      </div>

      <Card variant="outlined">
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong tổng số ${total} đặt xe`,
          }}
          locale={{
            emptyText: (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Không tìm thấy đặt xe nào</p>
                <Button type="primary" onClick={() => navigate('/vehicles')}>
                  Đặt Xe Ngay
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* Thống Kê Nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card variant="outlined">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {bookings.filter(b => b.status === 'HELD').length}
            </div>
            <div className="text-sm text-gray-500">Chờ Thanh Toán</div>
          </div>
        </Card>
        <Card variant="outlined">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-500">Đã Xác Nhận</div>
          </div>
        </Card>
        <Card variant="outlined">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {bookings.filter(b => b.status === 'CANCELLED' || b.status === 'EXPIRED').length}
            </div>
            <div className="text-sm text-gray-500">Đã Hủy/Hết Hạn</div>
          </div>
        </Card>
        <Card variant="outlined">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.length}
            </div>
            <div className="text-sm text-gray-500">Tổng Số Đặt Xe</div>
          </div>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default BookingsPage;