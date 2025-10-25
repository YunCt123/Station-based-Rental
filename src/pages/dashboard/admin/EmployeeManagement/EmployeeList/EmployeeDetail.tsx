import React from 'react';
import type { Employee } from '../../../../../data/employeesStore';
import { MailOutlined, PhoneOutlined } from '@ant-design/icons';

type Props = {
  employee?: Employee | null;
};

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString('vi-VN') : '-');

function initials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const cls = status === 'active' ? 'bg-green-100 text-green-800' : status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800';
  return <span className={`px-3 py-1 rounded-full text-xs ${cls}`}>{status || '-'}</span>;
};

const EmployeeDetail: React.FC<Props> = ({ employee }) => {
  if (!employee) return null;

  return (
    <div className="w-full">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">Chi tiết nhân viên</h2>
      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-700">
          {initials(employee.name)}
        </div>
        <h3 className="mt-4 text-xl font-semibold text-blue-600">{employee.name}</h3>
        <div className="mt-2 text-sm text-gray-600 flex items-center space-x-4">
          <div className="flex items-center space-x-2"><MailOutlined /> <span>{employee.email || '-'}</span></div>
          <div className="flex items-center space-x-2"><PhoneOutlined /> <span>{employee.phone || '-'}</span></div>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Thông tin nhân viên</h4>
        <div className="space-y-3 bg-white rounded-md overflow-hidden divide-y">
          <div className="flex justify-between px-6 py-3">
            <div className="text-sm text-gray-500">Tên nhân viên</div>
            <div className="text-sm text-gray-900">{employee.name}</div>
          </div>
          <div className="flex justify-between px-6 py-3">
            <div className="text-sm text-gray-500">Email</div>
            <div className="text-sm text-gray-900">{employee.email || '-'}</div>
          </div>
          <div className="flex justify-between px-6 py-3">
            <div className="text-sm text-gray-500">Số điện thoại</div>
            <div className="text-sm text-gray-900">{employee.phone || '-'}</div>
          </div>
          <div className="flex justify-between px-6 py-3">
            <div className="text-sm text-gray-500">Vai trò</div>
            <div className="text-sm text-gray-900">{employee.role || '-'}</div>
          </div>
          <div className="flex justify-between px-6 py-3">
            <div className="text-sm text-gray-500">Trạng thái</div>
            <div className="text-sm text-gray-900"><StatusBadge status={employee.status} /></div>
          </div>
          <div className="flex justify-between px-6 py-3">
            <div className="text-sm text-gray-500">Tạo lúc</div>
            <div className="text-sm text-gray-900">{formatDate(employee.createdAt)}</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EmployeeDetail;
