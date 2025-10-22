import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined,EyeOutlined, UserOutlined } from '@ant-design/icons';
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../../../../data/employeesStore';
import type { Employee } from '../../../../../data/employeesStore';
import EmployeeDetail from './EmployeeDetail';
import EditEmployee from './EditEmployee';
import DeleteEmployee from './DeleteEmployee';

const { Search } = Input;

const EmployeeManagement: React.FC = () => {
  const [query, setQuery] = useState('');
  const [list, setList] = useState<Employee[]>(() => getEmployees());
  // loading state omitted (not needed for this simple local store)

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Employee | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Employee | null>(null);

  useEffect(() => {
    setList(getEmployees());
  }, []);

  const refresh = () => setList(getEmployees());

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (record: Employee) => {
    setEditing(record);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // open delete confirmation modal
    const emp = list.find((i) => i.id === id) || null;
    setDeleting(emp);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteEmployee(deleting.id);
    setDeleteOpen(false);
    setDeleting(null);
    refresh();
  };

  const handleSave = (values: Partial<Employee>) => {
    if (editing) {
      updateEmployee(editing.id, values);
    } else {
      addEmployee(values as any);
    }
    setModalOpen(false);
    refresh();
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
              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Tổng số nhân viên</div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">{list.length}</div>
                    <div className="text-sm text-green-500 mt-1">+0% so với tháng trước</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserOutlined className="text-blue-600 text-lg" />
                  </div>
                </div>
                {/* placeholder cards to match layout - optional */}
                <div className="bg-white rounded-lg shadow p-6 hidden lg:flex items-center justify-between">
                  <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                     <div>
                    <div className="text-sm text-gray-500">Số nhân viên hoạt động</div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">{list.filter(emp => emp.status === 'active').length}</div>
                    <div className="text-sm text-green-500 mt-1">+0% so với tháng trước</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserOutlined className="text-blue-600 text-lg" />
                  </div>
                  </div>
                </div>
                
              </div>

              
              <div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">ID</th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">Tên nhân viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider ">Role</th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider "></th>
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
                            <Button type='text' onClick={() => { setViewing(emp); setViewOpen(true); }}>
                              <EyeOutlined className='!text-blue-600 text-lg' />
                            </Button>

                            <Button type='text'>
                              <EditOutlined className="ml-4 text-lg" onClick={() => openEdit(emp)} />
                            </Button>

                            <Button type='text'
                            
                            >
                              <DeleteOutlined
                                className="ml-4 !text-red-600 text-lg"
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
        open={modalOpen}
        footer={null}
        width={700}
        onCancel={() => setModalOpen(false)}
      >
        <EditEmployee employee={editing} onCancel={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>

      <Modal
        
        open={viewOpen}
        footer={null}
        width={800}
        onCancel={() => { setViewOpen(false); setViewing(null); }}
      >
        {/* Lazy render detail component */}
        {viewing ? <EmployeeDetail employee={viewing} /> : null}
      </Modal>

      <Modal
                  title="Xoá nhân viên"
                  open={deleteOpen}
                  footer={null}
                  onCancel={() => { setDeleteOpen(false); setDeleting(null); }}
                >
                  {deleting ? (
                    <DeleteEmployee
                      employee={deleting}
                      onCancel={() => { setDeleteOpen(false); setDeleting(null); }}
                      onConfirm={confirmDelete}
                    />
                  ) : null}
                </Modal>
    </div>
  );
};

export default EmployeeManagement;
