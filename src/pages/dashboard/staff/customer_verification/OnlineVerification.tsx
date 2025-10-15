import React, { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface PendingCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    cccd: {
      frontImage: string | null;
      backImage: string | null;
      uploaded: boolean;
    };
    gplx: {
      frontImage: string | null;
      backImage: string | null;
      uploaded: boolean;
    };
  };
}

export const OnlineVerification: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<PendingCustomer | null>(null);
  
  // Mock data for pending customers
  const [pendingCustomers] = useState<PendingCustomer[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0901234567',
      registrationDate: '2024-03-20',
      status: 'pending',
      documents: {
        cccd: {
          frontImage: 'https://via.placeholder.com/400x250',
          backImage: 'https://via.placeholder.com/400x250',
          uploaded: true
        },
        gplx: {
          frontImage: 'https://via.placeholder.com/400x250',
          backImage: 'https://via.placeholder.com/400x250',
          uploaded: true
        }
      }
    },
    {
      id: '2',
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      phone: '0912345678',
      registrationDate: '2024-03-21',
      status: 'pending',
      documents: {
        cccd: {
          frontImage: 'https://via.placeholder.com/400x250',
          backImage: null,
          uploaded: false
        },
        gplx: {
          frontImage: 'https://via.placeholder.com/400x250',
          backImage: 'https://via.placeholder.com/400x250',
          uploaded: true
        }
      }
    }
  ]);

  const handleCustomerSelect = (customer: PendingCustomer) => {
    setSelectedCustomer(customer);
  };

  const handleApprove = (customerId: string) => {
    console.log('Approved customer:', customerId);
    alert('Tài khoản khách hàng đã được phê duyệt!');
    setSelectedCustomer(null);
  };

  const handleReject = (customerId: string) => {
    console.log('Rejected customer:', customerId);
    alert('Tài khoản khách hàng đã bị từ chối!');
    setSelectedCustomer(null);
  };

  const getDocumentStatus = (documents: PendingCustomer['documents']) => {
    const cccdComplete = documents.cccd.frontImage && documents.cccd.backImage;
    const gplxComplete = documents.gplx.frontImage && documents.gplx.backImage;
    
    if (cccdComplete && gplxComplete) {
      return { status: 'complete', text: 'Đầy đủ', color: 'text-green-600' };
    } else if (documents.cccd.frontImage || documents.gplx.frontImage) {
      return { status: 'partial', text: 'Thiếu tài liệu', color: 'text-yellow-600' };
    } else {
      return { status: 'none', text: 'Chưa có tài liệu', color: 'text-red-600' };
    }
  };

  if (selectedCustomer) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => setSelectedCustomer(null)}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Xác thực tài khoản: {selectedCustomer.name}
          </h1>
        </div>

        {/* Customer Information */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin khách hàng</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-600">Họ tên:</span>
              <span className="ml-2">{selectedCustomer.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Email:</span>
              <span className="ml-2">{selectedCustomer.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Số điện thoại:</span>
              <span className="ml-2">{selectedCustomer.phone}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Ngày đăng ký:</span>
              <span className="ml-2">{selectedCustomer.registrationDate}</span>
            </div>
          </div>
        </div>

        {/* Document Review */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tài liệu đã tải lên</h2>
          
          {/* CCCD Documents */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Căn cước công dân (CCCD)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Mặt trước</h4>
                {selectedCustomer.documents.cccd.frontImage ? (
                  <img 
                    src={selectedCustomer.documents.cccd.frontImage} 
                    alt="CCCD mặt trước"
                    className="w-full h-40 object-cover border rounded-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Chưa tải lên</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Mặt sau</h4>
                {selectedCustomer.documents.cccd.backImage ? (
                  <img 
                    src={selectedCustomer.documents.cccd.backImage} 
                    alt="CCCD mặt sau"
                    className="w-full h-40 object-cover border rounded-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Chưa tải lên</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GPLX Documents */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Giấy phép lái xe (GPLX)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Mặt trước</h4>
                {selectedCustomer.documents.gplx.frontImage ? (
                  <img 
                    src={selectedCustomer.documents.gplx.frontImage} 
                    alt="GPLX mặt trước"
                    className="w-full h-40 object-cover border rounded-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Chưa tải lên</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Mặt sau</h4>
                {selectedCustomer.documents.gplx.backImage ? (
                  <img 
                    src={selectedCustomer.documents.gplx.backImage} 
                    alt="GPLX mặt sau"
                    className="w-full h-40 object-cover border rounded-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Chưa tải lên</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => handleApprove(selectedCustomer.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Phê duyệt tài khoản
          </button>
          <button
            onClick={() => handleReject(selectedCustomer.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <XCircleIcon className="w-5 h-5" />
            Từ chối tài khoản
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Xác thực tài khoản khách hàng</h1>
        <p className="text-gray-600 mt-2">
          Quản lý và xác thực tài khoản khách hàng đăng ký online
        </p>
      </div>

      {/* Pending Customers List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-orange-500" />
            Danh sách tài khoản chờ duyệt ({pendingCustomers.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingCustomers.map((customer) => {
            const docStatus = getDocumentStatus(customer.documents);
            return (
              <div
                key={customer.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleCustomerSelect(customer)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{customer.name}</h3>
                      <div className="text-sm text-gray-600">
                        {customer.email} • {customer.phone}
                      </div>
                      <div className="text-xs text-gray-500">
                        Đăng ký: {customer.registrationDate}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${docStatus.color}`}>
                      {docStatus.text}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <EyeIcon className="w-3 h-3" />
                      Nhấn để xem chi tiết
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {pendingCustomers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <ShieldCheckIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Không có tài khoản nào chờ duyệt</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineVerification;