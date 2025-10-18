import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  CreditCardIcon,
  CheckCircleIcon,
  PrinterIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { Modal } from '../../../../components/Modal';

// Types
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
}

const RentalPayment: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRental, setSelectedRental] = useState<RentalRecord | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentNote, setPaymentNote] = useState('');

  // Mock data - Replace with actual API call
  const rentalRecords: RentalRecord[] = [
    {
      id: 'R001',
      bookingId: 'BK2024001',
      vehicleId: 'EV-001',
      vehicleName: 'VinFast VF8',
      customerId: 'C001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0901234567',
      startDate: '2024-10-15',
      endDate: '2024-10-20',
      status: 'active',
      rentalDays: 5,
      dailyRate: 120,
      totalAmount: 600,
      paidAmount: 0,
      remainingAmount: 600,
      deposit: 200,
      additionalCharges: [
        { name: 'Bảo hiểm', amount: 50 }
      ]
    },
    {
      id: 'R002',
      bookingId: 'BK2024002',
      vehicleId: 'EV-005',
      vehicleName: 'Tesla Model 3',
      customerId: 'C002',
      customerName: 'Trần Thị B',
      customerPhone: '0912345678',
      startDate: '2024-10-16',
      endDate: '2024-10-18',
      status: 'active',
      rentalDays: 2,
      dailyRate: 150,
      totalAmount: 300,
      paidAmount: 100,
      remainingAmount: 200,
      deposit: 300
    },
    {
      id: 'R003',
      bookingId: 'BK2024003',
      vehicleId: 'EV-010',
      vehicleName: 'BYD Seal',
      customerId: 'C003',
      customerName: 'Lê Văn C',
      customerPhone: '0923456789',
      startDate: '2024-10-14',
      endDate: '2024-10-19',
      status: 'overdue',
      rentalDays: 5,
      dailyRate: 100,
      totalAmount: 500,
      paidAmount: 0,
      remainingAmount: 550, // Including late fee
      deposit: 150,
      additionalCharges: [
        { name: 'Phí trả xe trễ', amount: 50 }
      ]
    }
  ];

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
      description: 'Thanh toán bằng thẻ ATM/Credit'
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: <QrCodeIcon className="w-6 h-6" />,
      description: 'Quét mã QR để thanh toán'
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      icon: <DevicePhoneMobileIcon className="w-6 h-6" />,
      description: 'Thanh toán qua ví MoMo'
    }
  ];

  const filteredRentals = rentalRecords.filter(rental =>
    rental.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rental.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rental.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rental.customerPhone.includes(searchQuery)
  );

  const handleSelectRental = (rental: RentalRecord) => {
    setSelectedRental(rental);
    setPaymentAmount(rental.remainingAmount.toString());
  };

  const handlePayment = () => {
    if (!selectedRental || !selectedPaymentMethod || !paymentAmount) {
      alert('Vui lòng điền đầy đủ thông tin thanh toán');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedRental.remainingAmount) {
      alert('Số tiền thanh toán không hợp lệ');
      return;
    }

    // Here you would call the API to process payment
    setShowPaymentModal(false);
    setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSelectedRental(null);
    setSelectedPaymentMethod('');
    setPaymentAmount('');
    setPaymentNote('');
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Danh sách đơn thuê cần thanh toán ({filteredRentals.length})
            </h2>
            
            <div className="space-y-3">
              {filteredRentals.length === 0 ? (
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
                          ${rental.remainingAmount}
                        </div>
                        {rental.paidAmount > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            Đã trả: ${rental.paidAmount}
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
                      <span className="font-medium">${selectedRental.dailyRate}</span>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Chi phí</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Phí thuê xe:</span>
                      <span>${selectedRental.dailyRate * selectedRental.rentalDays}</span>
                    </div>
                    
                    {selectedRental.additionalCharges?.map((charge, index) => (
                      <div key={index} className="flex justify-between text-amber-600">
                        <span>{charge.name}:</span>
                        <span>+${charge.amount}</span>
                      </div>
                    ))}
                    
                    <div className="flex justify-between text-gray-600">
                      <span>Đã thanh toán:</span>
                      <span className="text-green-600">-${selectedRental.paidAmount}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Còn phải trả:</span>
                        <span className="text-red-600">${selectedRental.remainingAmount}</span>
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
              <span className="text-2xl font-bold text-red-600">${selectedRental.remainingAmount}</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền thanh toán ($)
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
                onClick={() => setPaymentAmount((selectedRental.remainingAmount / 2).toFixed(2))}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                50%
              </button>
              <button
                onClick={() => setPaymentAmount(selectedRental.remainingAmount.toString())}
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
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`${selectedPaymentMethod === method.id ? 'text-blue-600' : 'text-gray-600'}`}>
                      {method.icon}
                    </div>
                    <span className="font-medium text-gray-900">{method.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{method.description}</p>
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
              disabled={!selectedPaymentMethod || !paymentAmount}
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
          Giao dịch đã được xử lý thành công. Bạn có thể in hóa đơn hoặc đóng cửa sổ này.
        </p>
        <div className="space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Mã giao dịch:</span>
            <span className="font-medium">TX{Date.now()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Số tiền:</span>
            <span className="font-medium">${paymentAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phương thức:</span>
            <span className="font-medium">
              {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {/* Print receipt logic */}}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <PrinterIcon className="w-5 h-5" />
            In Hóa Đơn
          </button>
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
