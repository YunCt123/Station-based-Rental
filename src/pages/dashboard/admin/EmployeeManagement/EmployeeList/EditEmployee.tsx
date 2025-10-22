import React, { useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import type { Employee } from '../../../../../data/employeesStore';

type Props = {
  employee?: Employee | null;
  onCancel: () => void;
  onSave: (values: Partial<Employee>) => void;
  saving?: boolean;
};

const EditEmployee: React.FC<Props> = ({ employee, onCancel, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      name: employee?.name || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      role: employee?.role || 'staff',
      status: employee?.status || 'active',
    });
  }, [employee]);

  const submit = async () => {
    const vals = await form.validateFields();
    onSave(vals);
  };

  return (
    
    <Form form={form} layout="vertical">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">Cập nhật nhân viên</h2>
      <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email">
        <Input />
      </Form.Item>
      <Form.Item name="phone" label="Số điện thoại">
        <Input />
      </Form.Item>
      <Form.Item name="role" label="Vai trò">
        <Select>
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="manager">Manager</Select.Option>
          <Select.Option value="staff">Staff</Select.Option>
          <Select.Option value="support">Support</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="status" label="Trạng thái">
        <Select>
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="inactive">Inactive</Select.Option>
          <Select.Option value="suspended">Suspended</Select.Option>
        </Select>
      </Form.Item>
      <div className="flex justify-end space-x-2 mt-4">
        <button type="button" className="px-3 py-1.5 border rounded-md" onClick={onCancel}>Hủy</button>
        <button type="button" className="px-3 py-1.5 bg-blue-600 text-white rounded-md" onClick={submit}>Lưu</button>
      </div>
    </Form>
  );
};

export default EditEmployee;
