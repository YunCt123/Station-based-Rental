import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Modal, Form, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined,EyeOutlined } from '@ant-design/icons';
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../../../../data/employeesStore';
import type { Employee } from '../../../../../data/employeesStore';

const { Search } = Input;

const EmployeeManagement: React.FC = () => {
  const [query, setQuery] = useState('');
  const [list, setList] = useState<Employee[]>(() => getEmployees());
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setList(getEmployees());
  }, []);

  const refresh = () => setList(getEmployees());

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Employee) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    refresh();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editing) {
        updateEmployee(editing.id, values);
      } else {
        addEmployee(values);
      }
      setModalOpen(false);
      refresh();
    } finally {
      setLoading(false);
    }
  };

  const filtered = list.filter((e) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.phone || '').toLowerCase().includes(q)
    );
  });

  

  return (
    <div className="space-y-6">
      <div>
        <Button type="text" className="px-0">
          <Link to="/admin/dashboard" className="text-sm">← Back to dashboard</Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <main className="lg:col-span-8 space-y-6">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold mb-4">Quản lý nhân viên</h2>
                <div className="flex items-center space-x-3">
                  <Search
                    placeholder="Tìm theo tên, email hoặc số điện thoại"
                    allowClear
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onSearch={(val) => setQuery(val)}
                    style={{ width: 360 }}
                  />
                  <Button type="primary" onClick={openAdd} icon={<PlusOutlined />}>
                    Thêm nhân viên
                  </Button>
                </div>
              </div>
              <div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider !font-bold">ID</th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider !font-bold">Tên nhân viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider !font-bold">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider !font-bold">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider !font-bold">Role</th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider !font-bold"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filtered.map((emp) => (
                        <tr key={emp.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.email || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.phone || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.role}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <Button 
                            type='text'
                            
                            >
                              <EyeOutlined className='!text-blue-600' />
                              </Button>

                            <Button type='text'>
                              <EditOutlined className="ml-4" onClick={() => openEdit(emp)} />
                            </Button>

                            <Button type='text'
                            
                            >
                              <DeleteOutlined
                                className="ml-4 !text-red-600"
                                onClick={() => handleDelete(emp.id)}
                              />
                            </Button>

                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>

              
            </div>
          </main>
        </div>
      </div>

      <Modal
        title={editing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={loading}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical" initialValues={{ role: 'staff', status: 'active' }}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
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
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;
