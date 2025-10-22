import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ClockIcon } from "@heroicons/react/24/outline";
import { Button, Input, Modal } from "antd";
import NewCustomer from './NewCustomer.tsx';
import EditCustomer from './EditCustomer.tsx';
import { getCustomers, findCustomer } from "../../../../data/customersStore.ts";
import CustomerDetailsModal from './CustomerDetailsModal.tsx';
import { DeleteOutlined,PlusOutlined, EyeOutlined,EditOutlined } from "@ant-design/icons";
import DeleteCustomer from './DeleteCustomer.tsx';

export const CustomerManagement: React.FC = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const [list, setList] = useState(() => getCustomers());
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false); // Keep one declaration
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null); // Keep one declaration
  

  useEffect(() => {
    setList(getCustomers());
  }, [location.pathname]); 

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
                    />

                     <button onClick={() => setCreateOpen(true)} className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">
                      <PlusOutlined className="w-4 h-4 mr-2" /> Thêm khách hàng
                    </button> 
                  </div>
                </div>

                <div className="overflow-x-auto">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Tổng lượt thuê
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                          Rủi ro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {list.map((c) => (
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
                          <td className="px-18 py-4 whitespace-nowrap text-sm text-gray-500">
                            {c.totalRentals}
                          </td>
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
                
                setList(getCustomers());
                setCreateOpen(false);
              }}
              onClose={() => setCreateOpen(false)}
            />
          </Modal>

          {/* popup view  */}
          <Modal open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={2000} centered bodyStyle={{ padding: 24 }}>
            <CustomerDetailsModal customer={selectedCustomerId ? findCustomer(selectedCustomerId) : null} />
          </Modal>

            {/* popup edit */}
          <Modal open={editOpen} onCancel={() => setEditOpen(false)} footer={null} width={720} centered>
            <EditCustomer
              id={editCustomerId}
              onUpdate={() => {
                setList(getCustomers());
                setEditOpen(false);
              }}
              onClose={() => setEditOpen(false)}
            />
          </Modal>

              {/* popup delete */}
          <Modal open={deleteOpen} onCancel={() => setDeleteOpen(false)} footer={null} width={400} centered>
            <DeleteCustomer id={deleteCustomerId} />
            
          </Modal>
        </main>
      </div>
    </div>
    
  );
};

export default CustomerManagement;
