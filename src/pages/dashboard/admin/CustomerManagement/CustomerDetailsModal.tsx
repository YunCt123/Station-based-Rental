import React from 'react';
import type { Customer } from '../../../../data/customersStore';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';

type Props = {
  customer?: Customer | null;
};

const CustomerDetailsModal: React.FC<Props> = ({ customer }) => {
  if (!customer) return <div className="p-6">Không tìm thấy khách hàng.</div>;

  const initials = customer.name
    .split(' ')
    .map((s) => s[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <div className="p-6">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-white mb-3">
          <span className="text-2xl text-gray-700">{initials}</span>
        </div>
        <h3 className="text-lg font-semibold text-blue-600 mb-1">{customer.name}</h3>
        <div className="text-sm text-gray-500 mb-4 flex gap-6 items-center">
          <div className="flex items-center gap-2"><MailOutlined />{customer.email ?? 'N/A'}</div>
          <div className="flex items-center gap-2"><PhoneOutlined />{customer.phone ?? 'N/A'}</div>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin khách hàng</h4>
        <dl className="divide-y divide-gray-200">
            <div className="py-2 flex justify-between text-sm">
            <dt className="text-gray-500">Tên khách hàng</dt>
            <dd className="text-gray-900">{customer.name}</dd>
          </div>
          <div className="py-2 flex justify-between text-sm">
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900">{customer.email}</dd>
          </div>
          <div className="py-2 flex justify-between text-sm">
            <dt className="text-gray-500">Số điện thoại</dt>
            <dd className="text-gray-900">{customer.phone}</dd>
          </div>
          <div className="py-2 flex justify-between text-sm">
            <dt className="text-gray-500">Số lượt thuê</dt>
            <dd className="text-gray-900">{customer.totalRentals}</dd>
          </div>
          <div className="py-2 flex justify-between text-sm">
            <dt className="text-gray-500">Rủi ro</dt>
            <dd>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  customer.risk === 'low'
                    ? 'bg-green-100 text-green-800'
                    : customer.risk === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {customer.risk}
              </span>
            </dd>
          </div>
          <div className="py-2 flex justify-between text-sm">
            <dt className="text-gray-500">Tạo lúc</dt>
            <dd className="text-gray-900">{customer.createdAt ? new Date(customer.createdAt).toLocaleString('vi-VN') : 'N/A'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
