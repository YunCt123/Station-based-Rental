import React, { useState, useEffect, useCallback } from "react";
import { Card, Typography, Table, Tag, Button, message, Space } from "antd";
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import type { Booking } from "../../services/bookingService";

const { Title } = Typography;

const BookingsPage: React.FC = () => {
  console.log('🎯 BookingsPage component rendering...');
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format VND price for display
  const formatVndPrice = (vndAmount: number): string => {
    if (!vndAmount) return '0 VND';
    return new Intl.NumberFormat('vi-VN').format(vndAmount) + ' VND';
  };

  // Helper function to format price for display
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

    // Get total price directly from API
    const total = pricing.total_price || 0;
    const deposit = pricing.deposit || 0;

    // Display VND prices directly
    if ((pricing.currency === 'VND') || (total > 1000)) {
      console.log('Using VND prices directly:', { 
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
    
    // Already in VND
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
      console.log('User bookings loaded:', userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      message.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Auto-refresh every 2 minutes to check for status updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing bookings...');
      loadBookings();
    }, 120000); // 2 minutes

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
      title: 'Booking ID',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => (
        <span className="font-mono text-xs">
          {id.substring(0, 8)}...
        </span>
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicle_snapshot',
      key: 'vehicle',
      render: (vehicle: { name?: string; type?: string; licensePlate?: string }) => (
        <div>
          <div className="font-semibold">{vehicle?.name || 'Unknown Vehicle'}</div>
          <div className="text-xs text-gray-500">{vehicle?.type} • {vehicle?.licensePlate}</div>
        </div>
      ),
    },
    {
      title: 'Pickup Date',
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
      title: 'Return Date',
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
      title: 'Total Amount',
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
        console.log('Pricing snapshot:', pricing);
        const prices = formatPrice(pricing);
        console.log('Formatted prices:', prices);
        return (
          <div>
            <div className="font-semibold">
              {formatVndPrice(prices.total)}
            </div>
            <div className="text-xs text-gray-500">
              Deposit: {formatVndPrice(prices.deposit)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
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
            {record.status === 'HELD' ? 'Pay Now' : 'View'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
        <Title level={2}>My Bookings</Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={loadBookings}
          loading={loading}
        >
          Refresh
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
              `${range[0]}-${range[1]} of ${total} bookings`,
          }}
          locale={{
            emptyText: (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No bookings found</p>
                <Button type="primary" onClick={() => navigate('/vehicles')}>
                  Book a Vehicle
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card variant="outlined">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {bookings.filter(b => b.status === 'HELD').length}
            </div>
            <div className="text-sm text-gray-500">Pending Payment</div>
          </div>
        </Card>
        <Card variant="outlined">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-500">Confirmed</div>
          </div>
        </Card>
        <Card variant="outlined">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {bookings.filter(b => b.status === 'CANCELLED' || b.status === 'EXPIRED').length}
            </div>
            <div className="text-sm text-gray-500">Cancelled/Expired</div>
          </div>
        </Card>
        <Card variant="outlined">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.length}
            </div>
            <div className="text-sm text-gray-500">Total Bookings</div>
          </div>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default BookingsPage;