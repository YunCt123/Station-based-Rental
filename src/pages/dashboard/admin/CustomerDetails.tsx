import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { findCustomer } from '../../../data/customersStore';

const CustomerDetails: React.FC = () => {
  const { id } = useParams();
  const customer = findCustomer(id);

  if (!customer) {
    return (
      <div>
        <p className="text-sm text-gray-500">Khách hàng không tìm thấy.</p>
        <Link to="/admin/customers" className="text-blue-600">Quay lại</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Chi tiết khách hàng</h3>
        <Link to="/admin/customers" className="text-sm text-blue-600">Quay lại danh sách</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  );
};

export default CustomerDetails;
