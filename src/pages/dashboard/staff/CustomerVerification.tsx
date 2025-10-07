import React, { useState } from 'react';
import {
  UserIcon,
  DocumentTextIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface CustomerInfo {
  fullName: string;
  idNumber: string;
  idType: 'cccd' | 'passport' | 'gplx';
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  issueDate: string;
  expiryDate: string;
}

interface VerificationStep {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  description: string;
}

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'failed';

export const CustomerVerification: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    idNumber: '',
    idType: 'cccd',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    issueDate: '',
    expiryDate: ''
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');

  const verificationSteps: VerificationStep[] = [
    {
      id: 'document-scan',
      title: 'Quét giấy tờ tùy thân',
      status: currentStep >= 0 ? (currentStep > 0 ? 'completed' : 'in-progress') : 'pending',
      description: 'Quét và nhận diện thông tin từ CCCD/Passport'
    },
    {
      id: 'info-verification',
      title: 'Xác thực thông tin',
      status: currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'in-progress') : 'pending',
      description: 'Kiểm tra và xác nhận thông tin khách hàng'
    },
    {
      id: 'photo-capture',
      title: 'Chụp ảnh xác thực',
      status: currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'in-progress') : 'pending',
      description: 'Chụp ảnh khách hàng để đối chiếu'
    },
    {
      id: 'final-verification',
      title: 'Hoàn tất xác thực',
      status: currentStep >= 3 ? 'completed' : 'pending',
      description: 'Xác nhận và lưu thông tin khách hàng'
    }
  ];

  const handleDocumentTypeChange = (type: 'cccd' | 'passport' | 'gplx') => {
    setCustomerInfo(prev => ({ ...prev, idType: type }));
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const simulateDocumentScan = () => {
    setVerificationStatus('verifying');
    
    // Simulate API call to document scanning service
    setTimeout(() => {
      setCustomerInfo({
        fullName: 'Nguyễn Văn Khách',
        idNumber: '001234567890',
        idType: 'cccd',
        phoneNumber: '0987654321',
        address: 'Số 123, Đường ABC, Quận XYZ, Hà Nội',
        dateOfBirth: '1990-05-15',
        issueDate: '2021-01-20',
        expiryDate: '2031-01-20'
      });
      setVerificationStatus('success');
      setCurrentStep(1);
    }, 2000);
  };

  const handlePhotoCapture = () => {
    // Simulate camera capture
    setCapturedImage('/api/placeholder/300/400');
    setCurrentStep(3);
  };

  const completeVerification = () => {
    setVerificationStatus('success');
    // Here you would typically send data to backend
    alert('Xác thực khách hàng thành công!');
  };

  const getStepIcon = (step: VerificationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'in-progress':
        return <ArrowPathIcon className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <UserIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Xác thực khách hàng</h1>
        </div>
        <p className="text-gray-600">
          Thực hiện các bước xác thực danh tính khách hàng trước khi cho thuê xe
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tiến trình xác thực</h2>
        <div className="space-y-4">
          {verificationSteps.map((step) => (
            <div key={step.id} className="flex items-center space-x-4">
              {getStepIcon(step)}
              <div className="flex-1">
                <h3 className={`font-medium ${
                  step.status === 'completed' ? 'text-green-700' :
                  step.status === 'in-progress' ? 'text-blue-700' :
                  step.status === 'failed' ? 'text-red-700' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              {step.status === 'in-progress' && (
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Đang thực hiện
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Document Scanning Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="w-6 h-6 mr-2 text-blue-600" />
            Quét giấy tờ tùy thân
          </h2>

          {/* Document Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại giấy tờ
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'cccd', label: 'CCCD' },
                { value: 'passport', label: 'Passport' },
                { value: 'gplx', label: 'GPLX' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleDocumentTypeChange(type.value as any)}
                  className={`p-3 text-center border rounded-lg transition-colors ${
                    customerInfo.idType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scan Action */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {verificationStatus === 'verifying' ? (
              <div className="space-y-4">
                <ArrowPathIcon className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                <p className="text-gray-600">Đang quét và xử lý giấy tờ...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <CameraIcon className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600 mb-2">Đặt giấy tờ tùy thân vào khu vực quét</p>
                  <button
                    onClick={simulateDocumentScan}
                    disabled={verificationStatus === ('verifying' as VerificationStatus)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Bắt đầu quét
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={customerInfo.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số {customerInfo.idType.toUpperCase()}
                </label>
                <input
                  type="text"
                  value={customerInfo.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Nhập số ${customerInfo.idType.toUpperCase()}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={customerInfo.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={customerInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <textarea
                value={customerInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày cấp
                </label>
                <input
                  type="date"
                  value={customerInfo.issueDate}
                  onChange={(e) => handleInputChange('issueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày hết hạn
                </label>
                <input
                  type="date"
                  value={customerInfo.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {currentStep >= 1 && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Xác nhận thông tin - Chuyển bước tiếp theo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Capture Section */}
      {currentStep >= 2 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CameraIcon className="w-6 h-6 mr-2 text-blue-600" />
            Chụp ảnh xác thực
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {capturedImage ? (
                <div className="space-y-4">
                  <img 
                    src={capturedImage} 
                    alt="Captured customer photo" 
                    className="w-48 h-64 mx-auto object-cover rounded-lg border"
                  />
                  <button
                    onClick={handlePhotoCapture}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Chụp lại
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600 mb-4">Chụp ảnh mặt khách hàng để xác thực</p>
                    <button
                      onClick={handlePhotoCapture}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Chụp ảnh
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Hướng dẫn chụp ảnh:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Đảm bảo ánh sáng đủ sáng
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Khuôn mặt nhìn thẳng vào camera
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Không đeo kính mát hoặc mũ
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Khuôn mặt chiếm khoảng 2/3 khung hình
                </li>
              </ul>

              {capturedImage && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={completeVerification}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Hoàn tất xác thực khách hàng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Result */}
      {verificationStatus === 'success' && currentStep >= 3 && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Xác thực thành công!
              </h3>
              <p className="text-green-700">
                Thông tin khách hàng đã được xác thực và lưu vào hệ thống.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};