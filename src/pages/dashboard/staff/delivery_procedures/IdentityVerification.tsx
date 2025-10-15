import React from 'react';
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

const IdentityVerification: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <ClipboardDocumentCheckIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Đối chiếu hồ sơ</h1>
        </div>
        <p className="text-gray-600">
          Xác thực và đối chiếu giấy tờ tùy thân với GPLX
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
          <ClipboardDocumentCheckIcon className="w-7 h-7 mr-3 text-blue-600" />
          Đối chiếu hồ sơ
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GPLX Info */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Giấy phép lái xe</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Số GPLX:</span> 012345678912</div>
              <div><span className="font-medium">Họ tên:</span> NGUYỄN VĂN KHÁCH</div>
              <div><span className="font-medium">Ngày sinh:</span> 15/05/1990</div>
              <div><span className="font-medium">Hạng:</span> B1, B2</div>
            </div>
          </div>

          {/* ID Info */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Giấy tờ tùy thân</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Số CCCD:</span> 001234567890</div>
              <div><span className="font-medium">Họ tên:</span> Nguyễn Văn Khách</div>
              <div><span className="font-medium">Ngày sinh:</span> 15/05/1990</div>
              <div><span className="font-medium">Địa chỉ:</span> Hà Nội</div>
            </div>
          </div>

          {/* Live Photo */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Ảnh trực tiếp</h3>
            <div className="w-24 h-32 bg-gray-200 rounded mx-auto mb-3"></div>
            <div className="text-center text-xs text-gray-500">
              Ảnh được chụp tại trạm
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-semibold text-green-800">Đối chiếu thành công!</div>
              <div className="text-sm text-green-700">Thông tin khớp 100% - Có thể tiến hành bước tiếp theo</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => alert('Hoàn tất đối chiếu hồ sơ')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Hoàn tất đối chiếu hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdentityVerification;