import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Typography, Button, Result, Spin } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { bookingService } from "../../services/bookingService";
import type { Booking } from "../../services/bookingService";

const { Title, Paragraph } = Typography;

const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const bookingData = await bookingService.getBookingById(bookingId);
        setBooking(bookingData);
      } catch (error) {
        console.error('Error loading booking:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handleRetryPayment = () => {
    if (bookingId) {
      navigate(`/payment?bookingId=${bookingId}`);
    } else {
      navigate('/vehicles');
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingId) return;

    try {
      await bookingService.cancelBooking(bookingId, 'Payment cancelled by user');
      navigate('/vehicles');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      navigate('/vehicles');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <div className="text-center p-8">
            <Spin size="large" />
            <Title level={4} className="mt-4">Loading...</Title>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <Result
          status="error"
          icon={<CloseCircleOutlined className="text-red-600" />}
          title={
            <Title level={3} className="text-red-800">
              Payment Cancelled
            </Title>
          }
          subTitle="Your payment was cancelled. No charges have been made to your account."
          extra={[
            <Button type="primary" size="large" key="retry" onClick={handleRetryPayment}>
              Try Payment Again
            </Button>,
            <Button key="cancel" danger onClick={handleCancelBooking}>
              Cancel Booking
            </Button>,
            <Button key="vehicles" onClick={() => navigate('/vehicles')}>
              Browse Vehicles
            </Button>,
          ]}
        >
          <div className="text-center">
            {booking && (
              <Paragraph className="text-gray-600">
                <strong>Booking ID:</strong> {booking._id}
                <br />
                <strong>Vehicle:</strong> {booking.vehicle_snapshot?.name || 'Unknown Vehicle'}
                <br />
                <strong>Status:</strong> {booking.status}
                <br />
                <br />
                Your booking is still held and will expire at:{" "}
                {booking.hold_expires_at 
                  ? new Date(booking.hold_expires_at).toLocaleString()
                  : 'Unknown'
                }
              </Paragraph>
            )}

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <Title level={5} className="text-yellow-800">What happens next?</Title>
              <div className="text-left text-yellow-700">
                <p>• Your booking is still held for a limited time</p>
                <p>• You can retry payment before it expires</p>
                <p>• No charges have been made to your account</p>
                <p>• You can cancel the booking if you no longer need it</p>
              </div>
            </div>
          </div>
        </Result>
      </Card>
    </div>
  );
};

export default PaymentCancelPage;