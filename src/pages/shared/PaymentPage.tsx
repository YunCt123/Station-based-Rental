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
import payosLogo from "../../assets/payos-logo.jpg";
import vnpayLogo from "../../assets/vnpay-logo.png";

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      message.error('Yêu cầu mã đặt chỗ');
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
      message.error('Không thể tải thông tin đặt chỗ');
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
  // const handlePayOSPayment = async () => {
  //   if (!booking || !booking.pricing_snapshot) {
  //     message.error('Thông tin đặt chỗ không có sẵn');
  //     return;
  //   }

  //   // Prevent multiple clicks
  //   if (creating) {
  //     message.warning('Thanh toán đang được xử lý...');
  //     return;
  //   }

  //   // Prevent rapid successive payments (5 second cooldown)
  //   const now = Date.now();
  //   if (now - lastPaymentAttempt < 5000) {
  //     message.warning('Vui lòng đợi trước khi thực hiện thanh toán khác...');
  //     return;
  //   }

  //   try {
  //     setCreating(true);
  //     setLastPaymentAttempt(now);
      
  //     // ✅ Use proper pricing calculation with API
  //     const pricing = await calculatePricing(booking);
      
  //     const paymentRequest = {
  //       bookingId: booking._id,
  //       amount: pricing.deposit,
  //       returnUrl: `${window.location.origin}/payment/success?bookingId=${booking._id}`,
  //       cancelUrl: `${window.location.origin}/payment/cancel?bookingId=${booking._id}`
  //     };

  //     console.log('=== PayOS DEPOSIT CALCULATION (FIXED LOGIC) ===');
  //     console.log('Hours:', pricing.hours);
  //     console.log('Rental type:', pricing.rentalType);
  //     console.log('Hourly rate:', booking.pricing_snapshot.hourly_rate);
  //     console.log('Daily rate:', booking.pricing_snapshot.daily_rate);
  //     console.log('Base price:', pricing.basePrice);
  //     console.log('Taxes (10%):', pricing.taxes);
  //     console.log('Total:', pricing.totalPrice);
  //     console.log('Final deposit amount:', pricing.deposit);
  //     console.log('Booking pricing_snapshot:', booking.pricing_snapshot);

  //     const paymentResponse = await bookingService.createPayOSPayment(paymentRequest);
      
  //     console.log('=== PAYOS PAYMENT RESPONSE ===');
  //     console.log('Full response:', paymentResponse);
  //     console.log('Payment URL:', paymentResponse.paymentUrl);
  //     console.log('Payment ID:', paymentResponse.paymentId);
  //     console.log('Provider Payment ID:', paymentResponse.providerPaymentId);
  //     console.log('Response type:', typeof paymentResponse);
  //     console.log('Response keys:', Object.keys(paymentResponse));
      
  //     if (!paymentResponse.paymentUrl) {
  //       console.error('❌ No payment URL in response!');
  //       console.error('Available response fields:', Object.keys(paymentResponse));
        
  //       // Try alternative field names that might be returned (debugging purpose)
  //       const responseRecord = paymentResponse as unknown as Record<string, unknown>;
  //       const possibleUrls = [
  //         responseRecord.paymentUrl,
  //         responseRecord.payment_url,
  //         responseRecord.checkoutUrl,
  //         responseRecord.checkout_url,
  //         responseRecord.url
  //       ].filter(Boolean).filter(url => typeof url === 'string');
        
  //       if (possibleUrls.length > 0) {
  //         console.log('🔄 Found alternative URL:', possibleUrls[0]);
  //         window.location.href = possibleUrls[0];
  //         return;
  //       }
        
  //       message.error('URL thanh toán không nhận được từ máy chủ. Vui lòng thử lại.');
  //       return;
  //     }
      
  //     message.success('Đang chuyển hướng đến thanh toán PayOS...');
      
  //     // Redirect to PayOS payment URL
  //     console.log('🔄 Redirecting to:', paymentResponse.paymentUrl);
  //     window.location.href = paymentResponse.paymentUrl;
      
  //   } catch (error) {
  //     console.error('Payment creation error:', error);
  //     message.error('Không thể tạo thanh toán. Vui lòng thử lại.');
  //   } finally {
  //     setCreating(false);
  //   }
  // };

  // Handle VNPAY payment (fallback)
  const handleVNPayPayment = async () => {
    if (!booking || !booking.pricing_snapshot) {
      message.error('Thông tin đặt chỗ không có sẵn');
      return;
    }

    // Prevent multiple clicks
    if (creating) {
      message.warning('Thanh toán đang được xử lý...');
      return;
    }

    // Prevent rapid successive payments (5 second cooldown)
    const now = Date.now();
    if (now - lastPaymentAttempt < 5000) {
      message.warning('Vui lòng đợi trước khi thực hiện thanh toán khác...');
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
        depositAmountVND: pricing.deposit,
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
        message.error('URL thanh toán không nhận được từ máy chủ. Vui lòng thử lại.');
        return;
      }
      
      message.success('Đang chuyển hướng đến thanh toán VNPAY...');
      
      // Redirect to VNPAY payment URL
      console.log('🔄 Redirecting to VNPAY:', paymentUrl);
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Payment creation error:', error);
      message.error('Không thể tạo thanh toán. Vui lòng thử lại.');
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
              <Text className="text-green-800 font-semibold">Thanh toán thành công</Text>
              <br />
              <Text className="text-green-600 text-sm">
                Mã giao dịch: {successfulPayment.transaction_ref}
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
              <Text className="text-yellow-800 font-semibold">Đang xử lý giao dịch ...</Text>
              <br />
              <Text className="text-yellow-600 text-sm">
                Đang chờ xác nhận thanh toán...
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
              <Text className="text-red-800 font-semibold">Thanh toán thất bại</Text>
              <br />
              <Text className="text-red-600 text-sm">
                Vui lòng thử lại với phương thức thanh toán khác
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
          <span className="ml-3">Đang tải thông tin thanh toán...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <div className="text-center p-8">
            <Title level={3}>Không tìm thấy đặt chỗ</Title>
            <Paragraph>Đặt chỗ mà bạn đang tìm kiếm không thể được tìm thấy.</Paragraph>
            <Button type="primary" onClick={() => navigate('/vehicles')}>
              Quay lại chọn xe
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
          <Title level={2}>Thanh toán</Title>
          <Button 
            onClick={loadBookingData}
            loading={loading}
            className="flex items-center gap-2"
          >
            Tải lại
          </Button>
        </div>
        <Text type="secondary">
          Hoàn thành đặt chỗ của bạn • Mã đặt chỗ: {booking._id}
        </Text>
        
        {/* Helpful message about payment errors */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Text className="text-sm text-blue-800">
            <strong>Gặp sự cố với thanh toán?</strong> Nếu bạn thấy thông báo lỗi trùng lặp, vui lòng tải lại trang và thử lại.
            Tránh nhấp vào các nút thanh toán nhiều lần để ngăn chặn các yêu cầu trùng lặp.
          </Text>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <Steps current={2} status="process">
          <Step 
            title="Chọn xe" 
            description="Chọn xe của bạn"
            status="finish"
          />
          <Step 
            title="Chi tiết đặt chỗ" 
            description="Nhập thông tin của bạn"
            status="finish"
          />
          <Step 
            title="Thanh toán" 
            description="Hoàn thành đặt chỗ"
            status="process"
          />
        </Steps>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Section (narrower on lg to give more space to summary) */}
        <div className="lg:col-span-1">
          {/* Payment Status */}
          {renderPaymentStatus()}

          {/* Payment Methods */}
          {booking.status === 'HELD' && (
            <Card title="Chọn phương thức thanh toán" className="mb-4">
              <div className="space-y-4">
                {/* PayOS Payment */}
                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 flex items-center justify-center">
                        <img src={payosLogo} alt="PayOS" className="w-16 h-10 object-contain" />
                      </div>
                      <div>
                        <Text className="font-semibold">PayOS</Text>
                        <br />
                        <Text className="text-sm text-gray-500">
                          Thanh toán bảo mật qua cổng PayOS
                        </Text>
                      </div>
                    </div>
                    <Button 
                      type="primary" 
                      disabled
                      className="bg-gray-400 cursor-not-allowed"
                    >
                      Chưa khả dụng
                    </Button>
                  </div>
                </div>

                {/* VNPAY Payment */}
                <div className="p-4 border border-gray-200 rounded-lg hover:border-red-400 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 flex items-center justify-center">
                        <img src={vnpayLogo} alt="VNPAY" className="w-16 h-10 object-contain" />
                      </div>
                      <div>
                        <Text className="font-semibold">VNPAY</Text>
                        <br />
                        <Text className="text-sm text-gray-500">
                          Cổng thanh toán Việt Nam (Sandbox)
                        </Text>
                      </div>
                    </div>
                    <Button 
                      loading={creating}
                      onClick={handleVNPayPayment}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Thanh toán ngay
                    </Button>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <Divider />
              <div className="text-sm text-gray-600">
                <Text>- Thanh toán của bạn được bảo mật với mã hóa SSL 256-bit</Text>
                <br /> 
                <Text>- Chấp nhận tất cả các thẻ tín dụng và ghi nợ chính</Text>
                <br />
                <Text>-  Xác nhận thanh toán tức thì</Text>
              </div>
            </Card>
          )}

          {/* Booking Status Messages */}
          {booking.status === 'CONFIRMED' && (
            <Card className="border-green-200 bg-green-50">
              <div className="text-center p-4">
                <CheckCircleOutlined className="text-green-600 text-4xl mb-3" />
                <Title level={4} className="text-green-800">
                  Thanh toán thành công!
                </Title>
                <Paragraph className="text-green-600">
                  Đặt chỗ của bạn đã được xác nhận. Bạn có thể tiến hành đến nhận xe.
                </Paragraph>
                <Button type="primary" size="large" onClick={() => navigate('/dashboard/bookings')}>
                  Xem đặt chỗ của tôi
                </Button>
              </div>
            </Card>
          )}

          {booking.status === 'EXPIRED' && (
            <Card className="border-red-200 bg-red-50">
              <div className="text-center p-4">
                <ExclamationCircleOutlined className="text-red-600 text-4xl mb-3" />
                <Title level={4} className="text-red-800">
                  Đặt chỗ đã hết hạn
                </Title>
                <Paragraph className="text-red-600">
                  Đặt chỗ này đã hết hạn. Vui lòng tạo đặt chỗ mới.
                </Paragraph>
                <Button type="primary" size="large" onClick={() => navigate('/vehicles')}>
                  Đặt lại
                </Button>
              </div>
            </Card>
          )}
        </div>

  {/* Order Summary (wider on lg) */}
  <div className="md:col-span-1 lg:col-span-1">
          <Card title="Tóm tắt đơn hàng" className="sticky top-4">
            {/* Vehicle Info */}
            <div className="mb-4">
              {booking.vehicle_snapshot && (
                <>
                  <Text className="font-semibold"> Tên Xe: {booking.vehicle_snapshot.name}</Text>
                  <br />
                  <Text className="text-sm text-gray-500 underline">
                    Loại xe: {booking.vehicle_snapshot.type} <br/>
                    Thương hiệu: {booking.vehicle_snapshot.brand}
                  </Text>
                </>
              )}
            </div>

            <Divider />

            {/* Booking Details */}
            <div className="space-y-2 mb-4">
               <div className="flex justify-between">
                <Text className="text-sm">Hình thức thuê:</Text>
                <Text className="text-sm">
                  {booking.pricing_snapshot?.details?.rentalType === 'daily' ? 'Theo ngày' : 'Theo giờ'}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-sm">Nhận xe:</Text>
                <Text className="text-sm">
                  {new Date(booking.start_at).toLocaleDateString('vi-VN')}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-sm">Trả xe:</Text>
                <Text className="text-sm">
                  {new Date(booking.end_at).toLocaleDateString('vi-VN')}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-sm">Trạng thái:</Text>
                <Tag color={
                  booking.status === 'HELD' ? 'orange' :
                  booking.status === 'CONFIRMED' ? 'green' :
                  booking.status === 'CANCELLED' ? 'red' : 'default'
                }>
                  {booking.status === 'HELD' ? 'Đang giữ chỗ' :
                   booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
                   booking.status === 'CANCELLED' ? 'Đã hủy' : booking.status}
                </Tag>
              </div>
            </div>

            <Divider />

            {/* Pricing */}
            {booking.pricing_snapshot && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Giá theo ngày:</Text>
                  <Text>{(() => {
                    // Display VND directly
                    const dailyRate = booking.pricing_snapshot.daily_rate || 0;
                    return new Intl.NumberFormat('vi-VN').format(dailyRate) + 'đ';
                  })()}/ngày</Text>
                </div>
                {booking.pricing_snapshot.hourly_rate && (
                  <div className="flex justify-between">
                    <Text>Giá theo giờ:</Text>
                    <Text>{(() => {
                      // Display VND directly
                      const hourlyRate = booking.pricing_snapshot.hourly_rate;
                      return new Intl.NumberFormat('vi-VN').format(hourlyRate) + 'đ';
                    })()}/giờ</Text>
                  </div>
                )}
                
                <Divider className="my-2" />
                <Text strong>Tóm tắt đặt chỗ</Text>
                
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
                  
                  const rentalTypeText = pricing.rentalType === 'daily' ? 'theo ngày' : 'theo giờ';
                  
                  return (
                    <>
                      <div className="flex justify-between">
                        <Text>Giá cơ bản ({pricing.hours}h{pricing.rentalType === 'daily' ? ` = ${Math.ceil(pricing.hours/24)}d` : ''}) - {rentalTypeText}:</Text>
                        <Text>{pricing.basePrice.toLocaleString('vi-VN')}đ</Text>
                      </div>
                      
                      <div className="flex justify-between">
                        <Text>Thuế (10%):</Text>
                        <Text>{pricing.taxes.toLocaleString('vi-VN')}đ</Text>
                      </div>
                      
                      {((pricing.insurance > 0) || booking.insurance_option) && (
                        <div className="flex justify-between">
                          <Text>Bảo hiểm:</Text>
                          <Text>{pricing.insurance.toLocaleString('vi-VN')}đ</Text>
                        </div>
                      )}
                      
                      <Divider className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <Text strong>Tổng cộng:</Text>
                        <Text strong>{pricing.totalPrice.toLocaleString('vi-VN')}đ</Text>
                      </div>
                     
                      <div className="flex justify-between text-green-600 bg-green-100 p-2 rounded">
                        <Text className="text-green-600">Tiền cọc yêu cầu:</Text>
                        <Text strong className="text-green-600">{pricing.deposit.toLocaleString('vi-VN')}đ</Text>
                      </div>
                       <div className="flex justify-between text-green-600 bg-yellow-100 p-2 rounded">
                        <Text className="text-green-600">Tiền còn lại phải thanh toán (Dự kiến):</Text>
                        <Text strong className="text-green-600">{(pricing.totalPrice - pricing.deposit).toLocaleString('vi-VN')}đ</Text>
                      </div>
                    </>
                  );
                })()}
                <div className="text-xs text-gray-500 mt-2">
                  * Số tiền còn lại sẽ được tính phí khi trả xe ( Các khoản phí bổ sung có thể áp dụng)
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
                    Đặt chỗ hết hạn lúc:{" "}
                    {new Date(booking.hold_expires_at).toLocaleString('vi-VN')}
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