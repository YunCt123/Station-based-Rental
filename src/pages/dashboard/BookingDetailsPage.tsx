import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Spin, message } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { bookingService } from '../../services/bookingService';
import { convertToVND } from '../../lib/currency';
import type { Booking } from '../../services/bookingService';

const { Title } = Typography;

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // 💱 Helper function to convert VND back to USD for display
  const convertVndToUsd = (vndAmount: number): number => {
    if (!vndAmount) return 0;
    const testUsdAmount = 1;
    const vndEquivalent = convertToVND(testUsdAmount);
    const usdAmount = Math.round(vndAmount / vndEquivalent);
    return usdAmount;
  };

  // 💱 Helper function to format price for display
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
    if (!pricing) return {
      total: 0,
      base: 0,
      insurance: 0,
      taxes: 0,
      deposit: 0,
      days: 0,
      hours: 0
    };

    // If currency is VND, convert all amounts to USD
    if (pricing.currency === 'VND' || (pricing.total_price && pricing.total_price > 1000)) {
      return {
        total: convertVndToUsd(pricing.total_price || 0),
        base: convertVndToUsd(pricing.base_price || 0),
        insurance: convertVndToUsd(pricing.insurance_price || 0),
        taxes: convertVndToUsd(pricing.taxes || 0),
        deposit: convertVndToUsd(pricing.deposit || 0),
        days: pricing.details?.days || 0,
        hours: pricing.details?.hours || 0
      };
    }
    
    // Already in USD
    return {
      total: pricing.total_price || 0,
      base: pricing.base_price || 0,
      insurance: pricing.insurance_price || 0,
      taxes: pricing.taxes || 0,
      deposit: pricing.deposit || 0,
      days: pricing.details?.days || 0,
      hours: pricing.details?.hours || 0
    };
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

  // Function to open directions to station
  const openDirections = () => {
    if (!booking) {
      message.error('Booking information not available');
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
      const stationName = booking.station_snapshot?.name || 'EV Station';
      const stationAddress = booking.station_snapshot?.address || '';
      const searchQuery = `${stationName} ${stationAddress}`.trim();
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      window.open(searchUrl, '_blank');
      
      console.log('🔍 Using fallback search:', searchQuery);
      message.info('Using station name for directions. Coordinates not available.');
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
        message.error('Failed to load booking details');
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
          <Title level={3}>Booking Not Found</Title>
          <Button type="primary" onClick={() => navigate('/bookings')}>
            Return to Bookings
          </Button>
        </div>
      </div>
    );
  }

  const prices = formatPrice(booking.pricing_snapshot);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/bookings')}
          >
            Back to Bookings
          </Button>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <Title level={2} className="mb-2">Booking Details</Title>
              <p className="text-gray-500">Booking ID: <span className="font-mono text-sm">{booking._id}</span></p>
            </div>
            <Tag color={getStatusColor(booking.status)} className="text-lg px-4 py-2">
              {booking.status}
            </Tag>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Information */}
          <Card title="Vehicle Information" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{booking.vehicle_snapshot?.name || 'Unknown Vehicle'}</h4>
                <p className="text-gray-600">{booking.vehicle_snapshot?.type}</p>
                <p className="text-sm text-gray-500">License: {booking.vehicle_snapshot?.licensePlate}</p>
              </div>
            </div>
          </Card>

          {/* Station Information */}
          <Card title="Station Information" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{booking.station_snapshot?.name || 'Unknown Station'}</h4>
                    {booking.station_snapshot?.address && (
                      <p className="text-gray-600 text-sm mt-1">
                        {booking.station_snapshot.address}
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
                    Directions
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Time Information */}
          <Card title="Rental Period" className="shadow-sm">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Pickup Time</p>
                  <p className="font-semibold">{new Date(booking.start_at).toLocaleDateString()}</p>
                  <p className="text-gray-600 text-sm">{new Date(booking.start_at).toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Return Time</p>
                  <p className="font-semibold">{new Date(booking.end_at).toLocaleDateString()}</p>
                  <p className="text-gray-600 text-sm">{new Date(booking.end_at).toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
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
                        return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
                      } else if (days > 0) {
                        return `${days} day${days > 1 ? 's' : ''}`;
                      } else if (hours > 0) {
                        return `${hours} hour${hours > 1 ? 's' : ''}`;
                      } else {
                        return 'Less than 1 hour';
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing Information */}
          <Card title="Pricing Details" className="shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-semibold">${prices.base}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Insurance Fee:</span>
                <span className="font-semibold">${prices.insurance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes:</span>
                <span className="font-semibold">${prices.taxes}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-lg font-bold text-blue-600">${prices.total}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Required Deposit:</span>
                  <span className="text-orange-600 font-medium">${prices.deposit}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Booking Timeline */}
        <Card title="Booking Timeline" className="shadow-sm mt-6">
          <div className='mgt-4'>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{new Date(booking.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">{new Date(booking.updatedAt).toLocaleString()}</p>
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
              Proceed to Payment
            </Button>
          )}
          
          <Button 
            size="large"
            icon={<EnvironmentOutlined />}
            className="px-6"
            onClick={openDirections}
          >
            Get Directions
          </Button>
          
          <Button 
            size="large"
            className="px-6"
            onClick={() => navigate('/bookings')}
          >
            My Bookings
          </Button>
        </div>

        {/* Status Message */}
        {booking.status === 'HELD' && (
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-orange-500 mr-3 mt-1">⚠️</div>
                <div>
                  <h4 className="font-semibold text-orange-800">Payment Required</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    This booking is on hold and requires payment to be confirmed. 
                    Please proceed with payment to secure your vehicle.
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