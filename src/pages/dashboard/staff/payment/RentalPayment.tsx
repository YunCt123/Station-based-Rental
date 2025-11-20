import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { Modal } from '../../../../components/Modal';
import { rentalService } from '@/services/rentalService';
import { QrCodeIcon, RefreshCwIcon } from 'lucide-react';

interface RentalRecord {
  id: string;
  bookingId: string;
  vehicleId: string;
  vehicleName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'overdue';
  rentalDays: number;
  dailyRate: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  deposit: number;
  additionalCharges?: {
    name: string;
    amount: number;
  }[];
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  disabled?: boolean;
}

const RentalPayment: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRental, setSelectedRental] = useState<RentalRecord | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_transactionRef, setTransactionRef] = useState<string>('');
const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Tiền mặt',
      icon: <BanknotesIcon className="w-6 h-6" />,
      description: 'Thanh toán bằng tiền mặt tại quầy'
    },
    {
      id: 'card',
      name: 'Thẻ ngân hàng',
      icon: <CreditCardIcon className="w-6 h-6" />,
      description: 'Thanh toán bằng thẻ ATM/Credit',
      disabled: true
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: <QrCodeIcon className="w-6 h-6" />,
      description: 'Quét mã QR để thanh toán',
      disabled: true
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      icon: <DevicePhoneMobileIcon className="w-6 h-6" />,
      description: 'Thanh toán qua ví MoMo',
      disabled: true
    }
  ];
  const fetchPendingReturns = async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await rentalService.getPendingReturns({
        search: search || undefined,
        limit: 20,
        page: 1
      });
      if (response.success && response.data) {
        const mappedRentals: RentalRecord[] = response.data.map((rental) => {
          const booking = rental.booking_id;
          const pricing = booking.pricing_snapshot;
          const details = pricing.details || { days: 1, rentalType: 'daily' as const };
          const depositPaid = pricing.deposit || 0;
          let totalCharges = rental.charges.total;
          
          const additionalCharges: { name: string; amount: number }[] = [];

          if (rental.charges.cleaning_fee > 0) additionalCharges.push({ name: 'Phí vệ sinh', amount: rental.charges.cleaning_fee });
          if (rental.charges.damage_fee > 0) additionalCharges.push({ name: 'Phí hư hỏng', amount: rental.charges.damage_fee });
          if (rental.charges.late_fee > 0) additionalCharges.push({ name: 'Phí trễ', amount: rental.charges.late_fee });
          if (rental.charges.other_fees > 0) additionalCharges.push({ name: 'Phí khác', amount: rental.charges.other_fees });

          if (pricing.insurance_price && pricing.insurance_price > 0) {
            additionalCharges.push({ name: 'Bảo hiểm', amount: pricing.insurance_price });
            totalCharges += pricing.insurance_price;
          }
          if (pricing.taxes && pricing.taxes > 0) {
            additionalCharges.push({ name: 'Thuế', amount: pricing.taxes });
            totalCharges += pricing.taxes;
          }

          const remaining = totalCharges - depositPaid;

          return {
            id: rental._id,
            bookingId: `BK${booking._id.slice(-6)}`,
            vehicleId: rental.vehicle_id.licensePlate || `EV-${rental.vehicle_id.id?.slice(-4) || 'UNKNOWN'}`,
            vehicleName: `${rental.vehicle_id.brand} ${rental.vehicle_id.model}`,
            customerId: rental.user_id?.id || 'Unknown',
            customerName: rental.user_id?.name || 'Khách hàng chưa xác định',
            customerPhone: rental.user_id?.phoneNumber || 'N/A',
            startDate: new Date(booking.start_at).toLocaleDateString('vi-VN'),
            endDate: new Date(booking.end_at).toLocaleDateString('vi-VN'),
            status: 'active' as const,
            rentalDays: details.days || 1,
            dailyRate: pricing.daily_rate || pricing.hourly_rate || 0,
            totalAmount: totalCharges,
            paidAmount: depositPaid,
            remainingAmount: remaining,
            deposit: depositPaid,
            additionalCharges: additionalCharges.length > 0 ? additionalCharges : undefined
          };
        });
        setRentals(mappedRentals);
      } else {
        setError('Không thể tải danh sách đơn thuê');
      }
    } catch (err) {
      console.error('Failed to fetch pending returns:', err);
      setError('Lỗi khi tải dữ liệu: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReturns(searchQuery);
  }, [searchQuery]);

  const filteredRentals = rentals.filter(rental =>
    rental.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rental.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rental.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rental.customerPhone.includes(searchQuery)
  );

  const handleSelectRental = (rental: RentalRecord) => {
    setSelectedRental(rental);
    setPaymentAmount(rental.remainingAmount.toString());
    setSelectedPaymentMethod('');
    setPaymentNote('');
  };

  const handlePayment = async () => {
    if (!selectedRental || !selectedPaymentMethod || !paymentAmount) {
      alert('Vui lòng điền đầy đủ thông tin thanh toán');
      return;
    }

    // Only allow cash
    if (selectedPaymentMethod !== 'cash') {
      alert('Hiện tại chỉ hỗ trợ thanh toán bằng tiền mặt. Vui lòng chọn phương thức Tiền mặt.');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedRental.remainingAmount) {
      alert('Số tiền thanh toán không hợp lệ');
      return;
    }

    try {
      // Call cash payment API
      const response = await rentalService.paymentCash(selectedRental.id, {
        amount,
        note: paymentNote || undefined
      });
      if (response.success) {
        setTransactionRef(response.data?.payment?.transaction_ref);
        setShowPaymentModal(false);
        setShowSuccessModal(true);
        await fetchPendingReturns(searchQuery);
        setSelectedRental(null);
        setSelectedPaymentMethod('');
        setPaymentAmount('');
        setPaymentNote('');
      } else {
        alert('Thanh toán thất bại: ' + (response.data?.message || 'Lỗi không xác định'));
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Thanh toán thất bại: ' + (err as Error).message);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setTransactionRef('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang thuê';
      case 'completed':
        return 'Hoàn tất';
      case 'overdue':
        return 'Quá hạn';
      default:
        return status;
    }
  };

  const handleRefresh = () => {
    fetchPendingReturns(searchQuery);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thanh Toán Phí Thuê Xe</h1>
            <p className="text-gray-600 mt-1">Quản lý và xử lý thanh toán cho các đơn thuê xe</p>
          </div>
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã booking, tên khách hàng, biển số xe hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rental Records List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách đơn thuê cần thanh toán ({filteredRentals.length})
              </h2>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <RefreshCwIcon className="w-4 h-4" />
                Làm mới
              </button>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-red-700">
                  <ExclamationCircleIcon className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Đang tải danh sách...</p>
                </div>
              ) : filteredRentals.length === 0 ? (
                <div className="text-center py-12">
                  <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Không tìm thấy đơn thuê xe nào</p>
                </div>
              ) : (
                filteredRentals.map((rental) => (
                  <div
                    key={rental.id}
                    onClick={() => handleSelectRental(rental)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedRental?.id === rental.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {rental.bookingId}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(rental.status)}`}>
                            {getStatusText(rental.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <UserIcon className="w-4 h-4" />
                            <span>{rental.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <TruckIcon className="w-4 h-4" />
                            <span>{rental.vehicleId} - {rental.vehicleName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{rental.rentalDays} ngày</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <ClockIcon className="w-4 h-4" />
                            <span>{rental.startDate} → {rental.endDate}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-xs text-gray-500 mb-1">Còn lại</div>
                        <div className="text-2xl font-bold text-red-600">
                          {rental.remainingAmount.toLocaleString("vi-VN")}đ
                        </div>
                        {rental.paidAmount > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            Đã trả: {rental.paidAmount.toLocaleString("vi-VN")}đ
                          </div>
                        )}
                      </div>
                    </div>

                    {rental.additionalCharges && rental.additionalCharges.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          <span>Có phí phụ thu</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Payment Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Chi Tiết Thanh Toán</h2>
            
            {!selectedRental ? (
              <div className="text-center py-8">
                <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  Chọn một đơn thuê để xem chi tiết thanh toán
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin khách hàng</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tên:</span>
                      <span className="font-medium">{selectedRental.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SĐT:</span>
                      <span className="font-medium">{selectedRental.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã booking:</span>
                      <span className="font-medium">{selectedRental.bookingId}</span>
                    </div>
                  </div>
                </div>

                {/* Rental Details */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Chi tiết thuê xe</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Xe:</span>
                      <span className="font-medium">{selectedRental.vehicleName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số ngày:</span>
                      <span className="font-medium">{selectedRental.rentalDays} ngày</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá/ngày:</span>
                      <span className="font-medium">{selectedRental.dailyRate.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Chi phí</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Phí thuê xe:</span>
                      <span>{(selectedRental.dailyRate * selectedRental.rentalDays).toLocaleString("vi-VN")}đ</span>
                    </div>
                    
                    {selectedRental.additionalCharges?.map((charge, index) => (
                      <div key={index} className="flex justify-between text-amber-600">
                        <span>{charge.name}:</span>
                        <span>+{charge.amount.toLocaleString("vi-VN")}đ</span>
                      </div>
                    ))}
                    
                    <div className="flex justify-between text-gray-600">
                      <span>Đã thanh toán:</span>
                      <span className="text-green-600">-{selectedRental.paidAmount.toLocaleString("vi-VN")}đ</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Còn phải trả:</span>
                        <span className="text-red-600">{selectedRental.remainingAmount.toLocaleString("vi-VN")}đ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCardIcon className="w-5 h-5" />
                  Xử Lý Thanh Toán
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedRental && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Xử Lý Thanh Toán"
          subtitle={`${selectedRental.customerName} • ${selectedRental.bookingId}`}
          size="lg"
        >
          {/* Rental Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Mã booking:</span>
              <span className="font-semibold">{selectedRental.bookingId}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Khách hàng:</span>
              <span className="font-semibold">{selectedRental.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Số tiền cần thanh toán:</span>
              <span className="text-2xl font-bold text-red-600">{selectedRental.remainingAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền thanh toán (đ)
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Nhập số tiền"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max={selectedRental.remainingAmount}
              step="0.01"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setPaymentAmount((selectedRental.remainingAmount / 2).toLocaleString("vi-VN"))}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                50%
              </button>
              <button
                onClick={() => setPaymentAmount(selectedRental.remainingAmount.toLocaleString("vi-VN"))}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Toàn bộ
              </button>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Phương thức thanh toán
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => !method.disabled && setSelectedPaymentMethod(method.id)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    method.disabled
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
                      : selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50 cursor-pointer'
                      : 'border-gray-200 hover:border-blue-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`${method.disabled ? 'text-gray-400' : selectedPaymentMethod === method.id ? 'text-blue-600' : 'text-gray-600'}`}>
                      {method.icon}
                    </div>
                    <span className={`font-medium ${method.disabled ? 'text-gray-500' : 'text-gray-900'}`}>{method.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{method.description}</p>
                  {method.disabled && <p className="text-xs text-red-500 mt-1">Tạm thời không khả dụng</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Nhập ghi chú về giao dịch..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handlePayment}
              disabled={!selectedPaymentMethod || selectedPaymentMethod !== 'cash' || !paymentAmount}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Xác Nhận Thanh Toán
            </button>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="Thanh Toán Thành Công!"
        size="md"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <p className="text-gray-600 mb-6 text-center">
          Giao dịch đã được xử lý thành công. Bạn có thể đóng cửa sổ này.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleCloseSuccessModal}
            className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <XMarkIcon className="w-5 h-5" />
            Đóng
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default RentalPayment;