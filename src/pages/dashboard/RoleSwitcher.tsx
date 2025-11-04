import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';


const RoleSwitcher: React.FC = () => {
  const navigate = useNavigate();

  // Check if user is customer and redirect automatically
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser?.role === 'customer') {
      navigate('/my-rentals');
      return;
    }
  }, [navigate]);

  const setUserRole = (role: 'admin' | 'station_staff', userInfo?: {
    name: string;
    email: string;
    avatar: string | null;
  }) => {
    localStorage.setItem('userRole', role);
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  };

  const handleSetAdminRole = () => {
    setUserRole('admin', {
      name: 'Nguyễn Văn Admin',
      email: 'admin@stationrental.com',
      avatar: null
    });
    navigate('/admin/dashboard');
  };

  const handleSetStaffRole = () => {
    setUserRole('station_staff', {
      name: 'Trần Thị Staff',
      email: 'staff@stationrental.com',  
      avatar: null
    });
    navigate('/staff/dashboard');
  };

  const handleGoToMainSite = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">EV</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hệ thống quản lý trạm thuê xe điện
          </h1>
          <p className="text-lg text-gray-600">
            Chọn vai trò để trải nghiệm dashboard tương ứng
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold mb-6 text-center">Demo Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <button
              onClick={handleSetAdminRole}
              className="group p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                  <svg className="w-8 h-8 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quản trị viên</h3>
                <p className="text-sm text-gray-600">
                  Quản lý toàn hệ thống, báo cáo, phân tích dữ liệu
                </p>
              </div>
            </button>

            <button
              onClick={handleSetStaffRole}
              className="group p-6 border-2 border-green-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 group-hover:bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                  <svg className="w-8 h-8 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nhân viên trạm</h3>
                <p className="text-sm text-gray-600">
                  Quản lý giao/nhận xe, thanh toán tại trạm
                </p>
              </div>
            </button>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={handleGoToMainSite}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Về trang chủ khách hàng
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Tính năng Sidebar System:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Menu động dựa trên vai trò người dùng
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Sidebar có thể thu gọn/mở rộng
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Hỗ trợ menu con và badge thông báo
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Tự động highlight menu item đang active
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcher;