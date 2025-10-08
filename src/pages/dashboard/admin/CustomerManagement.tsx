import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  UserCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { Modal } from 'antd';
import NewCustomer from './NewCustomer';

const navItems = [
  { id: 'profile', label: 'Hồ sơ khách hàng', icon: UserCircleIcon, path: '/admin/customers/profiles' },
  { id: 'history', label: 'Lịch sử thuê', icon: ClockIcon, path: '/admin/customers/history' },
  { id: 'complaints', label: 'Xử lý khiếu nại', icon: ExclamationTriangleIcon, path: '/admin/customers/complaints' },
  { id: 'risks', label: 'Danh sách có rủi ro', icon: DocumentTextIcon, path: '/admin/customers/blacklist', badge: 'New' }
];

import { getCustomers } from '../../../data/customersStore';

export const CustomerManagement: React.FC = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const [list, setList] = useState(() => getCustomers());
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    // refresh customer list when location changes (simple approach)
    setList(getCustomers());
  }, [location.pathname]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý khách hàng </h1>
          
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          <span>Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

        {/* Content area */}
        <main className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Base list view at /admin/customers */}
            {activePath === '/admin/customers/profiles' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Hồ sơ khách hàng</h2>
                  <button onClick={() => setCreateOpen(true)} className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">
                    <PlusCircleIcon className="w-4 h-4 mr-2" /> Thêm khách hàng
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng lượt thuê</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rủi ro</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {list.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.totalRentals}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              c.risk === 'low' ? 'bg-green-100 text-green-800' : c.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>{c.risk}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <Link to={`/admin/customers/profiles/${c.id}`} className="inline-flex items-center text-sm text-blue-600">
                              <EyeOutlined className="mr-2" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Nested routes will render here */}
            <Outlet />
          </div>
          <Modal open={createOpen} title="Thêm khách hàng" onCancel={() => setCreateOpen(false)} footer={null}>
            <NewCustomer
              onCreate={() => {
                // refresh list after creation
                setList(getCustomers());
              }}
              onClose={() => setCreateOpen(false)}
            />
          </Modal>

          {/* small help panel */}
          
        </main>
      </div>
    </div>
  );
};

export default CustomerManagement;
