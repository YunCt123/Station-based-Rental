import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ClockIcon } from "@heroicons/react/24/outline";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import { Button, Input } from "antd";
import { getCustomers } from "../../../data/customersStore";
import { DeleteOutlined } from "@ant-design/icons";

export const CustomerManagement: React.FC = () => {
  const location = useLocation();
  const activePath = location.pathname;
  const [list, setList] = useState(() => getCustomers());
  const [query, setQuery] = useState("");

  useEffect(() => {
    setList(getCustomers());
  }, [location.pathname]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button>
          <Link to="/admin/dashboard">← Back to dashboard</Link>
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

                    {/* <button onClick={() => setCreateOpen(true)} className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">
                      <PlusCircleIcon className="w-4 h-4 mr-2" /> Thêm khách hàng
                    </button> */}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-center">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số điện thoại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tổng lượt thuê
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rủi ro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
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
                            <Link
                              to={`/admin/customers/profiles/${c.id}`}
                              className="inline-flex items-center text-sm text-blue-600"
                            >
                              <EyeOutlined className="mr-7 text-xl" />
                            </Link>
                            <Link
                              to={`/admin/customers/profiles/${c.id}/edit`}
                              className="inline-flex items-center text-sm text-blue-600"
                            >
                              <EditOutlined className="mr-7 text-xl" />
                            </Link>
                            <Link
                              to={`/admin/customers/profiles/${c.id}/delete`}
                              className="inline-flex items-center text-sm text-blue-600"
                            >
                              <DeleteOutlined className="mr-7 !text-red-600 text-xl" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Nested routes will render here */}
            <Outlet />
          </div>
          {/* <Modal open={createOpen} title="Thêm khách hàng" onCancel={() => setCreateOpen(false)} footer={null}>
            <NewCustomer
              onCreate={() => {
                // refresh list after creation
                setList(getCustomers());
              }}
              onClose={() => setCreateOpen(false)}
            />
          </Modal> */}

          {/* small help panel */}
        </main>
      </div>
    </div>
  );
};

export default CustomerManagement;
