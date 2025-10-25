import React from 'react';
import { Button } from 'antd';
import type { Employee } from '../../../../../data/employeesStore';

type Props = {
  employee?: Employee | null;
  onCancel: () => void;
  onConfirm: () => void;
};

const DeleteEmployee: React.FC<Props> = ({ employee, onCancel, onConfirm }) => {
  if (!employee) return null;

  return (
    <div>
      <p className="text-sm text-gray-700">Bạn có chắc chắn muốn xoá nhân viên sau?</p>
      <div className="mt-4">
        <div className="text-sm text-gray-500">Tên</div>
        <div className="text-base font-medium">{employee.name}</div>
        <div className="text-sm text-gray-500 mt-2">Email</div>
        <div className="text-base">{employee.email || '-'}</div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button onClick={onCancel}>Hủy</Button>
        <Button danger type="primary" onClick={onConfirm}>Xoá</Button>
      </div>
    </div>
  );
};

export default DeleteEmployee;
