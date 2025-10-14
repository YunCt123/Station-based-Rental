import React, { useState } from 'react';
import {
  CheckCircleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
  status: 'idle' | 'verifying' | 'rented' | 'maintenance';
}

export const VehicleInspection: React.FC = () => {
  const [deliveryVehicle, setDeliveryVehicle] = useState<Vehicle | null>(null);

  const mockVehicles: Vehicle[] = [
    { id: 'EV001', model: 'Tesla Model 3', licensePlate: '30A-12345', status: 'idle' },
    { id: 'EV002', model: 'VinFast VF8', licensePlate: '30B-67890', status: 'verifying' },
    { id: 'EV003', model: 'BYD Seal', licensePlate: '30C-11111', status: 'maintenance' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <WrenchScrewdriverIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Kiểm tra xe</h1>
        </div>
        <p className="text-gray-600">
          Kiểm tra tình trạng xe trước và sau khi bàn giao
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
          <WrenchScrewdriverIcon className="w-7 h-7 mr-3 text-blue-600" />
          Kiểm tra xe
        </h2>

        {/* Vehicle Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Chọn xe cần kiểm tra</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockVehicles.filter(v => v.status === 'verifying' || v.status === 'idle').map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => setDeliveryVehicle(vehicle)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  deliveryVehicle?.id === vehicle.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{vehicle.model}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    vehicle.status === 'idle' ? 'bg-green-100 text-green-800' :
                    vehicle.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                    vehicle.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vehicle.status === 'idle' ? 'Sẵn sàng' :
                     vehicle.status === 'verifying' ? 'Đang kiểm tra' :
                     vehicle.status === 'rented' ? 'Đang thuê' :
                     'Bảo trì'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Biển số: {vehicle.licensePlate}</div>
                </div>
              </div>
            ))}
          </div>
          
          {deliveryVehicle && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Xe được chọn để kiểm tra:</h4>
              <div className="text-sm text-blue-700">
                <div>{deliveryVehicle.model} - {deliveryVehicle.licensePlate}</div>
                <div>Trạng thái: <span className="font-medium">{deliveryVehicle.status === 'idle' ? 'Sẵn sàng' : 'Đang kiểm tra'}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Inspection Phases */}
        <div className="space-y-6">
          {/* Pre-delivery */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
              Trước khi giao xe
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vehicle Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Mức pin:</span>
                  <span className="font-semibold text-green-600">100%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Số km:</span>
                  <span className="font-semibold">15,240 km</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Hư hỏng:</span>
                  <span className="text-green-600 font-medium">Không</span>
                </div>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <div className="text-sm font-medium text-green-800">Ghi chú:</div>
                  <div className="text-sm text-green-700">Xe trong tình trạng tốt, sẵn sàng giao cho khách</div>
                </div>
              </div>

              {/* Vehicle Photos - Pre-delivery */}
              <div className="lg:col-span-2">
                <h5 className="font-medium text-gray-900 mb-3">Ảnh xe trước khi giao</h5>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Mặt trước', image: '/api/placeholder/150/120' },
                    { label: 'Mặt sau', image: '/api/placeholder/150/120' },
                    { label: 'Bên trái', image: '/api/placeholder/150/120' },
                    { label: 'Bên phải', image: '/api/placeholder/150/120' },
                    { label: 'Nội thất', image: '/api/placeholder/150/120' },
                    { label: 'Bảng điều khiển', image: '/api/placeholder/150/120' }
                  ].map((photo, index) => (
                    <div key={index} className="text-center">
                      <div className="relative group cursor-pointer">
                        <div className="w-full h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded border border-gray-200 hover:border-blue-300 transition-colors flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xs text-blue-700 font-medium">{photo.label}</div>
                            <div className="text-xs text-blue-600 mt-1">📸 Chụp ảnh</div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all duration-200 flex items-center justify-center">
                          <span className="text-blue-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            Nhấn để chụp
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{photo.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Post-return */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2 text-yellow-600" />
              Sau khi nhận lại
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vehicle Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Mức pin:</span>
                  <span className="font-semibold text-yellow-600">85%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Số km:</span>
                  <span className="font-semibold">15,285 km</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Hư hỏng:</span>
                  <span className="text-yellow-600 font-medium">Trầy xước nhẹ</span>
                </div>
                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-800">Ghi chú:</div>
                  <div className="text-sm text-yellow-700">Phát hiện trầy xước nhẹ ở cản trước, cần làm sạch nội thất</div>
                </div>
              </div>

              {/* Vehicle Photos - Post-return */}
              <div className="lg:col-span-2">
                <h5 className="font-medium text-gray-900 mb-3">Ảnh xe sau khi nhận lại</h5>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Mặt trước', image: '/api/placeholder/150/120', hasIssue: true },
                    { label: 'Mặt sau', image: '/api/placeholder/150/120', hasIssue: false },
                    { label: 'Bên trái', image: '/api/placeholder/150/120', hasIssue: false },
                    { label: 'Bên phải', image: '/api/placeholder/150/120', hasIssue: false },
                    { label: 'Nội thất', image: '/api/placeholder/150/120', hasIssue: true },
                    { label: 'Bảng điều khiển', image: '/api/placeholder/150/120', hasIssue: false }
                  ].map((photo, index) => (
                    <div key={index} className="text-center">
                      <div className="relative group cursor-pointer">
                        <div className={`w-full h-20 rounded border-2 transition-colors flex items-center justify-center ${
                          photo.hasIssue 
                            ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300 hover:border-yellow-400' 
                            : 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 hover:border-green-400'
                        }`}>
                          <div className="text-center">
                            <div className={`text-xs font-medium ${photo.hasIssue ? 'text-yellow-700' : 'text-green-700'}`}>
                              {photo.label}
                            </div>
                            <div className={`text-xs mt-1 ${photo.hasIssue ? 'text-yellow-600' : 'text-green-600'}`}>
                              📸 Đã chụp
                            </div>
                          </div>
                        </div>
                        {photo.hasIssue && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all duration-200 flex items-center justify-center">
                          <span className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium ${
                            photo.hasIssue ? 'text-yellow-700' : 'text-green-700'
                          }`}>
                            Xem chi tiết
                          </span>
                        </div>
                      </div>
                      <div className={`text-xs mt-1 ${photo.hasIssue ? 'text-yellow-700 font-medium' : 'text-gray-600'}`}>
                        {photo.label}
                        {photo.hasIssue && ' ⚠️'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Tóm tắt so sánh</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Pin: Giảm 15% (bình thường)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Quãng đường: +45km</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Hư hỏng: Có thay đổi nhỏ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-semibold text-blue-800">Kiểm tra hoàn tất!</div>
              <div className="text-sm text-blue-700">Xe đã được kiểm tra đầy đủ trước và sau bàn giao</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              if (deliveryVehicle) {
                alert('Đã hoàn tất kiểm tra xe ' + deliveryVehicle.model);
              } else {
                alert('Vui lòng chọn xe cần kiểm tra trước khi tiếp tục');
              }
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!deliveryVehicle}
          >
            Hoàn tất kiểm tra xe
          </button>
        </div>
      </div>
    </div>
  );
};