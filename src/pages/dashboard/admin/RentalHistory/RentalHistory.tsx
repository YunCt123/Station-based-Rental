import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Input, Spin, Alert } from 'antd';
import rentalService, { type StationRental } from '../../../../services/rentalService';
import { useCurrency } from '../../../../lib/currency';

const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString('vi-VN') : '-';

const RentalHistory: React.FC = () => {
  const { formatPrice } = useCurrency();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StationRental['status']>('all');
  const [rentals, setRentals] = useState<StationRental[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // detail view is navigated to a separate page now

  const loadRentals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalService.getAllRentals();
      setRentals(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không thể tải dữ liệu.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, []);

  // Apply filters to the rental list (client-side)
  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rentals.filter((r) => {
      const matchesQuery =
        q === '' ||
        r.user_id?.name?.toLowerCase().includes(q) ||
        r.user_id?.email?.toLowerCase().includes(q) ||
        (r.user_id?.phoneNumber || '').toLowerCase().includes(q) ||
        r.vehicle_id?.name?.toLowerCase().includes(q) ||
        (r.vehicle_id?.licensePlate || '').toLowerCase().includes(q) ||
        (r.station_id?.name || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rentals, query, statusFilter]);

  // view handlers removed; navigation handled via Link
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button type="text" className="px-0">
          <Link to="/admin/dashboard" className="text-sm">← Back to dashboard</Link>
        </Button>

      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lịch sử thuê</h1>
            <p className="text-sm text-gray-500">Xem lịch sử đặt/thuê xe theo khách hàng và trạng thái</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Input.Search
              placeholder="Tìm theo tên, email hoặc số điện thoại"
              allowClear
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onSearch={(val) => setQuery(val)}
              style={{ width: 360 }}
            />
            <select className="border rounded-md px-2 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StationRental['status'] | 'all')}>
              <option value="all">Tất cả</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="ONGOING">Đang chạy</option>
              <option value="CANCELLED">Đã huỷ</option>
            </select>
            <Button onClick={loadRentals} icon={<ReloadOutlined />}>
              Làm mới
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} showIcon />
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-10 flex justify-center"><Spin /></div>
          ) : (
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Tên khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Xe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Trạm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Bắt đầu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Kết thúc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Giá thuê</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredList.map((r: StationRental) => {
                return (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.user_id?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.vehicle_id?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.station_id?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(r.pickup?.at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(r.return?.at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : r.status === 'ONGOING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {r.status === 'COMPLETED' ? 'Hoàn thành' : r.status === 'ONGOING' ? 'Đang chạy' : r.status === 'CANCELLED' ? 'Đã huỷ' : r.status}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(r.pricing_snapshot?.total_price ?? 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <Link to={`/admin/customers/history/${r._id}`} className="inline-flex items-center text-sm text-blue-700 mr-4 hover:text-blue-600">
                        <EyeOutlined className="mr-2 text-xl" />
                      </Link>
                    </td>


                  </tr>
                );
              })}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">Không tìm thấy bản ghi.</td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
        {/* Detail modal removed; use dedicated page */}
      </div>
    </div>
  );
};

export default RentalHistory;

