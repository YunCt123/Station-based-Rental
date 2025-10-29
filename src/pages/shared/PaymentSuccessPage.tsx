import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Typography, Button, Result, Spin, message } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { bookingService } from "../../services/bookingService";

const { Title, Paragraph } = Typography;

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const paymentId = searchParams.get('paymentId');

  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!bookingId) {
        message.error('Booking ID is required');
        navigate('/vehicles');
        return;
      }

      try {
        setLoading(true);

        // Wait a bit to allow webhook processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check payment status if paymentId is provided
        if (paymentId) {
          try {
            const paymentStatus = await bookingService.checkPaymentStatus(paymentId);
            console.log('Payment status:', paymentStatus);
            
            if (paymentStatus.status === 'SUCCESS') {
              // Try to confirm the booking
              await bookingService.confirmBooking(bookingId);
              setConfirmed(true);
              message.success('Payment confirmed and booking completed!');
            } else {
              message.warning('Payment is still being processed. Please wait...');
            }
          } catch (error) {
            console.error('Payment confirmation error:', error);
            // Continue anyway, the webhook might handle it
          }
        }

        // Get updated booking status
        const booking = await bookingService.getBookingById(bookingId);
        if (booking.status === 'CONFIRMED') {
          setConfirmed(true);
        }

      } catch (error) {
        console.error('Error confirming payment:', error);
        message.error('Failed to confirm payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [bookingId, paymentId, navigate]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <div className="text-center p-8">
            <Spin size="large" />
            <Title level={4} className="mt-4">Confirming Payment...</Title>
            <Paragraph>
              Please wait while we confirm your payment and update your booking.
            </Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <Result
          status="success"
          icon={<CheckCircleOutlined className="text-green-600" />}
          title={
            <Title level={3} className="text-green-800">
              Payment Successful!
            </Title>
          }
          subTitle={
            confirmed 
              ? "Your booking has been confirmed and is ready for pickup."
              : "Payment received. Your booking confirmation is being processed."
          }
          extra={[
            <Button type="primary" size="large" key="bookings" onClick={() => navigate('/dashboard/bookings')}>
              View My Bookings
            </Button>,
            <Button key="vehicles" onClick={() => navigate('/vehicles')}>
              Book Another Vehicle
            </Button>,
          ]}
        >
          <div className="text-center">
            <Paragraph className="text-gray-600">
              {bookingId && (
                <>
                  <strong>Booking ID:</strong> {bookingId}
                  <br />
                </>
              )}
              {paymentId && (
                <>
                  <strong>Payment ID:</strong> {paymentId}
                  <br />
                </>
              )}
              <br />
              A confirmation email will be sent to your registered email address.
            </Paragraph>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <Title level={5} className="text-blue-800">Next Steps:</Title>
              <div className="text-left text-blue-700">
                <p>1. Check your email for booking confirmation</p>
                <p>2. Prepare required documents for pickup</p>
                <p>3. Arrive at the station on your booking date</p>
                <p>4. Complete vehicle inspection before driving</p>
              </div>
            </div>
          </div>
        </Result>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;