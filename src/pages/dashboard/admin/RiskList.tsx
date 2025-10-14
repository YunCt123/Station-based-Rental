import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon, ClockIcon, ExclamationTriangleIcon,DocumentTextIcon } from '@heroicons/react/24/outline';

const RiskList: React.FC = () => {
  const activePath = location.pathname;
    
      const navItems = [
      { id: 'profile', label: 'Hồ sơ khách hàng', icon: UserCircleIcon, path: '/admin/customers/profiles' },
      { id: 'history', label: 'Lịch sử thuê', icon: ClockIcon, path: '/admin/customers/history' },
      { id: 'complaints', label: 'Xử lý khiếu nại', icon: ExclamationTriangleIcon, path: '/admin/customers/complaints' },
      { id: 'risks', label: 'Danh sách có rủi ro', icon: DocumentTextIcon, path: '/admin/customers/blacklist', badge: 'New' }
    ];
  return (
    <div className="space-y-4">
               <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">Danh sách rủi ro</h1>
                        
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
        
                <main className="lg:col-span-3 bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Danh sách rủi ro</h3>
                  <p className="text-sm text-gray-500">Chức năng đang được phát triển...</p>
                </main>
              </div>
              
            </div>
  );
};

export default RiskList;
