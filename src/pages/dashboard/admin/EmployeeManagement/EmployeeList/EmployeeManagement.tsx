import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Modal, Spin, Alert, message } from 'antd';
import { EditOutlined, EyeOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Employee } from '../../../../../data/employeesStore';
import userService, { type UserProfile } from '@/services/userService';
import EmployeeDetail from './EmployeeDetail';
import EditEmployee from './EditEmployee';
// Delete is currently not supported via API

const { Search } = Input;

// Map backend user profile to local Employee view type expected by UI components
function mapToEmployee(u: UserProfile): Employee {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phoneNumber,
    role: (u.role === 'admin' ? 'admin' : 'staff') as Employee['role'],
    status: u.verificationStatus === 'APPROVED' ? 'active' : 'inactive',
    createdAt: u.createdAt,
  };
}

const EmployeeManagement: React.FC = () => {
  const [query, setQuery] = useState('');
  const [list, setList] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  // Delete state removed (no API for delete)

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.listUsers({ page: 1, limit: 200 });
      const users: UserProfile[] = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
      // Only staff and admin
      const employees = users.filter(u => u.role === 'staff' || u.role === 'admin').map(mapToEmployee);
      setList(employees);
    } catch (e: any) {
      setError(e?.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const refresh = () => fetchEmployees();

  // Adding employees via API is not supported here; keep modal for edit only

  const openEdit = (record: Employee) => {
    setEditing(record);
    setModalOpen(true);
  };

  // Delete handler removed

  // Confirm delete removed

  const handleSave = async (values: Partial<Employee>) => {
    if (!editing) return;
    setSaving(true);
    try {
      await userService.updateUser(editing.id, {
        name: values.name,
        phoneNumber: values.phone,
      });
      message.success('Cập nhật thông tin nhân viên thành công');
      setModalOpen(false);
      refresh();
    } catch (e: any) {
      message.error(`Cập nhật thất bại: ${e?.message || 'Vui lòng thử lại sau'}`);
      setModalOpen(false);
    } finally {
      setSaving(false);
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
                  <Button onClick={refresh} icon={<ReloadOutlined />}>Làm mới</Button>
                </div>
              </div>
              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Tổng số nhân viên</div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">{list.length}</div>
                    {/* <div className="text-sm text-green-500 mt-1">+0% so với tháng trước</div> */}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserOutlined className="text-blue-600 text-lg" />
                  </div>
                </div>
                {/* placeholder cards to match layout - optional */}
                  
              </div>


              <div>
                {error && (
                  <Alert type="error" message="Lỗi tải dữ liệu" description={error} showIcon className="mb-4" />
                )}
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
                    {loading && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center"><Spin /></td>
                      </tr>
                    )}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-gray-500">Không có nhân viên phù hợp</td>
                      </tr>
                    )}
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
                          {/* Delete is disabled since API endpoint not available */}

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
        <EditEmployee employee={editing} saving={saving} onCancel={() => setModalOpen(false)} onSave={handleSave} />
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

      {/* Delete modal removed - no API */}
    </div>
  );
};

export default EmployeeManagement;
