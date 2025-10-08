import React, { useState } from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import IdentityVerification from './IdentityVerification';
import VehicleInspection from './VehicleInspection';

// Import components for each step (simplified versions for integration)
// Full components are available at their individual routes

type DeliveryStep = 'identity-verification' | 'vehicle-inspection' | 'status-update';

interface StepConfig {
  id: DeliveryStep;
  title: string;
  description: string;
  icon: React.ReactNode;
  component?: React.ComponentType;
}

interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
  status: 'idle' | 'verifying' | 'rented' | 'maintenance';
}

const DeliveryProcedures: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<DeliveryStep>('identity-verification');
  const [completedSteps, setCompletedSteps] = useState<DeliveryStep[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [deliveryVehicle, setDeliveryVehicle] = useState<Vehicle | null>(null);
  // const [customerInfo, setCustomerInfo] = useState<any>(null);

  const steps: StepConfig[] = [
    {
      id: 'identity-verification',
      title: 'Đối chiếu hồ sơ',
      description: 'Xác thực và đối chiếu giấy tờ tùy thân với GPLX',
      icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />,
      component: IdentityVerification
    },
    {
      id: 'vehicle-inspection',
      title: 'Kiểm tra xe',
      description: 'Kiểm tra tình trạng xe trước và sau khi bàn giao',
      icon: <WrenchScrewdriverIcon className="w-6 h-6" />,
      component: VehicleInspection
    },
    {
      id: 'status-update',
      title: 'Cập nhật tình trạng',
      description: 'Cập nhật trạng thái xe và hoàn tất thủ tục',
      icon: <ClipboardDocumentListIcon className="w-6 h-6" />
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const isStepCompleted = (stepId: DeliveryStep) => {
    return completedSteps.includes(stepId);
  };

  const isStepAccessible = (stepId: DeliveryStep) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = getCurrentStepIndex();
    
    // Current step and previous completed steps are accessible
    return stepIndex <= currentIndex || isStepCompleted(stepId);
  };

  const getStepStatus = (stepId: DeliveryStep) => {
    if (isStepCompleted(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    if (isStepAccessible(stepId)) return 'accessible';
    return 'disabled';
  };

  const goToStep = (stepId: DeliveryStep) => {
    if (isStepAccessible(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const completeCurrentStep = () => {
    if (!isStepCompleted(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    
    const currentIndex = getCurrentStepIndex();
    const nextStep = steps[currentIndex + 1];
    
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  };

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    const nextStep = steps[currentIndex + 1];
    
    if (nextStep && isStepAccessible(nextStep.id)) {
      setCurrentStep(nextStep.id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    const prevStep = steps[currentIndex - 1];
    
    if (prevStep) {
      setCurrentStep(prevStep.id);
    }
  };

  const mockVehicles: Vehicle[] = [
    { id: 'EV001', model: 'Tesla Model 3', licensePlate: '30A-12345', status: 'idle' },
    { id: 'EV002', model: 'VinFast VF8', licensePlate: '30B-67890', status: 'verifying' },
    { id: 'EV003', model: 'BYD Seal', licensePlate: '30C-11111', status: 'maintenance' },
  ];

  const updateVehicleStatus = (vehicleId: string, newStatus: Vehicle['status']) => {
    // Update selected vehicle if it matches
    if (selectedVehicle && selectedVehicle.id === vehicleId) {
      setSelectedVehicle({ ...selectedVehicle, status: newStatus });
    }
    // Update delivery vehicle if it matches
    if (deliveryVehicle && deliveryVehicle.id === vehicleId) {
      setDeliveryVehicle({ ...deliveryVehicle, status: newStatus });
    }
    
    console.log(`Updated vehicle ${vehicleId} status to ${newStatus}`);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'identity-verification':
        return (
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
                onClick={completeCurrentStep}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Hoàn tất đối chiếu hồ sơ
              </button>
            </div>
          </div>
        );
        
      case 'vehicle-inspection':
        return (
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
                    completeCurrentStep();
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
        );
        
      case 'status-update':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <ClipboardDocumentListIcon className="w-7 h-7 mr-3 text-blue-600" />
              Cập nhật tình trạng xe
            </h2>
            
            {/* Vehicle Being Delivered */}
            <div className="mb-8">
              {deliveryVehicle ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Xe đang được bàn giao
                  </h3>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Xe:</div>
                        <div className="font-semibold text-gray-900">{deliveryVehicle.model}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Biển số:</div>
                        <div className="font-semibold text-gray-900">{deliveryVehicle.licensePlate}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Trạng thái hiện tại:</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          deliveryVehicle.status === 'idle' ? 'bg-green-100 text-green-800' :
                          deliveryVehicle.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                          deliveryVehicle.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {deliveryVehicle.status === 'idle' ? 'Sẵn sàng' :
                           deliveryVehicle.status === 'verifying' ? 'Đang kiểm tra' :
                           deliveryVehicle.status === 'rented' ? 'Đang thuê' :
                           'Bảo trì'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Cập nhật trạng thái mới:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {(['idle', 'verifying', 'rented', 'maintenance'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setDeliveryVehicle({...deliveryVehicle, status});
                            updateVehicleStatus(deliveryVehicle.id, status);
                          }}
                          className={`p-4 text-center border rounded-lg transition-colors ${
                            deliveryVehicle.status === status
                              ? 'border-blue-500 bg-blue-100 text-blue-700 cursor-not-allowed'
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                          disabled={deliveryVehicle.status === status}
                        >
                          <div className="font-medium capitalize">
                            {status === 'idle' ? 'Sẵn sàng' :
                             status === 'verifying' ? 'Đang kiểm tra' :
                             status === 'rented' ? 'Đang thuê' :
                             'Bảo trì'}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {status === 'idle' ? 'Xe sẵn sàng cho thuê tiếp theo' :
                             status === 'verifying' ? 'Đang trong quá trình kiểm tra' :
                             status === 'rented' ? 'Xe đã được giao cho khách' :
                             'Xe cần bảo trì/sửa chữa'}
                          </div>
                          {deliveryVehicle.status === status && (
                            <div className="text-xs text-blue-600 mt-1 font-medium">
                              (Trạng thái hiện tại)
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => {
                          alert(`Đã cập nhật trạng thái xe ${deliveryVehicle.model} - ${deliveryVehicle.licensePlate} thành "${
                            deliveryVehicle.status === 'idle' ? 'Sẵn sàng' :
                            deliveryVehicle.status === 'verifying' ? 'Đang kiểm tra' :
                            deliveryVehicle.status === 'rented' ? 'Đang thuê' :
                            'Bảo trì'
                          }"`);
                          completeCurrentStep();
                        }}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Xác nhận cập nhật
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-gray-500 mb-2">
                    <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có xe được chọn</h3>
                  <p className="text-gray-600 mb-4">
                    Vui lòng quay lại bước "Kiểm tra xe" để chọn xe cần bàn giao trước khi cập nhật trạng thái.
                  </p>
                  <button
                    onClick={() => setCurrentStep('vehicle-inspection')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Quay lại kiểm tra xe
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <DocumentTextIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Thủ tục bàn giao</h1>
        </div>
        <p className="text-gray-600">
          Thực hiện đầy đủ quy trình bàn giao xe cho khách hàng qua 3 bước
        </p>
      </div>

      {/* Step Navigator */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-colors ${
                    status === 'current' ? 'bg-blue-50 border border-blue-200' :
                    status === 'completed' ? 'bg-green-50 border border-green-200' :
                    status === 'accessible' ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    status === 'completed' ? 'bg-green-100 text-green-600' :
                    status === 'current' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="text-left">
                    <div className={`font-medium ${
                      status === 'current' ? 'text-blue-900' :
                      status === 'completed' ? 'text-green-900' :
                      'text-gray-600'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500">{step.description}</div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div>
          {getCurrentStepIndex() > 0 && (
            <button
              onClick={goToPreviousStep}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Bước trước</span>
            </button>
          )}
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-500">
            Bước {getCurrentStepIndex() + 1} / {steps.length}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {steps[getCurrentStepIndex()].title}
          </div>
        </div>

        <div>
          {getCurrentStepIndex() < steps.length - 1 && isStepCompleted(currentStep) && (
            <button
              onClick={goToNextStep}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>Bước tiếp theo</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Completion Status */}
      {completedSteps.length === steps.length && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Hoàn tất thủ tục bàn giao!
              </h3>
              <p className="text-green-700">
                Tất cả các bước đã được thực hiện thành công. Xe đã sẵn sàng bàn giao cho khách hàng.
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-4">
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Xuất hồ sơ bàn giao
            </button>
            <button 
              onClick={() => {
                setCurrentStep('identity-verification');
                setCompletedSteps([]);
                setSelectedVehicle(null);
                setDeliveryVehicle(null);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Bàn giao xe khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryProcedures;