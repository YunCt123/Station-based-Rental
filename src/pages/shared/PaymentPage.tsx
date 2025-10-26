import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Typography, Button, Steps, Spin, message, Divider, Tag } from "antd";
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined 
} from "@ant-design/icons";
import { bookingService } from "../../services/bookingService";
import type { Booking, Payment } from "../../services/bookingService";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// ✅ Helper function to calculate pricing correctly (calls API like BookingPage)
const calculatePricing = async (booking: Booking) => {
  // If backend already calculated pricing, use it
  if (booking.pricing_snapshot?.basePrice && booking.pricing_snapshot?.totalPrice) {
    return {
      hours: Math.ceil((new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / (1000 * 60 * 60)),
      rentalType: (new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / (1000 * 60 * 60) >= 24 ? 'daily' : 'hourly',
      basePrice: booking.pricing_snapshot.basePrice,
      taxes: booking.pricing_snapshot.taxes || booking.pricing_snapshot.basePrice * 0.1,
      insurance: booking.pricing_snapshot.insurancePrice || 0,
      totalPrice: booking.pricing_snapshot.totalPrice,
      deposit: booking.pricing_snapshot.deposit || booking.pricing_snapshot.totalPrice * 0.2
    };
  }

  // Fallback: call API to get accurate pricing (with weekend/peak multipliers)
  try {
    console.log('🔄 [PaymentPage] Recalculating pricing via API for booking:', booking._id);
    console.log('🔍 [PaymentPage] Booking insurance_option:', booking.insurance_option);
    
    // ✅ FIX: Extract boolean value from insurance_option
    let insurancePremium = false;
    if (booking.insurance_option) {
      if (typeof booking.insurance_option === 'boolean') {
        insurancePremium = booking.insurance_option;
      } else if (typeof booking.insurance_option === 'object' && 'premium' in booking.insurance_option) {
        insurancePremium = (booking.insurance_option as any).premium;
      }
    }
    
    console.log('🔧 [PaymentPage] Insurance extraction:', {
      'original booking.insurance_option': booking.insurance_option,
      'extracted insurancePremium': insurancePremium,
      'type': typeof booking.insurance_option
    });
    
    const priceRequest = {
      vehicleId: booking.vehicle_id,
      startAt: booking.start_at,
      endAt: booking.end_at,
      insurancePremium: insurancePremium
    };
    
    console.log('📤 [PaymentPage] Price request with insurance:', priceRequest);
    
    const apiPricing = await bookingService.calculatePrice(priceRequest);
    console.log('✅ [PaymentPage] API pricing result:', apiPricing);
    console.log('🔍 [PaymentPage] API insurance price:', apiPricing.insurancePrice);
    
    return {
      hours: Math.ceil((new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / (1000 * 60 * 60)),
      rentalType: (apiPricing.details?.hours || 0) >= 24 ? 'daily' : 'hourly',
      basePrice: apiPricing.basePrice || 0,
      taxes: apiPricing.taxes || 0,
      insurance: apiPricing.insurancePrice || 0, // ✅ FIX: Use API response directly, not booking.insurance_option
      totalPrice: apiPricing.totalPrice || 0,
      deposit: apiPricing.deposit || 0
    };
  } catch (error) {
    console.error('❌ [PaymentPage] API pricing failed, using fallback:', error);
    
    // Final fallback: simple calculation
    const start = new Date(booking.start_at);
    const end = new Date(booking.end_at);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    const hourlyRate = booking.pricing_snapshot?.hourly_rate || 20;
    const dailyRate = booking.pricing_snapshot?.daily_rate || 135;
    
    let basePrice = 0;
    let rentalType = '';
    
    if (hours >= 24 && dailyRate > 0) {
      rentalType = 'daily';
      const totalDays = Math.ceil(hours / 24);
      basePrice = dailyRate * totalDays;
    } else {
      rentalType = 'hourly';
      const totalHours = Math.ceil(hours);
      basePrice = hourlyRate * totalHours;
    }
    
    const taxes = basePrice * 0.1;
    const insurance = 0; // ✅ FIX: Let API be the source of truth, don't use booking.insurance_option
    const totalPrice = basePrice + taxes + insurance;
    const deposit = totalPrice * 0.2;
    
    return {
      hours: Math.ceil(hours),
      rentalType,
      basePrice: Number(basePrice.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      insurance: Number(insurance.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
      deposit: Number(deposit.toFixed(2))
    };
  }
};

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  // State
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [lastPaymentAttempt, setLastPaymentAttempt] = useState<number>(0);
  const [calculatedPricing, setCalculatedPricing] = useState<{
    hours: number;
    rentalType: string;
    basePrice: number;
    taxes: number;
    insurance: number;
    totalPrice: number;
    deposit: number;
  } | null>(null);

  // Load booking data function
  const loadBookingData = useCallback(async () => {
    if (!bookingId) {
      message.error('Booking ID is required');
      navigate('/vehicles');
      return;
    }

    try {
      setLoading(true);
      
      // Load booking details
      const bookingData = await bookingService.getBookingById(bookingId);
      setBooking(bookingData);
      console.log('Booking loaded:', bookingData);
      console.log('🔍 [PaymentPage] pricing_snapshot details:', bookingData.pricing_snapshot);
      console.log('🔍 [PaymentPage] vehicle_snapshot details:', bookingData.vehicle_snapshot);
      console.log('🔍 [PaymentPage] Full booking structure:', JSON.stringify(bookingData, null, 2));

      // Calculate accurate pricing with API
      try {
        const pricing = await calculatePricing(bookingData);
        setCalculatedPricing(pricing);
        console.log('✅ [PaymentPage] Calculated pricing:', pricing);
      } catch (pricingError) {
        console.error('❌ [PaymentPage] Pricing calculation failed:', pricingError);
        // Continue with booking data anyway
      }

      // Load existing payments
      const paymentsData = await bookingService.getBookingPayments(bookingId);
      setPayments(paymentsData);
      console.log('Payments loaded:', paymentsData);

    } catch (error) {
      console.error('Error loading payment data:', error);
      message.error('Failed to load booking information');
      navigate('/vehicles');
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  // Auto-refresh interval for checking booking status
  useEffect(() => {
    if (!booking?.hold_expires_at || booking.status !== 'HELD') {
      return;
    }

    const checkExpiration = () => {
      const now = new Date();
      const expiryTime = new Date(booking.hold_expires_at!);
      
      if (now >= expiryTime) {
        // Booking should be expired, refresh data
        console.log('Booking expired, refreshing data...');
        loadBookingData();
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkExpiration, 30000);
    
    // Check immediately
    checkExpiration();

    return () => clearInterval(interval);
  }, [booking?.hold_expires_at, booking?.status, loadBookingData]);

  // Load booking and payment data
  useEffect(() => {
    loadBookingData();
  }, [loadBookingData]);

  // Handle PayOS payment creation
  const handlePayOSPayment = async () => {
    if (!booking || !booking.pricing_snapshot) {
      message.error('Booking information is not available');
      return;
    }

    // Prevent multiple clicks
    if (creating) {
      message.warning('Payment is already being processed...');
      return;
    }

    // Prevent rapid successive payments (5 second cooldown)
    const now = Date.now();
    if (now - lastPaymentAttempt < 5000) {
      message.warning('Please wait before making another payment attempt...');
      return;
    }

    try {
      setCreating(true);
      setLastPaymentAttempt(now);
      
      // ✅ Use proper pricing calculation with API
      const pricing = await calculatePricing(booking);
      
      const paymentRequest = {
        bookingId: booking._id,
        amount: pricing.deposit,
        returnUrl: `${window.location.origin}/payment/success?bookingId=${booking._id}`,
        cancelUrl: `${window.location.origin}/payment/cancel?bookingId=${booking._id}`
      };

      console.log('=== PayOS DEPOSIT CALCULATION (FIXED LOGIC) ===');
      console.log('Hours:', pricing.hours);
      console.log('Rental type:', pricing.rentalType);
      console.log('Hourly rate:', booking.pricing_snapshot.hourly_rate);
      console.log('Daily rate:', booking.pricing_snapshot.daily_rate);
      console.log('Base price:', pricing.basePrice);
      console.log('Taxes (10%):', pricing.taxes);
      console.log('Total:', pricing.totalPrice);
      console.log('Final deposit amount:', pricing.deposit);
      console.log('Booking pricing_snapshot:', booking.pricing_snapshot);

      const paymentResponse = await bookingService.createPayOSPayment(paymentRequest);
      
      console.log('=== PAYOS PAYMENT RESPONSE ===');
      console.log('Full response:', paymentResponse);
      console.log('Payment URL:', paymentResponse.paymentUrl);
      console.log('Payment ID:', paymentResponse.paymentId);
      console.log('Provider Payment ID:', paymentResponse.providerPaymentId);
      console.log('Response type:', typeof paymentResponse);
      console.log('Response keys:', Object.keys(paymentResponse));
      
      if (!paymentResponse.paymentUrl) {
        console.error('❌ No payment URL in response!');
        console.error('Available response fields:', Object.keys(paymentResponse));
        
        // Try alternative field names that might be returned (debugging purpose)
        const responseRecord = paymentResponse as unknown as Record<string, unknown>;
        const possibleUrls = [
          responseRecord.paymentUrl,
          responseRecord.payment_url,
          responseRecord.checkoutUrl,
          responseRecord.checkout_url,
          responseRecord.url
        ].filter(Boolean).filter(url => typeof url === 'string');
        
        if (possibleUrls.length > 0) {
          console.log('🔄 Found alternative URL:', possibleUrls[0]);
          window.location.href = possibleUrls[0];
          return;
        }
        
        message.error('Payment URL not received from server. Please try again.');
        return;
      }
      
      message.success('Redirecting to PayOS payment...');
      
      // Redirect to PayOS payment URL
      console.log('🔄 Redirecting to:', paymentResponse.paymentUrl);
      window.location.href = paymentResponse.paymentUrl;
      
    } catch (error) {
      console.error('Payment creation error:', error);
      message.error('Failed to create payment. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Handle VNPAY payment (fallback)
  const handleVNPayPayment = async () => {
    if (!booking || !booking.pricing_snapshot) {
      message.error('Booking information is not available');
      return;
    }

    // Prevent multiple clicks
    if (creating) {
      message.warning('Payment is already being processed...');
      return;
    }

    // Prevent rapid successive payments (5 second cooldown)
    const now = Date.now();
    if (now - lastPaymentAttempt < 5000) {
      message.warning('Please wait before making another payment attempt...');
      return;
    }

    try {
      setCreating(true);
      setLastPaymentAttempt(now);
      
      // ✅ Use proper pricing calculation with API
      const pricing = await calculatePricing(booking);
      
      // TEMPORARY FIX: Send smaller amount for testing
      // VNPAY sandbox may have amount limits
      const testAmount = 100; // Test with 100 VND
      
      console.log('VNPay payment calculation:', {
        hours: pricing.hours,
        rentalType: pricing.rentalType,
        hourlyRate: booking.pricing_snapshot.hourly_rate,
        dailyRate: booking.pricing_snapshot.daily_rate,
        basePrice: pricing.basePrice,
        taxes: pricing.taxes,
        insurance: pricing.insurance,
        totalPrice: pricing.totalPrice,
        depositAmountUSD: pricing.deposit,
        testAmountVND: testAmount
      });
      
      const paymentRequest = {
        bookingId: booking._id,
        amount: testAmount, // Test with small VND amount
        currency: 'VND', // Tell backend to use VND for VNPAY
        returnUrl: `${window.location.origin}/payment/success?bookingId=${booking._id}`,
        cancelUrl: `${window.location.origin}/payment/cancel?bookingId=${booking._id}`,
        // Add unique identifier to prevent duplicate requests
        requestId: `${booking._id}_${Date.now()}_vnpay`
      };

      const paymentResponse = await bookingService.createDepositPayment(paymentRequest);
      
      console.log('=== VNPAY PAYMENT RESPONSE ===');
      console.log('Full response:', paymentResponse);
      console.log('Available fields:', Object.keys(paymentResponse));
      
      // VNPAY backend returns different field structure than PayOS
      const vnpayResponse = paymentResponse as unknown as Record<string, unknown>;
      const paymentUrl = vnpayResponse.paymentUrl || vnpayResponse.checkoutUrl;
      
      console.log('🔍 VNPAY URL Analysis:');
      console.log('PaymentUrl:', vnpayResponse.paymentUrl);
      console.log('CheckoutUrl:', vnpayResponse.checkoutUrl);
      console.log('Final URL to use:', paymentUrl);
      
      // Debug URL parameters if available
      if (paymentUrl && typeof paymentUrl === 'string') {
        try {
          const url = new URL(paymentUrl);
          console.log('🔍 VNPAY URL Parameters:');
          url.searchParams.forEach((value, key) => {
            console.log(`  ${key}: ${value}`);
          });
        } catch (err) {
          console.log('Could not parse URL:', err);
        }
      }
      
      if (!paymentUrl || typeof paymentUrl !== 'string') {
        console.error('❌ No VNPAY payment URL found in response!');
        message.error('Payment URL not received from server. Please try again.');
        return;
      }
      
      message.success('Redirecting to VNPAY payment...');
      
      // Redirect to VNPAY payment URL
      console.log('🔄 Redirecting to VNPAY:', paymentUrl);
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Payment creation error:', error);
      message.error('Failed to create payment. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Render payment status
  const renderPaymentStatus = () => {
    const successfulPayment = payments.find(p => p.status === 'SUCCESS' && p.type === 'DEPOSIT');
    const pendingPayment = payments.find(p => p.status === 'PENDING' && p.type === 'DEPOSIT');
    const failedPayment = payments.find(p => p.status === 'FAILED' && p.type === 'DEPOSIT');

    if (successfulPayment) {
      return (
        <Card className="mb-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <CheckCircleOutlined className="text-green-600 text-xl" />
            <div>
              <Text className="text-green-800 font-semibold">Payment Successful</Text>
              <br />
              <Text className="text-green-600 text-sm">
                Transaction ID: {successfulPayment.transaction_ref}
              </Text>
            </div>
          </div>
        </Card>
      );
    }

    if (pendingPayment) {
      return (
        <Card className="mb-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <ClockCircleOutlined className="text-yellow-600 text-xl" />
            <div>
              <Text className="text-yellow-800 font-semibold">Payment Pending</Text>
              <br />
              <Text className="text-yellow-600 text-sm">
                Waiting for payment confirmation...
              </Text>
            </div>
          </div>
        </Card>
      );
    }

    if (failedPayment) {
      return (
        <Card className="mb-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <ExclamationCircleOutlined className="text-red-600 text-xl" />
            <div>
              <Text className="text-red-800 font-semibold">Payment Failed</Text>
              <br />
              <Text className="text-red-600 text-sm">
                Please try again with a different payment method
              </Text>
            </div>
          </div>
        </Card>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
          <span className="ml-3">Loading payment information...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <div className="text-center p-8">
            <Title level={3}>Booking Not Found</Title>
            <Paragraph>The booking you're looking for could not be found.</Paragraph>
            <Button type="primary" onClick={() => navigate('/vehicles')}>
              Back to Vehicles
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Title level={2}>Payment</Title>
          <Button 
            onClick={loadBookingData}
            loading={loading}
            className="flex items-center gap-2"
          >
            🔄 Refresh
          </Button>
        </div>
        <Text type="secondary">
          Complete your booking • Booking ID: {booking._id}
        </Text>
        
        {/* Helpful message about payment errors */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Text className="text-sm text-blue-800">
            💡 <strong>Having payment issues?</strong> If you see duplicate error messages, please refresh the page and try again. 
            Avoid clicking payment buttons multiple times to prevent duplicate requests.
          </Text>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <Steps current={2} status="process">
          <Step 
            title="Vehicle Selection" 
            description="Choose your car"
            status="finish"
          />
          <Step 
            title="Booking Details" 
            description="Enter your information"
            status="finish"
          />
          <Step 
            title="Payment" 
            description="Complete your booking"
            status="process"
          />
        </Steps>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Section */}
        <div className="md:col-span-2">
          {/* Payment Status */}
          {renderPaymentStatus()}

          {/* Payment Methods */}
          {booking.status === 'HELD' && (
            <Card title="Choose Payment Method" className="mb-4">
              <div className="space-y-4">
                {/* PayOS Payment */}
                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <Text className="text-white font-bold text-xs">PayOS</Text>
                      </div>
                      <div>
                        <Text className="font-semibold">PayOS</Text>
                        <br />
                        <Text className="text-sm text-gray-500">
                          Secure payment via PayOS gateway
                        </Text>
                      </div>
                    </div>
                    <Button 
                      type="primary" 
                      loading={creating}
                      onClick={handlePayOSPayment}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>

                {/* VNPAY Payment */}
                <div className="p-4 border border-gray-200 rounded-lg hover:border-red-400 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center">
                        <Text className="text-white font-bold text-xs">VNPAY</Text>
                      </div>
                      <div>
                        <Text className="font-semibold">VNPAY</Text>
                        <br />
                        <Text className="text-sm text-gray-500">
                          Vietnam payment gateway (Sandbox)
                        </Text>
                      </div>
                    </div>
                    <Button 
                      loading={creating}
                      onClick={handleVNPayPayment}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <Divider />
              <div className="text-sm text-gray-600">
                <Text>🔒 Your payment is secured with 256-bit SSL encryption</Text>
                <br />
                <Text>💳 All major credit and debit cards accepted</Text>
                <br />
                <Text>⚡ Instant payment confirmation</Text>
              </div>
            </Card>
          )}

          {/* Booking Status Messages */}
          {booking.status === 'CONFIRMED' && (
            <Card className="border-green-200 bg-green-50">
              <div className="text-center p-4">
                <CheckCircleOutlined className="text-green-600 text-4xl mb-3" />
                <Title level={4} className="text-green-800">
                  Payment Successful!
                </Title>
                <Paragraph className="text-green-600">
                  Your booking has been confirmed. You can now proceed to vehicle pickup.
                </Paragraph>
                <Button type="primary" size="large" onClick={() => navigate('/dashboard/bookings')}>
                  View My Bookings
                </Button>
              </div>
            </Card>
          )}

          {booking.status === 'EXPIRED' && (
            <Card className="border-red-200 bg-red-50">
              <div className="text-center p-4">
                <ExclamationCircleOutlined className="text-red-600 text-4xl mb-3" />
                <Title level={4} className="text-red-800">
                  Booking Expired
                </Title>
                <Paragraph className="text-red-600">
                  This booking has expired. Please create a new booking.
                </Paragraph>
                <Button type="primary" size="large" onClick={() => navigate('/vehicles')}>
                  Book Again
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card title="Order Summary" className="sticky top-4">
            {/* Vehicle Info */}
            <div className="mb-4">
              {booking.vehicle_snapshot && (
                <>
                  <Text className="font-semibold">{booking.vehicle_snapshot.name}</Text>
                  <br />
                  <Text className="text-sm text-gray-500">
                    {booking.vehicle_snapshot.type} • {booking.vehicle_snapshot.licensePlate}
                  </Text>
                </>
              )}
            </div>

            <Divider />

            {/* Booking Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <Text className="text-sm">Pickup:</Text>
                <Text className="text-sm">
                  {new Date(booking.start_at).toLocaleDateString()}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-sm">Return:</Text>
                <Text className="text-sm">
                  {new Date(booking.end_at).toLocaleDateString()}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-sm">Status:</Text>
                <Tag color={
                  booking.status === 'HELD' ? 'orange' :
                  booking.status === 'CONFIRMED' ? 'green' :
                  booking.status === 'CANCELLED' ? 'red' : 'default'
                }>
                  {booking.status}
                </Tag>
              </div>
            </div>

            <Divider />

            {/* Pricing */}
            {booking.pricing_snapshot && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Daily Rate:</Text>
                  <Text>${booking.pricing_snapshot.daily_rate || 0}/day</Text>
                </div>
                {booking.pricing_snapshot.hourly_rate && (
                  <div className="flex justify-between">
                    <Text>Hourly Rate:</Text>
                    <Text>${booking.pricing_snapshot.hourly_rate}/hour</Text>
                  </div>
                )}
                
                <Divider className="my-2" />
                <Text strong>Booking Summary</Text>
                
                {(() => {
                  // ✅ Use calculated pricing from state or fallback
                  const pricing = calculatedPricing || {
                    hours: Math.ceil((new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / (1000 * 60 * 60)),
                    rentalType: 'unknown',
                    basePrice: booking.pricing_snapshot?.basePrice || 0,
                    taxes: booking.pricing_snapshot?.taxes || 0,
                    insurance: booking.pricing_snapshot?.insurancePrice || 0,
                    totalPrice: booking.pricing_snapshot?.totalPrice || 0,
                    deposit: booking.pricing_snapshot?.deposit || 0
                  };
                  
                  return (
                    <>
                      <div className="flex justify-between">
                        <Text>Base Price ({pricing.hours}h{pricing.rentalType === 'daily' ? ` = ${Math.ceil(pricing.hours/24)}d` : ''}):</Text>
                        <Text>${pricing.basePrice}</Text>
                      </div>
                      
                      <div className="flex justify-between">
                        <Text>Taxes (10%):</Text>
                        <Text>${pricing.taxes}</Text>
                      </div>
                      
                      {((pricing.insurance > 0) || booking.insurance_option) && (
                        <div className="flex justify-between">
                          <Text>Insurance:</Text>
                          <Text>${pricing.insurance}</Text>
                        </div>
                      )}
                      
                      <Divider className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <Text strong>Total:</Text>
                        <Text strong>${pricing.totalPrice}</Text>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <Text className="text-green-600">Required Deposit:</Text>
                        <Text strong className="text-green-600">${pricing.deposit}</Text>
                      </div>
                    </>
                  );
                })()}
                <div className="text-xs text-gray-500 mt-2">
                  * Remaining balance will be charged at pickup
                </div>
              </div>
            )}

            {/* Hold Timer */}
            {booking.status === 'HELD' && booking.hold_expires_at && (
              <>
                <Divider />
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <ClockCircleOutlined className="text-yellow-600 mr-2" />
                  <Text className="text-yellow-800 text-sm">
                    Booking expires at:{" "}
                    {new Date(booking.hold_expires_at).toLocaleString()}
                  </Text>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;