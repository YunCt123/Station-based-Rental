import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Descriptions, Tag, Button, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
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

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const bookingData = await bookingService.getBookingById(id);
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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/bookings')}
          >
            Back to Bookings
          </Button>
        </div>

        <Card className="mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <Title level={2}>Booking Details</Title>
            <Tag color={getStatusColor(booking.status)}>
              {booking.status}
            </Tag>
          </div>

          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Booking ID">
              {booking._id}
            </Descriptions.Item>

            <Descriptions.Item label="Vehicle">
              <div>
                <div>{booking.vehicle_snapshot?.name || 'Unknown Vehicle'}</div>
                <div className="text-gray-500">
                  {booking.vehicle_snapshot?.type} • {booking.vehicle_snapshot?.licensePlate}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Pickup Station">
              {booking.station_snapshot?.name || 'Unknown Station'}
            </Descriptions.Item>

            <Descriptions.Item label="Return Station">
              {booking.station_snapshot?.name || 'Unknown Station'}
            </Descriptions.Item>

            <Descriptions.Item label="Pickup Time">
              <div>
                <div>{new Date(booking.start_at).toLocaleDateString()}</div>
                <div className="text-gray-500">{new Date(booking.start_at).toLocaleTimeString()}</div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Return Time">
              <div>
                <div>{new Date(booking.end_at).toLocaleDateString()}</div>
                <div className="text-gray-500">{new Date(booking.end_at).toLocaleTimeString()}</div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Rental Duration">
              <div>
                {prices.days > 0 && (
                  <span>{prices.days} days</span>
                )}
                {prices.hours > 0 && (
                  <span>{prices.hours && prices.days ? ` ${prices.hours} hours` : `${prices.hours} hours`}</span>
                )}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Base Price">
              ${prices.base}
            </Descriptions.Item>

            <Descriptions.Item label="Insurance Fee">
              ${prices.insurance}
            </Descriptions.Item>

            <Descriptions.Item label="Taxes">
              ${prices.taxes}
            </Descriptions.Item>

            <Descriptions.Item label="Total Amount">
              ${prices.total}
            </Descriptions.Item>

            <Descriptions.Item label="Required Deposit">
              ${prices.deposit}
            </Descriptions.Item>

            <Descriptions.Item label="Created At">
              {new Date(booking.createdAt).toLocaleString()}
            </Descriptions.Item>

            <Descriptions.Item label="Last Updated">
              {new Date(booking.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>

          {booking.status === 'HELD' && (
            <div className="mt-6 flex justify-end">
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate(`/payment?bookingId=${booking._id}`)}
              >
                Proceed to Payment
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BookingDetailsPage;