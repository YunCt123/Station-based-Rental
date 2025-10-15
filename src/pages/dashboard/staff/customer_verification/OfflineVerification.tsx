import React, { useState } from 'react';
import {
  DocumentTextIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface LicenseInfo {
  licenseNumber: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  issueDate: string;
  expiryDate: string;
  licenseClass: string;
  issuePlace: string;
  restrictions: string;
}

interface LicenseValidation {
  isValid: boolean;
  isExpired: boolean;
  daysUntilExpiry: number;
  validationStatus: 'valid' | 'expired' | 'invalid' | 'restricted';
  message: string;
  restrictions: string[];
}

export const OfflineVerification: React.FC = () => {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>({
    licenseNumber: '',
    fullName: '',
    dateOfBirth: '',
    address: '',
    issueDate: '',
    expiryDate: '',
    licenseClass: '',
    issuePlace: '',
    restrictions: ''
  });

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [validation, setValidation] = useState<LicenseValidation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const simulateLicenseScan = () => {
    setScanStatus('scanning');
    
    setTimeout(() => {
      const mockLicenseData: LicenseInfo = {
        licenseNumber: '012345678912',
        fullName: 'NGUYỄN VĂN KHÁCH',
        dateOfBirth: '15/05/1990',
        address: 'Số 123, Đường ABC, Quận XYZ, Hà Nội',
        issueDate: '20/01/2021',
        expiryDate: '20/01/2031',
        licenseClass: 'B1, B2',
        issuePlace: 'Cục CSGT - Bộ Công an',
        restrictions: 'Đeo kính khi lái xe'
      };
      
      setLicenseInfo(mockLicenseData);
      setScanStatus('success');
      
      // Validate license
      const today = new Date();
      const expiryDate = new Date('2031-01-20');
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isExpired = expiryDate < today;
      
      const mockValidation: LicenseValidation = {
        isValid: true,
        isExpired,
        daysUntilExpiry,
        validationStatus: isExpired ? 'expired' : (daysUntilExpiry < 30 ? 'restricted' : 'valid'),
        message: isExpired 
          ? 'GPLX đã hết hạn. Không thể thực hiện thuê xe.'
          : daysUntilExpiry < 30
          ? 'GPLX sắp hết hạn. Vui lòng gia hạn trước khi thuê xe.'
          : 'GPLX hợp lệ và có thể sử dụng để thuê xe.',
        restrictions: mockLicenseData.restrictions ? [mockLicenseData.restrictions] : []
      };
      
      setValidation(mockValidation);
    }, 2000);
  };

  const handleFrontPhotoCapture = () => {
    // Simulate photo capture
    setCapturedImage('https://via.placeholder.com/400x250');
  };

  const handleBackPhotoCapture = () => {
    // Simulate photo capture
    setBackImage('https://via.placeholder.com/400x250');
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />;
      case 'expired':
      case 'invalid':
        return <XCircleIcon className="w-8 h-8 text-red-500 flex-shrink-0" />;
      case 'restricted':
        return <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const getValidationColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'expired':
      case 'invalid':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'restricted':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setBackImage(null);
    setScanStatus('idle');
    setValidation(null);
    setShowDetails(false);
    setLicenseInfo({
      licenseNumber: '',
      fullName: '',
      dateOfBirth: '',
      address: '',
      issueDate: '',
      expiryDate: '',
      licenseClass: '',
      issuePlace: '',
      restrictions: ''
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Xác thực GPLX trực tiếp</h1>
        <p className="text-gray-600 mt-2">
          Quét và xác thực giấy phép lái xe cho khách hàng tại quầy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* License Scanning Section */}
        <div className="space-y-6">
          {/* Front Side Scan */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CameraIcon className="w-6 h-6 mr-2 text-blue-600" />
              Mặt trước GPLX
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {capturedImage ? (
                <div className="text-center space-y-4">
                  <img 
                    src={capturedImage} 
                    alt="License front side" 
                    className="w-full max-w-sm mx-auto rounded-lg border shadow-sm"
                  />
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={handleFrontPhotoCapture}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Chụp lại
                    </button>
                    <button
                      onClick={simulateLicenseScan}
                      disabled={scanStatus === 'scanning'}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      {scanStatus === 'scanning' ? 'Đang quét...' : 'Quét thông tin'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600 mb-4">Chụp ảnh mặt trước giấy phép lái xe</p>
                    <button
                      onClick={handleFrontPhotoCapture}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Chụp ảnh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Back Side Scan */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CameraIcon className="w-6 h-6 mr-2 text-blue-600" />
              Mặt sau GPLX
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {backImage ? (
                <div className="text-center space-y-4">
                  <img 
                    src={backImage} 
                    alt="License back side" 
                    className="w-full max-w-sm mx-auto rounded-lg border shadow-sm"
                  />
                  <button
                    onClick={handleBackPhotoCapture}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Chụp lại
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600 mb-4">Chụp ảnh mặt sau giấy phép lái xe</p>
                    <button
                      onClick={handleBackPhotoCapture}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Chụp ảnh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* License Information Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Thông tin GPLX</h2>
            {scanStatus === 'scanning' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span className="text-sm">Đang xử lý...</span>
              </div>
            )}
          </div>

          {scanStatus === 'success' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số GPLX
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg">
                    {licenseInfo.licenseNumber}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {licenseInfo.fullName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                      {licenseInfo.dateOfBirth}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hạng GPLX
                    </label>
                    <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-700">
                      {licenseInfo.licenseClass}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    {licenseInfo.address}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày cấp
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                      {licenseInfo.issueDate}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Có giá trị đến
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                      {licenseInfo.expiryDate}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nơi cấp
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    {licenseInfo.issuePlace}
                  </div>
                </div>

                {licenseInfo.restrictions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Điều kiện sử dụng
                    </label>
                    <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                      {licenseInfo.restrictions}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chụp ảnh GPLX để bắt đầu quá trình xác thực</p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Results */}
      {validation && (
        <div className="mt-8">
          <div className={`rounded-lg border p-6 ${getValidationColor(validation.validationStatus)}`}>
            <div className="flex items-start space-x-4">
              {getValidationIcon(validation.validationStatus)}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Kết quả xác thực
                </h3>
                <p className="mb-4">{validation.message}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    {validation.isValid ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm">
                      {validation.isValid ? 'GPLX hợp lệ' : 'GPLX không hợp lệ'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!validation.isExpired ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm">
                      {validation.isExpired ? 'Đã hết hạn' : 'Còn hiệu lực'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">
                      Còn {validation.daysUntilExpiry} ngày
                    </span>
                  </div>
                </div>

                {validation.restrictions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Lưu ý đặc biệt:</h4>
                    <ul className="text-sm space-y-1">
                      {validation.restrictions.map((restriction, index) => (
                        <li key={index} className="flex items-start">
                          <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          {restriction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex space-x-4">
                  {validation.validationStatus === 'valid' && (
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Chấp nhận và tiếp tục
                    </button>
                  )}
                  <button 
                    onClick={handleReset}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Quét lại GPLX
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Details */}
      {showDetails && validation && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            Thông tin chi tiết
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Thông tin chủ sở hữu</h4>
              <div className="space-y-2 text-gray-600">
                <div>Tên đầy đủ: {licenseInfo.fullName}</div>
                <div>Ngày sinh: {licenseInfo.dateOfBirth}</div>
                <div>Địa chỉ: {licenseInfo.address}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Thông tin giấy phép</h4>
              <div className="space-y-2 text-gray-600">
                <div>Số GPLX: {licenseInfo.licenseNumber}</div>
                <div>Hạng: {licenseInfo.licenseClass}</div>
                <div>Ngày cấp: {licenseInfo.issueDate}</div>
                <div>Ngày hết hạn: {licenseInfo.expiryDate}</div>
                <div>Nơi cấp: {licenseInfo.issuePlace}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineVerification;