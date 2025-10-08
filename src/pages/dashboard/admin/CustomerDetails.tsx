import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { findCustomer } from '../../../data/customersStore';
import {
  UserCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';

const CustomerDetails: React.FC = () => {
  const { id } = useParams();
  const customer = findCustomer(id);
  const activePath = location.pathname;

  if (!customer) {
    return (
      <div>
        <p className="text-sm text-gray-500">Khách hàng không tìm thấy.</p>
        <Link to="/admin/customers" className="text-blue-600">Quay lại</Link>
      </div>
    );
  }
  const navItems = [
  { id: 'profile', label: 'Hồ sơ khách hàng', icon: UserCircleIcon, path: '/admin/customers/profiles' },
  { id: 'history', label: 'Lịch sử thuê', icon: ClockIcon, path: '/admin/customers/history' },
  { id: 'complaints', label: 'Xử lý khiếu nại', icon: ExclamationTriangleIcon, path: '/admin/customers/complaints' },
  { id: 'risks', label: 'Danh sách có rủi ro', icon: DocumentTextIcon, path: '/admin/customers/blacklist', badge: 'New' }
];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Chi tiết khách hàng</h3>
        <Link to="/admin/customers/profiles" className="text-sm text-blue-600">Quay lại danh sách</Link>
      </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
       {/* Left nav */}
              <aside className="lg:col-span-1 bg-white rounded-lg shadow p-4">
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`block w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left hover:bg-gray-50 ${
                        activePath === item.path || activePath.startsWith(item.path + '/') ? 'bg-blue-50 ring-1 ring-blue-200' : ''
                      }`}>
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{item.badge}</span>
                      ) : null}
                    </Link>
                  ))}
                </nav>
              </aside>
      

      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-md p-4 shadow">
          <p className="text-sm text-gray-500">Tên</p>
          <p className="font-medium">{customer.name}</p>
        </div>
        <div className="bg-white rounded-md p-4 shadow">
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{customer.email}</p>
        </div>
        <div className="bg-white rounded-md p-4 shadow">
          <p className="text-sm text-gray-500">Số điện thoại</p>
          <p className="font-medium">{customer.phone}</p>
        </div>
        <div className="bg-white rounded-md p-4 shadow">
          <p className="text-sm text-gray-500">Tổng lượt thuê</p>
          <p className="font-medium">{customer.totalRentals}</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CustomerDetails;
