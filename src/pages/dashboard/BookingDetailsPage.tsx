import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Spin, message } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { bookingService } from '../../services/bookingService';
import type { Booking } from '../../services/bookingService';

const { Title } = Typography;

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Format VND currency
  const formatVND = (amount: number): string => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Helper function to get pricing values directly from BE (VND)
  const getPricing = (pricing?: { 
    total_price?: number;
    base_price?: number;
    taxes?: number;
    insurance_price?: number;
    deposit?: number;
    details?: {
      days?: number;
      hours?: number;
      rentalType?: string;
      peakMultiplier?: number;
      weekendMultiplier?: number;
    }
  }) => {
    if (!pricing) return {
      total: 0,
      base: 0,
      insurance: 0,
      taxes: 0,
      deposit: 0,
      days: 0,
      hours: 0,
      rentalType: 'unknown',
      peakMultiplier: 1,
      weekendMultiplier: 1
    };

    return {
      total: pricing.total_price || 0,
      base: pricing.base_price || 0,
      insurance: pricing.insurance_price || 0,
      taxes: pricing.taxes || 0,
      deposit: pricing.deposit || 0,
      days: pricing.details?.days || 0,
      hours: pricing.details?.hours || 0,
      rentalType: pricing.details?.rentalType || 'unknown',
      peakMultiplier: pricing.details?.peakMultiplier || 1,
      weekendMultiplier: pricing.details?.weekendMultiplier || 1
    };
  };

  // Function to get rental type display info
  const getRentalTypeInfo = (rentalType: string) => {
    switch (rentalType) {
      case 'daily':
        return {
          text: 'Thuê theo ngày',
          color: 'blue' as const
        };
      case 'hourly':
        return {
          text: 'Thuê theo giờ',
          color: 'green' as const
        };
      default:
        return {
          text: 'Không xác định',
          color: 'default' as const
        };
    }
  };

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'HELD':
        return 'Đang giữ chỗ';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'EXPIRED':
        return 'Đã hết hạn';
      default:
        return status;
    }
  };

  // Function to open directions to station
  const openDirections = () => {
    if (!booking) {
      message.error('Thông tin booking không có sẵn');
      return;
    }

    // Try to get coordinates from station object
    let coordinates = null;
    
    console.log('🔍 Full booking object:', booking);
    console.log('🔍 Station ID:', booking.station_id);
    
    // From the image, coordinates should be in station_id.geo.coordinates
    if (booking.station_id && typeof booking.station_id === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const station = booking.station_id as any;
      if (station.geo?.coordinates && Array.isArray(station.geo.coordinates)) {
        coordinates = station.geo.coordinates;
        console.log('✅ Found coordinates in station_id.geo.coordinates:', coordinates);
      } else if (station.coordinates && Array.isArray(station.coordinates)) {
        coordinates = station.coordinates;
        console.log('✅ Found coordinates in station_id.coordinates:', coordinates);
      }
    }
    
    if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
      const [lng, lat] = coordinates;
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(directionsUrl, '_blank');
      console.log('🗺️ Opening directions with coordinates:', { lat, lng });
    } else {
      // Fallback: search by station name and address
      const stationName = booking.station_snapshot?.name || 'Trạm EV';
      const stationAddress = booking.station_snapshot?.address || '';
      const searchQuery = `${stationName} ${stationAddress}`.trim();
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      window.open(searchUrl, '_blank');
      
      console.log('🔍 Using fallback search:', searchQuery);
      message.info('Sử dụng tên trạm để chỉ đường. Không có tọa độ chính xác.');
    }
  };

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const bookingData = await bookingService.getBookingById(id);
        console.log('📊 Booking data received:', bookingData);
        console.log('🏢 Station snapshot:', bookingData.station_snapshot);
        console.log('🏢 Station ID object:', bookingData.station_id);
        setBooking(bookingData);
      } catch (error) {
        console.error('Error loading booking details:', error);
        message.error('Không thể tải thông tin booking');
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          <Title level={3}>Không tìm thấy Booking</Title>
          <Button type="primary" onClick={() => navigate('/bookings')}>
            Về trang Booking
          </Button>
        </div>
      </div>
    );
  }

  const prices = getPricing(booking.pricing_snapshot);
  const rentalTypeInfo = getRentalTypeInfo(prices.rentalType);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/bookings')}
          >
            Về trang Booking
          </Button>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <Title level={2} className="mb-2">Chi tiết Booking</Title>
              <p className="text-gray-500">Mã Booking: <span className="font-mono text-sm">{booking._id}</span></p>
            </div>
            <Tag color={getStatusColor(booking.status)} className="text-lg px-4 py-2">
              {getStatusText(booking.status)}
            </Tag>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Information */}
          <Card title="Thông tin xe" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">Tên xe: {booking.vehicle_snapshot?.name || 'Xe không xác định'}</h4>
                <p className="text-gray-600">Loại xe: {booking.vehicle_snapshot?.type || 'Không xác định'}</p>
              </div>
            </div>
          </Card>

          {/* Station Information */}
          <Card title="Thông tin trạm" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{booking.station_snapshot?.name || 'Trạm không xác định'}</h4>
                    {booking.station_snapshot?.address && (
                      <p className="text-gray-600 text-sm mt-1">
                        {booking.station_snapshot?.address}
                      </p>
                    )}
                  </div>
                  <Button 
                    size="small" 
                    icon={<EnvironmentOutlined />}
                    onClick={openDirections}
                    type="primary"
                    ghost
                  >
                    Chỉ đường
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Time Information */}
          <Card title="Thời gian thuê" className="shadow-sm">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Thời gian nhận xe</p>
                  <p className="font-semibold">{new Date(booking.start_at).toLocaleDateString('vi-VN')}</p>
                  <p className="text-gray-600 text-sm">{new Date(booking.start_at).toLocaleTimeString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thời gian trả xe</p>
                  <p className="font-semibold">{new Date(booking.end_at).toLocaleDateString('vi-VN')}</p>
                  <p className="text-gray-600 text-sm">{new Date(booking.end_at).toLocaleTimeString('vi-VN')}</p>
                </div>
                {/* <div>
                  <p className="text-sm text-gray-500">Thời gian thuê</p>
                  <p className="font-semibold">
                    {(() => {
                      // Tính toán duration từ start_at và end_at
                      const startTime = new Date(booking.start_at);
                      const endTime = new Date(booking.end_at);
                      const diffMs = endTime.getTime() - startTime.getTime();
                      
                      // Chuyển đổi milliseconds thành ngày và giờ
                      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const days = Math.floor(totalHours / 24);
                      const hours = totalHours % 24;
                      
                      console.log('🕐 Duration calculation:', { 
                        startTime: startTime.toISOString(), 
                        endTime: endTime.toISOString(),
                        diffMs,
                        totalHours,
                        days,
                        hours
                      });
                      
                      if (days > 0 && hours > 0) {
                        return `${days} ngày ${hours} giờ`;
                      } else if (days > 0) {
                        return `${days} ngày`;
                      } else if (hours > 0) {
                        return `${hours} giờ`;
                      } else {
                        return 'Dưới 1 giờ';
                      }
                    })()}
                  </p>
                </div> */}
              </div>
            </div>
          </Card>

          {/* Pricing Information */}
          <Card title="Chi tiết giá" className="shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hình thức thuê:</span>
                <div className="flex items-center">
                  <Tag color={rentalTypeInfo.color} className="px-3 py-1">
                    <span className="mr-1">{rentalTypeInfo.icon}</span>
                    {rentalTypeInfo.text}
                  </Tag>
                </div>
              </div>
              {/* Display duration based on rental type */}
              {prices.rentalType === 'daily' && prices.days > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Số ngày thuê:</span>
                  <span className="font-semibold text-blue-600">{prices.days} ngày</span>
                </div>
              )}
              {prices.rentalType === 'hourly' && prices.hours > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Số giờ thuê:</span>
                  <span className="font-semibold text-green-600">{prices.hours} giờ</span>
                </div>
              )}
              
              {/* Peak and Weekend Multipliers */}
              {(prices.peakMultiplier > 1 || prices.weekendMultiplier > 1) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">Phụ phí áp dụng:</h4>
                  {prices.peakMultiplier > 1 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-yellow-600 mr-2">⚡</span>
                        <span className="text-sm text-yellow-700">Giờ cao điểm:</span>
                      </div>
                      <span className="text-sm font-semibold text-yellow-800">x{prices.peakMultiplier}</span>
                    </div>
                  )}
                  {prices.weekendMultiplier > 1 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-yellow-600 mr-2">🎉</span>
                        <span className="text-sm text-yellow-700">Cuối tuần:</span>
                      </div>
                      <span className="text-sm font-semibold text-yellow-800">x{prices.weekendMultiplier}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Giá cơ bản:</span>
                <span className="font-semibold">{formatVND(prices.base)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí bảo hiểm:</span>
                <span className="font-semibold">{formatVND(prices.insurance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thuế:</span>
                <span className="font-semibold">{formatVND(prices.taxes)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Tổng tiền:</span>
                  <span className="text-lg font-bold text-blue-600">{formatVND(prices.total)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Tiền cọc yêu cầu:</span>
                  <span className="text-orange-600 font-medium">{formatVND(prices.deposit)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-700 font-medium">Số tiền còn lại phải trả (dự kiến):</span>
                  <span className="text-green-600 font-semibold">{formatVND(prices.total - prices.deposit)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Booking Timeline */}
        <Card title="Lịch sử Booking" className="shadow-sm mt-6">
          <div className='mgt-4'>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Thời gian tạo</p>
              <p className="font-medium">{new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
              <p className="font-medium">{new Date(booking.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          {booking.status === 'HELD' && (
            <Button 
              type="primary" 
              size="large"
              className="px-8"
              onClick={() => navigate(`/payment?bookingId=${booking._id}`)}
            >
              Tiến hành thanh toán
            </Button>
          )}
          
          <Button 
            size="large"
            icon={<EnvironmentOutlined />}
            className="px-6"
            onClick={openDirections}
          >
            Xem đường đi
          </Button>
          
          <Button 
            size="large"
            className="px-6"
            onClick={() => navigate('/bookings')}
          >
            Booking của tôi
          </Button>
        </div>

        {/* Status Message */}
        {booking.status === 'HELD' && (
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-orange-500 mr-3 mt-1">⚠️</div>
                <div>
                  <h4 className="font-semibold text-orange-800">Cần thanh toán</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Booking này đang được giữ chỗ và cần thanh toán để được xác nhận. 
                    Vui lòng tiến hành thanh toán để đảm bảo xe của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingDetailsPage;