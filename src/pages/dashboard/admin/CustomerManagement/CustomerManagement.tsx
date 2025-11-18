import React, { useEffect, useState, useCallback } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ClockIcon } from "@heroicons/react/24/outline";
import { Button, Input, Modal, Spin, Alert } from "antd";
import NewCustomer from './NewCustomer.tsx';
import EditCustomer from './EditCustomer.tsx';
import CustomerDetailsModal from './CustomerDetailsModal.tsx';
import { DeleteOutlined,PlusOutlined, EyeOutlined,EditOutlined ,UserOutlined, ReloadOutlined } from "@ant-design/icons";
import DeleteCustomer from './DeleteCustomer.tsx';
import userService, { type UserProfile } from "../../../../services/userService.ts";

// Local view model to keep existing table columns until BE expands
interface CustomerRow {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalRentals: number; // Placeholder (requires separate rentals aggregation endpoint)
  risk: 'low' | 'medium' | 'high'; // Derived from verification / role for now
  raw: UserProfile;
}

export const CustomerManagement: React.FC = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const [list, setList] = useState<CustomerRow[]>([]);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false); // Keep one declaration
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null); // Keep one declaration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const buildRows = useCallback((users: UserProfile[]): CustomerRow[] => {
    return users.map(u => {
      // Derive risk: simplistic placeholder mapping
      // APPROVED => low, PENDING => medium, REJECTED => high
      const risk: 'low' | 'medium' | 'high' = u.verificationStatus === 'APPROVED'
        ? 'low'
        : u.verificationStatus === 'REJECTED'
          ? 'high'
          : 'medium';
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phoneNumber,
        totalRentals: 0, // TODO: integrate rentals count endpoint when available
        risk,
        raw: u
      };
    });
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.listUsers({ page: 1, limit: 100 });
      // Handle both shapes: array of users OR object with .data
      const users: UserProfile[] = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
          ? res.data
          : [];
      const rows = buildRows(users);
      setList(rows);
    } catch (e: any) {
      setError(e?.message || 'Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, [buildRows]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = list.filter((c: CustomerRow) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  });

  return (
    
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <Button type="text" className="px-0">
          <Link to="/admin/dashboard" className="text-sm">← Back to dashboard</Link>
        </Button>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          <span>Cập nhật lúc: {new Date().toLocaleTimeString("vi-VN")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Content area */}
        
        <main className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Base list view at /admin/customers */}
            {activePath === "/admin/customers/customer_management" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Quản Lý Khách Hàng
                  </h2>
                  <div className="flex items-center space-x-3">
                    <Input.Search
                      placeholder="Tìm theo tên, email hoặc số điện thoại"
                      allowClear
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onSearch={(val) => setQuery(val)}
                      style={{ width: 360 }}
                      loading={loading}
                    />

                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => fetchUsers()}
                      loading={loading}
                    >
                      Làm mới
                    </Button>

                     <button onClick={() => setCreateOpen(true)} className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">
                      <PlusOutlined className="w-4 h-4 mr-2" /> Thêm khách hàng
                    </button> 
                  </div>
                </div>
                {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Tổng số khách hàng</div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">{list.length}</div>
                    {/* <div className="text-sm text-green-500 mt-1">+0% so với tháng trước</div> */}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserOutlined className="text-blue-600 text-lg" />
                  </div>
                </div>
                {/* placeholder cards to match layout - optional */}
                
                  <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                     <div>
                    <div className="text-sm text-gray-500">Tổng số lượt thuê</div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">{list.reduce((acc: number, c: CustomerRow) => acc + c.totalRentals, 0)}</div>
                    {/* <div className="text-sm text-green-500 mt-1">+0% so với tháng trước</div> */}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserOutlined className="text-blue-600 text-lg" />
                  </div>
                  </div>
                
                
              </div>

                <div className="overflow-x-auto">
                  {error && (
                    <Alert
                      type="error"
                      showIcon
                      message="Lỗi tải dữ liệu"
                      description={error}
                      className="mb-4"
                    />
                  )}
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200 text-center  ">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Tên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Số điện thoại
                        </th>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Tổng lượt thuê
                        </th> */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Rủi ro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center">
                            <Spin />
                          </td>
                        </tr>
                      )}
                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-sm text-gray-500">Không tìm thấy khách hàng phù hợp</td>
                        </tr>
                      )}
                      {!loading && filtered.map((c: CustomerRow) => (
                        <tr key={c.id} className="hover:bg-gray-50 ">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {c.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {c.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {c.phone}
                          </td>
                          {/* <td className="px-18 py-4 whitespace-nowrap text-sm text-gray-500">
                            {c.totalRentals}
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                c.risk === "low"
                                  ? "bg-green-100 text-green-800"
                                  : c.risk === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {c.risk}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <Button
                              type="text"
                              onClick={() => {
                                setSelectedCustomerId(c.id);
                                setDetailOpen(true);
                              }}
                              className="inline-flex items-center text-sm !text-blue-700 mr-4 hover:text-blue-600"
                              aria-label={`Xem chi tiết ${c.name}`}
                            >
                              <EyeOutlined className="mr-2 text-xl" />
                            </Button>
                            <Button
                              type="text"
                              onClick={() => {
                                setEditCustomerId(c.id);
                                setEditOpen(true);
                              }}
                              className="inline-flex items-center text-sm text-gray-600 mr-4"
                              aria-label={`Sửa ${c.name}`}
                            >
                              <EditOutlined className="text-xl" />
                            </Button>
                            <Button
                              type="text"
                              className="inline-flex items-center text-sm text-red-600"
                              onClick={() => {
                                setDeleteCustomerId(c.id);
                                setDeleteOpen(true);
                              }}
                            >
                              <DeleteOutlined className="mr-7 !text-red-600 text-xl" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}           
            <Outlet />
          </div>


          <Modal open={createOpen}  onCancel={() => setCreateOpen(false)} footer={null}>
            <NewCustomer
              onCreate={() => {
                fetchUsers();
                setCreateOpen(false);
              }}
              onClose={() => setCreateOpen(false)}
            />
          </Modal>

          {/* popup view  */}
          <Modal open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={900} centered styles={{ body: { padding: 24 } }}>
            <CustomerDetailsModal 
              user={selectedCustomerId ? list.find((c: CustomerRow) => c.id === selectedCustomerId)?.raw : null} 
            />
          </Modal>

            {/* popup edit */}
          <Modal open={editOpen} onCancel={() => setEditOpen(false)} footer={null} width={640} centered styles={{ body: { padding: 24 } }}>
            <EditCustomer
              user={editCustomerId ? list.find(r => r.id === editCustomerId)?.raw : null}
              onUpdate={(updated) => {
                // Update list in place
                setList(prev => prev.map(row => row.id === updated._id ? { ...row, name: updated.name, phone: updated.phoneNumber, raw: updated } : row));
                setEditOpen(false);
              }}
              onClose={() => setEditOpen(false)}
            />
          </Modal>

              {/* popup delete */}
          <Modal open={deleteOpen} onCancel={() => setDeleteOpen(false)} footer={null} width={420} centered styles={{ body: { padding: 24 } }}>
            <DeleteCustomer 
              userId={deleteCustomerId}
              userName={deleteCustomerId ? list.find(r => r.id === deleteCustomerId)?.name : null}
              onDeleted={(uid) => {
                setList(prev => prev.filter(r => r.id !== uid));
                setDeleteOpen(false);
              }}
              onClose={() => setDeleteOpen(false)}
            />
          </Modal>
        </main>
      </div>
    </div>
    
  );
};

export default CustomerManagement;
