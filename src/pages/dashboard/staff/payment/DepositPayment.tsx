import React, { useState } from 'react';
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
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// Types
interface DepositRecord {
  id: string;
  bookingId: string;
  vehicleId: string;
  vehicleName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  depositAmount: number;
  depositStatus: 'pending' | 'collected' | 'refunded' | 'partial-refund';
  paidAmount: number;
  refundedAmount: number;
  remainingDeposit: number;
  createdDate: string;
  refundDate?: string;
  damages?: {
    description: string;
    amount: number;
  }[];
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

type ActionType = 'collect' | 'refund';

const DepositPayment: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRecord | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [actionType, setActionType] = useState<ActionType>('collect');
  const [amount, setAmount] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState<string>('0');
  const [deductionReason, setDeductionReason] = useState<string>('');
  const [note, setNote] = useState('');

  // Mock data
  const depositRecords: DepositRecord[] = [
    {
      id: 'D001',
      bookingId: 'BK2024001',
      vehicleId: 'EV-001',
      vehicleName: 'VinFast VF8',
      customerId: 'C001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0901234567',
      depositAmount: 200,
      depositStatus: 'pending',
      paidAmount: 0,
      refundedAmount: 0,
      remainingDeposit: 200,
      createdDate: '2024-10-15'
    },
    {
      id: 'D002',
      bookingId: 'BK2024002',
      vehicleId: 'EV-005',
      vehicleName: 'Tesla Model 3',
      customerId: 'C002',
      customerName: 'Trần Thị B',
      customerPhone: '0912345678',
      depositAmount: 300,
      depositStatus: 'collected',
      paidAmount: 300,
      refundedAmount: 0,
      remainingDeposit: 300,
      createdDate: '2024-10-16'
    },
    {
      id: 'D003',
      bookingId: 'BK2024003',
      vehicleId: 'EV-010',
      vehicleName: 'BYD Seal',
      customerId: 'C003',
      customerName: 'Lê Văn C',
      customerPhone: '0923456789',
      depositAmount: 150,
      depositStatus: 'refunded',
      paidAmount: 150,
      refundedAmount: 150,
      remainingDeposit: 0,
      createdDate: '2024-10-14',
      refundDate: '2024-10-19'
    },
    {
      id: 'D004',
      bookingId: 'BK2024004',
      vehicleId: 'EV-012',
      vehicleName: 'Hyundai Ioniq 5',
      customerId: 'C004',
      customerName: 'Phạm Thị D',
      customerPhone: '0934567890',
      depositAmount: 250,
      depositStatus: 'partial-refund',
      paidAmount: 250,
      refundedAmount: 200,
      remainingDeposit: 50,
      createdDate: '2024-10-13',
      refundDate: '2024-10-18',
      damages: [
        { description: 'Trầy xước nhỏ bên hông xe', amount: 50 }
      ]
    }
  ];

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

  const filteredDeposits = depositRecords.filter(deposit =>
    deposit.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deposit.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deposit.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deposit.customerPhone.includes(searchQuery)
  );

  const handleSelectDeposit = (deposit: DepositRecord) => {
    setSelectedDeposit(deposit);
    
    // Set default action based on status
    if (deposit.depositStatus === 'pending') {
      setActionType('collect');
      setAmount(deposit.depositAmount.toString());
    } else if (deposit.depositStatus === 'collected') {
      setActionType('refund');
      setAmount(deposit.remainingDeposit.toString());
    }
  };

  const handleOpenModal = (type: ActionType) => {
    if (!selectedDeposit) return;
    
    setActionType(type);
    if (type === 'collect') {
      setAmount((selectedDeposit.depositAmount - selectedDeposit.paidAmount).toString());
    } else {
      setAmount(selectedDeposit.remainingDeposit.toString());
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
    
    if (numAmount <= 0) {
      alert('Số tiền không hợp lệ');
      return;
    }

    if (actionType === 'refund' && deduction > numAmount) {
      alert('Số tiền khấu trừ không được lớn hơn số tiền hoàn trả');
      return;
    }

    // API call here
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đặt Cọc & Hoàn Cọc</h1>
            <p className="text-gray-600 mt-1">Quản lý thu và hoàn tiền đặt cọc cho khách hàng</p>
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
            
            <div className="space-y-3">
              {filteredDeposits.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Không tìm thấy giao dịch đặt cọc</p>
                </div>
              ) : (
                filteredDeposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    onClick={() => handleSelectDeposit(deposit)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedDeposit?.id === deposit.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {deposit.bookingId}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(deposit.depositStatus)}`}>
                            {getStatusText(deposit.depositStatus)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <UserIcon className="w-4 h-4" />
                            <span>{deposit.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <TruckIcon className="w-4 h-4" />
                            <span>{deposit.vehicleId} - {deposit.vehicleName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-xs text-gray-500 mb-1">Tiền cọc</div>
                        <div className="text-xl font-bold text-blue-600">
                          ${deposit.depositAmount}
                        </div>
                        {deposit.remainingDeposit > 0 && deposit.depositStatus !== 'pending' && (
                          <div className="text-xs text-gray-600 mt-1">
                            Còn lại: ${deposit.remainingDeposit}
                          </div>
                        )}
                      </div>
                    </div>

                    {deposit.damages && deposit.damages.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs text-red-600">
                          <span className="font-medium">Khấu trừ: </span>
                          {deposit.damages.map(d => d.description).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao Tác</h2>
            
            {!selectedDeposit ? (
              <div className="text-center py-8">
                <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  Chọn một giao dịch để thực hiện
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Khách hàng:</span>
                      <span className="font-medium">{selectedDeposit.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã booking:</span>
                      <span className="font-medium">{selectedDeposit.bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Xe:</span>
                      <span className="font-medium">{selectedDeposit.vehicleName}</span>
                    </div>
                  </div>
                </div>

                {/* Deposit Details */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Chi tiết tiền cọc</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền cọc:</span>
                      <span className="font-bold text-blue-600">${selectedDeposit.depositAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã thu:</span>
                      <span className="font-medium text-green-600">${selectedDeposit.paidAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã hoàn:</span>
                      <span className="font-medium text-orange-600">${selectedDeposit.refundedAmount}</span>
                    </div>
                    <div className="border-t border-blue-300 pt-1 mt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-medium">Còn lại:</span>
                        <span className="font-bold text-gray-900">${selectedDeposit.remainingDeposit}</span>
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
                  
                  {(selectedDeposit.depositStatus === 'collected' || selectedDeposit.depositStatus === 'partial-refund') && 
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
              <div className={`${actionType === 'collect' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Mã booking:</span>
                  <span className="font-semibold">{selectedDeposit.bookingId}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Khách hàng:</span>
                  <span className="font-semibold">{selectedDeposit.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tiền cọc:</span>
                  <span className="text-2xl font-bold text-blue-600">${selectedDeposit.depositAmount}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền {actionType === 'collect' ? 'thu' : 'hoàn'} ($)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Deduction (only for refund) */}
              {actionType === 'refund' && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Khấu trừ (nếu có)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Số tiền khấu trừ ($)</label>
                      <input
                        type="number"
                        value={deductionAmount}
                        onChange={(e) => setDeductionAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        min="0"
                        step="0.01"
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
                          ${calculateRefundAmount().toFixed(2)}
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

              {/* Note */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
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
                  ${actionType === 'refund' ? calculateRefundAmount().toFixed(2) : amount}
                </span>
              </div>
              {actionType === 'refund' && parseFloat(deductionAmount) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Khấu trừ:</span>
                  <span className="font-medium">-${deductionAmount}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {/* Print receipt logic */}}
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
