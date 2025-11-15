import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  CreditCardIcon,
  CheckCircleIcon,
  PrinterIcon,
  UserIcon,
  TruckIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  BanknotesIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { bookingService } from '@/services/bookingService';

interface DepositRecord {
  _id: string;
  bookingId: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  vehicle_id: {
    _id: string;
    name: string;
    brand: string;
    model: string;
    licensePlate?: string;
    type?: string;
  };
  station_id: {
    _id: string;
    name: string;
    address: string;
  };
  status: 'HELD' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  
  pricing: {
    deposit: number;
    total_price: number;
    base_price: number;
    insurance_price?: number;
    taxes?: number;
    currency: string;
    hourly_rate?: number;
    daily_rate?: number;
    policy_version?: string;
  };
  
  payment: {
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    amount?: number;
    method?: string;
    transaction_ref?: string;
    deposit_required: boolean;
  };
  

  vehicle_snapshot?: {
    name: string;
    brand: string;
    model: string;
    type: string;
    seats: number;
    battery_kWh: number;
  };
  station_snapshot?: {
    name: string;
    address: string;
    city: string;
  };
  
  start_at: string;
  end_at: string;
  createdAt: string;
  updatedAt?: string;
  
  depositStatus: 'pending' | 'collected' | 'refunded' | 'partial-refund';
  paidAmount: number;
  refundedAmount: number;
  remainingDeposit: number;
}interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

type ActionType = 'collect' | 'refund';

const DepositPayment: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRecord | null>(null);


  const [bookings, setBookings] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [actionType, setActionType] = useState<ActionType>('collect');
  const [amount, setAmount] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState<string>('0');
  const [deductionReason, setDeductionReason] = useState<string>('');
  const [note, setNote] = useState('');


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('� [DepositPayment] Starting API call...');
        console.log('�📡 Calling API via bookingService.getAllBookings()');
        

        const apiResponse = await bookingService.getAllBookings({
          limit: 100 
        });
        
        console.log('📡 [DepositPayment] Full API Response:', apiResponse);
        

        const bookingsArray = Array.isArray(apiResponse) ? apiResponse : (apiResponse?.data || []);
        console.log('📦 [DepositPayment] Extracted bookings array:', bookingsArray.length, 'items');
        console.log('📦 [DepositPayment] First booking sample:', bookingsArray[0]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedBookings: DepositRecord[] = bookingsArray.map((booking: any) => {
          console.log('🔍 Processing booking:', booking._id, booking);

          // ✅ Get pricing data - BE returns "pricing_snapshot" + "financial_summary"
          const depositAmount = booking.financial_summary?.deposit_amount || booking.pricing_snapshot?.deposit || 0;
          const totalPrice = booking.financial_summary?.total_amount || booking.pricing_snapshot?.total_price || 0;

          // ✅ Enhanced data extraction Dematching BE response structure  
          const transformed: DepositRecord = {
            _id: booking._id || '',
            bookingId: booking._id || '',
            user_id: {
              _id: booking.user_id?._id || '',
              name: booking.user_id?.name || `Khách hàng ${booking._id?.slice(-4) || ''}`,
              email: booking.user_id?.email || '',
              phoneNumber: booking.user_id?.phoneNumber || ''
            },
            vehicle_id: {
              _id: booking.vehicle_id?._id || '',
              name: booking.vehicle_id?.name || 'Unknown Vehicle',
              brand: booking.vehicle_id?.brand || '',
              model: booking.vehicle_id?.model || '',
              licensePlate: booking.vehicle_id?.licensePlate || '',
              type: booking.vehicle_id?.type || ''
            },
            station_id: {
              _id: booking.station_id?._id || '',
              name: booking.station_id?.name || 'Unknown Station', 
              address: booking.station_id?.address || ''
            },
            status: booking.status || 'HELD',
            
            pricing: {
              deposit: depositAmount,
              total_price: totalPrice,
              base_price: booking.pricing_snapshot?.base_price || booking.financial_summary?.base_rental_fee || 0,
              insurance_price: booking.pricing_snapshot?.insurance_price || booking.financial_summary?.insurance_fee || 0,
              taxes: booking.pricing_snapshot?.taxes || booking.financial_summary?.tax_amount || 0,
              currency: booking.pricing_snapshot?.currency || booking.financial_summary?.currency || 'VND',
              hourly_rate: booking.pricing_snapshot?.hourly_rate,
              daily_rate: booking.pricing_snapshot?.daily_rate,
              policy_version: booking.pricing_snapshot?.policy_version
            },
            
            payment: {
              deposit_required: booking.payment?.deposit_required ?? true,
              status: booking.payment?.status || 'PENDING',
              amount: booking.payment?.amount,
              method: booking.payment?.method,
              transaction_ref: booking.payment?.transaction_ref || booking.payment?.deposit_payment_id
            },
            
            // ✅ Use snapshots if available
            vehicle_snapshot: booking.vehicle_snapshot,
            station_snapshot: booking.station_snapshot,
            start_at: booking.start_at || '',
            end_at: booking.end_at || '',
            createdAt: booking.createdAt || '',
            updatedAt: booking.updatedAt,
            
            // ✅ Computed fields based on financial_summary + payment status
            depositStatus: booking.payment?.status === 'SUCCESS' ? 'collected' : 'pending',
            paidAmount: booking.financial_summary?.deposit_paid || 0,
            refundedAmount: 0,
            remainingDeposit: booking.financial_summary?.deposit_remaining || depositAmount
          };

          return transformed;
        });
        
        setBookings(transformedBookings);
        setLoading(false);
        console.log('✅ Successfully loaded', transformedBookings.length, 'deposit records from bookingService');
        
      } catch (err) {
        console.error('❌ API Error via bookingService:', err);
        setError(`Lỗi API: ${err instanceof Error ? err.message : 'Unknown error'}`);
        
        console.log('🔄 Falling back to mock data...');
        // Use mock data as fallback
        const mockApiResponse = {
          success: true,
          data: [
            {
              _id: 'BK2024001',
              user_id: {
                _id: 'user1',
                name: 'Nguyễn Văn A',
                email: 'customer1@example.com',
                phoneNumber: '0901234567'
              },
              vehicle_id: {
                _id: 'vehicle1',
                name: 'VinFast VF 8 Eco',
                brand: 'VinFast',
                model: 'VF 8 Eco',
                licensePlate: '30A-12345'
              },
              station_id: {
                _id: 'station1',
                name: 'EV Station - Nguyen Hue',
                address: '123 Nguyen Hue Street'
              },
              status: 'CONFIRMED' as const,
              
              // ✅ FIX: Use 'pricing' directly 
              pricing: {
                deposit: 200000,
                total_price: 500000,
                base_price: 300000,
                insurance_price: 50000,
                taxes: 50000,
                currency: 'VND'
              },
              
              payment: {
                deposit_required: true,
                status: 'SUCCESS' as const
              },
              start_at: '2025-11-15T09:00:00.000Z',
              end_at: '2025-11-15T17:00:00.000Z',
              createdAt: '2025-11-15T08:00:00.000Z'
            },
            {
              _id: 'BK2024002',
              user_id: {
                _id: 'user2',
                name: 'Trần Thị B',
                email: 'customer2@example.com', 
                phoneNumber: '0912345678'
              },
              vehicle_id: {
                _id: 'vehicle2',
                name: 'Tesla Model 3',
                brand: 'Tesla',
                model: 'Model 3',
                licensePlate: '51B-67890'
              },
              station_id: {
                _id: 'station2',
                name: 'EV Station - District 1',
                address: '456 Le Loi Street'
              },
              status: 'HELD' as const,
              
              // ✅ FIX: Use 'pricing' directly
              pricing: {
                deposit: 150000,
                total_price: 400000,
                base_price: 250000,
                insurance_price: 75000,
                taxes: 75000,
                currency: 'VND'
              },
              
              payment: {
                deposit_required: true,
                status: 'PENDING' as const
              },
              start_at: '2025-11-16T10:00:00.000Z',
              end_at: '2025-11-16T18:00:00.000Z',
              createdAt: '2025-11-16T09:00:00.000Z'
            }
          ]
        };

        const fallbackBookings: DepositRecord[] = mockApiResponse.data.map((booking) => {
          let depositStatus: DepositRecord['depositStatus'] = 'pending';

          // ✅ FIX: Use pricing instead of financial_summary
          const { pricing, payment } = booking;
          const depositAmount = pricing.deposit;
          const isPaid = payment.status === 'SUCCESS';
          const paid = isPaid ? depositAmount : 0;
          const remaining = isPaid ? 0 : depositAmount;

          if (remaining === 0 && paid > 0) {
            depositStatus = 'collected';
          } else if ((booking.status as string) === 'CANCELLED') {
            depositStatus = 'refunded';
          } else if (paid > 0 && remaining > 0) {
            depositStatus = 'partial-refund';
          }

          return {
            ...booking,
            bookingId: booking._id,
            depositStatus,
            paidAmount: paid,
            refundedAmount: (booking.status as string) === 'CANCELLED' ? paid : 0,
            remainingDeposit: remaining
          } as DepositRecord;
        });
        
        setBookings(fallbackBookings);
        setLoading(false);
        console.log('✅ Loaded fallback data:', fallbackBookings.length, 'deposit records');
      }
    };

    fetchBookings();
  }, []);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Tiền mặt',
      icon: <BanknotesIcon className="w-6 h-6" />,
      description: 'Thu/Trả bằng tiền mặt'
    },
    {
      id: 'card',
      name: 'Thẻ ngân hàng',
      icon: <CreditCardIcon className="w-6 h-6" />,
      description: 'Chuyển khoản ngân hàng'
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: <QrCodeIcon className="w-6 h-6" />,
      description: 'Quét mã QR'
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      icon: <DevicePhoneMobileIcon className="w-6 h-6" />,
      description: 'Ví điện tử MoMo'
    }
  ];

  const filteredDeposits = bookings.filter(deposit =>
    deposit.bookingId?.toLowerCase?.().includes(searchQuery.toLowerCase()) ||
    deposit.user_id?.name?.toLowerCase?.().includes(searchQuery.toLowerCase()) ||
    deposit.vehicle_id?._id?.toLowerCase?.().includes(searchQuery.toLowerCase()) ||
    (deposit.user_id?.phoneNumber ?? '').includes(searchQuery)
  );
  
  // ✅ DEBUG: Log filter results
  console.log('🔍 [DepositPayment] Current state:', {
    totalBookings: bookings.length,
    filteredCount: filteredDeposits.length,
    searchQuery,
    loading,
    error,
    firstBooking: bookings[0]
  });

  const handleSelectDeposit = (deposit: DepositRecord) => {
    setSelectedDeposit(deposit);

    // Set default action based on status
    if (deposit.depositStatus === 'pending') {
      setActionType('collect');
      setAmount(String(deposit.pricing?.deposit ?? 0));
    } else if (deposit.depositStatus === 'collected') {
      setActionType('refund');
      setAmount(String(deposit.remainingDeposit ?? 0));
    }
  };

  const handleOpenModal = (type: ActionType) => {
    if (!selectedDeposit) return;

    setActionType(type);
    if (type === 'collect') {
      const target =
        (selectedDeposit.pricing?.deposit ?? 0) -
        (selectedDeposit.paidAmount ?? 0);
      setAmount(String(Math.max(0, target)));
    } else {
      setAmount(String(selectedDeposit.remainingDeposit ?? 0));
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!selectedDeposit || !selectedPaymentMethod || !amount) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const numAmount = parseFloat(amount);
    const deduction = parseFloat(deductionAmount);

    if (Number.isNaN(numAmount) || numAmount <= 0) {
      alert('Số tiền không hợp lệ');
      return;
    }

    if (actionType === 'refund' && !Number.isNaN(deduction) && deduction > numAmount) {
      alert('Số tiền khấu trừ không được lớn hơn số tiền hoàn trả');
      return;
    }

    // TODO: Gọi API thu/hoàn cọc tại đây
    setShowModal(false);
    setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSelectedDeposit(null);
    setSelectedPaymentMethod('');
    setAmount('');
    setDeductionAmount('0');
    setDeductionReason('');
    setNote('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'collected':
        return 'bg-blue-100 text-blue-800';
      case 'refunded':
        return 'bg-green-100 text-green-800';
      case 'partial-refund':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ thu cọc';
      case 'collected':
        return 'Đã thu cọc';
      case 'refunded':
        return 'Đã hoàn cọc';
      case 'partial-refund':
        return 'Hoàn một phần';
      default:
        return status;
    }
  };

  const calculateRefundAmount = () => {
    const baseAmount = parseFloat(amount) || 0;
    const deduction = parseFloat(deductionAmount) || 0;
    return Math.max(0, baseAmount - deduction);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đặt Cọc</h1>
            <p className="text-gray-600 mt-1">Quản lý thu tiền đặt cọc cho khách hàng</p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã booking, tên khách hàng, biển số xe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposit Records List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Danh sách đặt cọc ({filteredDeposits.length})
            </h2>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Data Display */}
            {!loading && !error && (
              <div className="space-y-3">
                {filteredDeposits.length === 0 ? (
                  <div className="text-center py-12">
                    <ShieldCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {bookings.length === 0 
                        ? 'Không có dữ liệu đặt cọc' 
                        : 'Không tìm thấy giao dịch đặt cọc phù hợp với tìm kiếm'}
                    </p>
                    {/* Show first booking data for debugging */}
                    {bookings.length > 0 && (
                      <details className="text-left mt-4 text-xs">
                        <summary>Debug: First booking</summary>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(bookings[0], null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ) : (
                  filteredDeposits.map((deposit) => (
                    <div
                      key={deposit._id}
                      onClick={() => handleSelectDeposit(deposit)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedDeposit?._id === deposit._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              Mã booking: {deposit.bookingId}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                deposit.depositStatus
                              )}`}
                            >
                              {getStatusText(deposit.depositStatus)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <UserIcon className="w-4 h-4" />
                              <span>{deposit.user_id?.name || 'Unknown User'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <TruckIcon className="w-4 h-4" />
                              <span>{deposit.vehicle_id?.name || 'Unknown Vehicle'}</span>
                            </div>
                          </div>

                          {/* ✅ NEW: Station and rental period info */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium">{deposit.station_id?.name || 'Unknown Station'}</div>
                                <div className="text-xs text-gray-500">{deposit.station_id?.address || 'Unknown Location'}</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-3.5 h-3.5" />
                                <div>
                                  <div className="text-gray-500">Ngày bắt đầu:</div>
                                  <div className="font-medium">
                                    {new Date(deposit.start_at).toLocaleDateString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit', 
                                      year: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-gray-400">
                                    {new Date(deposit.start_at).toLocaleTimeString('vi-VN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-3.5 h-3.5" />
                                <div>
                                  <div className="text-gray-500">Ngày kết thúc:</div>
                                  <div className="font-medium">
                                    {new Date(deposit.end_at).toLocaleDateString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-gray-400">
                                    {new Date(deposit.end_at).toLocaleTimeString('vi-VN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-xs text-gray-500 mb-1">Tiền cọc</div>
                          <div className="text-xl font-bold text-blue-600">
                            {((deposit.pricing?.deposit ?? 0) / 1000).toFixed(3)}đ
                          </div>
                          {deposit.remainingDeposit > 0 &&
                            deposit.depositStatus !== 'pending' && (
                              <div className="text-xs text-gray-600 mt-1">
                                Còn lại:{' '}
                                {(deposit.remainingDeposit / 1000).toFixed(3)}đ
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao Tác</h2>

            {!selectedDeposit ? (
              <div className="text-center py-8">
                <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Chọn một giao dịch để thực hiện</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Khách hàng:</span>
                      <span className="font-medium">{selectedDeposit.user_id?.name || 'N/A'}</span>
                    </div>
                     <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedDeposit.user_id?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SĐT:</span>
                      <span className="font-medium">{selectedDeposit.user_id?.phoneNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Xe:</span>
                      <span className="font-medium">{selectedDeposit.vehicle_id?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biển số:</span>
                      <span className="font-medium">{selectedDeposit.vehicle_id?.licensePlate || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* ✅ NEW: Station and rental period info */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    Trạm & Lịch trình
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-gray-600 text-xs mb-1">Trạm lấy xe:</div>
                      <div className="font-medium">{selectedDeposit.station_id?.name || 'N/A'}</div>
                      <div className="text-gray-500 text-xs">{selectedDeposit.station_id?.address || 'Chưa có địa chỉ'}</div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-green-200">
                      <div>
                        <div className="text-gray-600 text-xs mb-1 flex items-center gap-1">
                          <CalendarDaysIcon className="w-3 h-3" />
                          Thời gian lấy xe:
                        </div>
                        <div className="font-medium">
                          {new Date(selectedDeposit.start_at).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-blue-600 font-medium">
                          {new Date(selectedDeposit.start_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-gray-600 text-xs mb-1 flex items-center gap-1">
                          <CalendarDaysIcon className="w-3 h-3" />
                          Thời gian trả xe:
                        </div>
                        <div className="font-medium">
                          {new Date(selectedDeposit.end_at).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-red-600 font-medium">
                          {new Date(selectedDeposit.end_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-green-200">
                      <div className="text-gray-600 text-xs">Thời gian thuê:</div>
                      <div className="font-medium text-purple-600">
                        {Math.round((new Date(selectedDeposit.end_at).getTime() - new Date(selectedDeposit.start_at).getTime()) / (1000 * 60 * 60 * 24))} ngày
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deposit Details */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Chi tiết tiền cọc</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền cọc:</span>
                      <span className="font-bold text-blue-600">
                        {((selectedDeposit.pricing?.deposit ?? 0) / 1000).toFixed(3)}đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã thu:</span>
                      <span className="font-medium text-green-600">
                         {((selectedDeposit.pricing?.deposit ?? 0) / 1000).toFixed(3)}đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã hoàn:</span>
                      <span className="font-medium text-orange-600">
                        {((selectedDeposit.refundedAmount ?? 0) / 1000).toFixed(3)}đ
                      </span>
                    </div>
                    <div className="border-t border-blue-300 pt-1 mt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-medium">Còn lại:</span>
                        <span className="font-bold text-gray-900">
                          {(selectedDeposit.remainingDeposit / 1000).toFixed(3)}đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {selectedDeposit.depositStatus === 'pending' && (
                    <button
                      onClick={() => handleOpenModal('collect')}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CurrencyDollarIcon className="w-5 h-5" />
                      Thu Tiền Cọc
                    </button>
                  )}

                  {(selectedDeposit.depositStatus === 'collected' ||
                    selectedDeposit.depositStatus === 'partial-refund') &&
                    selectedDeposit.remainingDeposit > 0 && (
                      <button
                        onClick={() => handleOpenModal('refund')}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                        Hoàn Tiền Cọc
                      </button>
                    )}

                  {selectedDeposit.depositStatus === 'refunded' && (
                    <div className="text-center py-4 text-green-600">
                      <CheckCircleIcon className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-medium">Đã hoàn cọc đầy đủ</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {actionType === 'collect' ? 'Thu Tiền Cọc' : 'Hoàn Tiền Cọc'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Summary */}
              <div
                className={`${
                  actionType === 'collect' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                } border rounded-lg p-4 mb-6`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Mã booking:</span>
                  <span className="font-semibold">{selectedDeposit.bookingId}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Khách hàng:</span>
                  <span className="font-semibold">{selectedDeposit.user_id?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tiền cọc:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {((selectedDeposit.pricing?.deposit ?? 0) / 1000).toFixed(3)}đ
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền {actionType === 'collect' ? 'thu' : 'hoàn'} (VND)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="1"
                />
              </div>

              {/* Deduction (only for refund) */}
              {actionType === 'refund' && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Khấu trừ (nếu có)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Số tiền khấu trừ (VND)</label>
                      <input
                        type="number"
                        value={deductionAmount}
                        onChange={(e) => setDeductionAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Lý do khấu trừ</label>
                      <textarea
                        value={deductionReason}
                        onChange={(e) => setDeductionReason(e.target.value)}
                        placeholder="VD: Trầy xước xe, mất thiết bị..."
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div className="border-t border-amber-300 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Số tiền thực hoàn:</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(calculateRefundAmount())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`${
                            selectedPaymentMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                          }`}
                        >
                          {method.icon}
                        </div>
                        <span className="font-medium text-gray-900">{method.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">{method.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedPaymentMethod || !amount}
                  className={`flex-1 px-6 py-3 ${
                    actionType === 'collect' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Xác Nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {actionType === 'collect' ? 'Thu Cọc Thành Công!' : 'Hoàn Cọc Thành Công!'}
            </h3>
            <p className="text-gray-600 mb-6">
              Giao dịch đã được xử lý thành công. Bạn có thể in biên lai hoặc đóng cửa sổ này.
            </p>
            <div className="space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã giao dịch:</span>
                <span className="font-medium">DP{Date.now()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-medium">
                  {formatCurrency(actionType === 'refund' ? calculateRefundAmount() : parseFloat(amount || '0'))}
                </span>
              </div>
              {actionType === 'refund' && parseFloat(deductionAmount) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Khấu trừ:</span>
                  <span className="font-medium">
                    -{formatCurrency(parseFloat(deductionAmount))}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // TODO: Logic in biên lai
                  window.print();
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <PrinterIcon className="w-5 h-5" />
                In Biên Lai
              </button>
              <button
                onClick={handleCloseSuccessModal}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <XMarkIcon className="w-5 h-5" />
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositPayment;