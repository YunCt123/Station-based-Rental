import React, { useState } from 'react';
import {
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  CameraIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface DocumentInfo {
  type: 'cccd' | 'passport' | 'gplx';
  number: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  issueDate: string;
  expiryDate: string;
  photo?: string;
}

interface ComparisonResult {
  field: string;
  label: string;
  licenseValue: string;
  idValue: string;
  isMatch: boolean;
  confidence: number;
}

interface VerificationResult {
  overallMatch: number;
  status: 'verified' | 'partial' | 'failed';
  discrepancies: ComparisonResult[];
  recommendations: string[];
}

export const IdentityVerification: React.FC = () => {
  const [licenseInfo, ] = useState<DocumentInfo>({
    type: 'gplx',
    number: '012345678912',
    fullName: 'NGUYỄN VĂN KHÁCH',
    dateOfBirth: '15/05/1990',
    address: 'Số 123, Đường ABC, Quận XYZ, Hà Nội',
    issueDate: '20/01/2021',
    expiryDate: '20/01/2031',
    photo: '/api/placeholder/150/200'
  });

  const [idInfo, ] = useState<DocumentInfo>({
    type: 'cccd',
    number: '001234567890',
    fullName: 'Nguyễn Văn Khách',
    dateOfBirth: '15/05/1990',
    address: 'Số 123, Đường ABC, Quận XYZ, Hà Nội',
    issueDate: '20/01/2021',
    expiryDate: '20/01/2031',
    photo: '/api/placeholder/150/200'
  });

  const [livePhoto, setLivePhoto] = useState<string>('/api/placeholder/150/200');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const compareDocuments = () => {
    setIsComparing(true);
    
    setTimeout(() => {
      const comparisons: ComparisonResult[] = [
        {
          field: 'fullName',
          label: 'Họ và tên',
          licenseValue: licenseInfo.fullName,
          idValue: idInfo.fullName,
          isMatch: licenseInfo.fullName.toLowerCase().includes(idInfo.fullName.toLowerCase()) || 
                   idInfo.fullName.toLowerCase().includes(licenseInfo.fullName.toLowerCase()),
          confidence: 95
        },
        {
          field: 'dateOfBirth',
          label: 'Ngày sinh',
          licenseValue: licenseInfo.dateOfBirth,
          idValue: idInfo.dateOfBirth,
          isMatch: licenseInfo.dateOfBirth === idInfo.dateOfBirth,
          confidence: 100
        },
        {
          field: 'address',
          label: 'Địa chỉ',
          licenseValue: licenseInfo.address,
          idValue: idInfo.address,
          isMatch: licenseInfo.address === idInfo.address,
          confidence: 100
        }
      ];

      const matchingFields = comparisons.filter(c => c.isMatch).length;
      const overallMatch = (matchingFields / comparisons.length) * 100;
      
      const result: VerificationResult = {
        overallMatch,
        status: overallMatch >= 90 ? 'verified' : overallMatch >= 70 ? 'partial' : 'failed',
        discrepancies: comparisons.filter(c => !c.isMatch),
        recommendations: overallMatch < 90 ? [
          'Yêu cầu khách hàng xuất trình thêm giấy tờ xác thực',
          'Liên hệ với supervisor để xem xét trường hợp đặc biệt',
          'Có thể yêu cầu khách hàng cập nhật thông tin mới nhất'
        ] : ['Hồ sơ đã được xác thực thành công', 'Có thể tiến hành các bước tiếp theo']
      };

      setVerificationResult(result);
      setIsComparing(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'partial':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case 'partial':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />;
      case 'failed':
        return <XCircleIcon className="w-6 h-6 text-red-600" />;
      default:
        return <ShieldCheckIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <ClipboardDocumentCheckIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Đối chiếu hồ sơ</h1>
        </div>
        <p className="text-gray-600">
          So sánh và xác thực thông tin giữa giấy phép lái xe, giấy tờ tùy thân và ảnh trực tiếp
        </p>
      </div>

      {/* Document Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* License Document */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
              Giấy phép lái xe
            </h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              GPLX
            </span>
          </div>

          <div className="space-y-4">
            {licenseInfo.photo && (
              <div className="text-center">
                <img 
                  src={licenseInfo.photo} 
                  alt="License photo"
                  className="w-32 h-40 mx-auto object-cover rounded-lg border shadow-sm"
                />
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Số GPLX:</span>
                <div className="mt-1 font-mono text-gray-900">{licenseInfo.number}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Họ tên:</span>
                <div className="mt-1 text-gray-900">{licenseInfo.fullName}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ngày sinh:</span>
                <div className="mt-1 text-gray-900 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {licenseInfo.dateOfBirth}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Địa chỉ:</span>
                <div className="mt-1 text-gray-900 flex items-start">
                  <MapPinIcon className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{licenseInfo.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ID Document */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-green-600" />
              Giấy tờ tùy thân
            </h2>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded uppercase">
              {idInfo.type}
            </span>
          </div>

          <div className="space-y-4">
            {idInfo.photo && (
              <div className="text-center">
                <img 
                  src={idInfo.photo} 
                  alt="ID photo"
                  className="w-32 h-40 mx-auto object-cover rounded-lg border shadow-sm"
                />
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Số {idInfo.type.toUpperCase()}:</span>
                <div className="mt-1 font-mono text-gray-900">{idInfo.number}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Họ tên:</span>
                <div className="mt-1 text-gray-900">{idInfo.fullName}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ngày sinh:</span>
                <div className="mt-1 text-gray-900 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {idInfo.dateOfBirth}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Địa chỉ:</span>
                <div className="mt-1 text-gray-900 flex items-start">
                  <MapPinIcon className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{idInfo.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Photo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CameraIcon className="w-5 h-5 mr-2 text-purple-600" />
              Ảnh trực tiếp
            </h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
              LIVE
            </span>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <img 
                src={livePhoto} 
                alt="Live photo"
                className="w-32 h-40 mx-auto object-cover rounded-lg border shadow-sm"
              />
            </div>

            <div className="space-y-3 text-sm">
              <div className="text-center text-gray-600">
                Ảnh được chụp trực tiếp tại trạm
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <CalendarIcon className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
              <button 
                onClick={() => setLivePhoto('/api/placeholder/150/200')}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                Chụp lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Action */}
      <div className="text-center mb-8">
        <button
          onClick={compareDocuments}
          disabled={isComparing}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
        >
          {isComparing ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>Đang so sánh...</span>
            </>
          ) : (
            <>
              <EyeIcon className="w-5 h-5" />
              <span>Bắt đầu đối chiếu</span>
            </>
          )}
        </button>
      </div>

      {/* Verification Results */}
      {verificationResult && (
        <div className="space-y-6">
          {/* Overall Result */}
          <div className={`rounded-lg border p-6 ${getStatusColor(verificationResult.status)}`}>
            <div className="flex items-start space-x-4">
              {getStatusIcon(verificationResult.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">
                    Kết quả đối chiếu hồ sơ
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {verificationResult.overallMatch.toFixed(0)}%
                    </div>
                    <div className="text-sm opacity-75">Độ khớp</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Tiến độ xác thực</span>
                    <span>{verificationResult.overallMatch.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${verificationResult.overallMatch}%`,
                        backgroundColor: verificationResult.status === 'verified' ? '#10b981' : 
                                       verificationResult.status === 'partial' ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-current" />
                    <span className="text-sm">Thông tin cơ bản</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-current" />
                    <span className="text-sm">Ảnh xác thực</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-current" />
                    <span className="text-sm">Tính hợp lệ</span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                  >
                    {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                  </button>
                  {verificationResult.status === 'verified' && (
                    <button className="px-6 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 font-medium">
                      Phê duyệt hồ sơ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Comparison */}
          {showDetails && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết so sánh</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Trường thông tin</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">GPLX</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Giấy tờ tùy thân</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Kết quả</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Độ tin cậy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { field: 'fullName', label: 'Họ và tên', licenseValue: licenseInfo.fullName, idValue: idInfo.fullName, isMatch: true, confidence: 95 },
                      { field: 'dateOfBirth', label: 'Ngày sinh', licenseValue: licenseInfo.dateOfBirth, idValue: idInfo.dateOfBirth, isMatch: true, confidence: 100 },
                      { field: 'address', label: 'Địa chỉ', licenseValue: licenseInfo.address, idValue: idInfo.address, isMatch: true, confidence: 100 }
                    ].map((comparison) => (
                      <tr key={comparison.field} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{comparison.label}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{comparison.licenseValue}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{comparison.idValue}</td>
                        <td className="py-3 px-4">
                          {comparison.isMatch ? (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Khớp</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-red-600">
                              <XCircleIcon className="w-4 h-4" />
                              <span>Không khớp</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            comparison.confidence >= 95 ? 'bg-green-100 text-green-800' :
                            comparison.confidence >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {comparison.confidence}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-blue-600" />
              Khuyến nghị
            </h3>
            <ul className="space-y-2">
              {verificationResult.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2 text-gray-700">
                  <CheckCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};