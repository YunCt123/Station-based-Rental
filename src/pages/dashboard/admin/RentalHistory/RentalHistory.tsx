import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRentals, findRental, addRental, updateRental, deleteRental, resetRentals } from '../../../../data/rentalsStore';
import type { Rental as RentalType } from '../../../../data/rentalsStore';
import { DeleteOutlined, EyeOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Select, InputNumber } from 'antd';
// Use Rental type from the store for consistent shape
type Rental = RentalType;

const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString('vi-VN') : '-';

const RentalHistory: React.FC = () => {

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Rental['status']>('all');
  const [allRentals, setAllRentals] = useState(() => getRentals());
  const [viewVisible, setViewVisible] = useState(false);
  const [selected, setSelected] = useState<Rental | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<Rental>>({});

  useEffect(() => {
    setAllRentals(getRentals());
  }, []);

  // Apply filters to the rental list
  const filteredList = allRentals.filter(rental => {
    // Filter by search query
    const matchesQuery = query === '' || 
      rental.name?.toLowerCase().includes(query.toLowerCase()) ||
      rental.customerId?.toLowerCase().includes(query.toLowerCase()) ||
      rental.vehicleId?.toLowerCase().includes(query.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
    
    return matchesQuery && matchesStatus;
  });

  const openView = (id: string) => {
    const r = findRental(id);
    if (!r) return;
    setSelected(r);
    setViewVisible(true);
  };

  const closeView = () => {
    setViewVisible(false);
    setSelected(null);
  };

  const openAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormValues({
      name: '',
      customerId: undefined,
      vehicleId: '',
      startAt: new Date().toISOString(),
      endAt: undefined,
      status: 'ongoing',
      priceCents: 0,
      notes: '',
    });
    setFormVisible(true);
  };

  const openEdit = (id: string) => {
    const r = findRental(id);
    if (!r) return;
    setIsEditing(true);
    setEditingId(id);
    setFormValues({ ...r });
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setIsEditing(false);
    setEditingId(null);
    setFormValues({});
  };

  const handleFormChange = (field: keyof Rental, value: any) => {
    setFormValues(prev => ({ ...(prev as any), [field]: value }));
  };

  const submitForm = () => {
    const payload: any = {
      name: String(formValues.name || ''),
      customerId: formValues.customerId,
      vehicleId: String(formValues.vehicleId || ''),
      startAt: String(formValues.startAt || new Date().toISOString()),
      endAt: formValues.endAt ? String(formValues.endAt) : undefined,
      status: (formValues.status as Rental['status']) || 'ongoing',
      priceCents: Number(formValues.priceCents || 0),
      notes: String(formValues.notes || ''),
    };

    if (isEditing && editingId) {
      updateRental(editingId, payload);
    } else {
      addRental(payload);
    }
    setAllRentals(getRentals());
    closeForm();
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xoá',
      content: 'Bạn có chắc muốn xoá bản ghi này không?',
      onOk() {
        deleteRental(id);
        setAllRentals(getRentals());
      }
    });
  };
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
            <select className="border rounded-md px-2 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="all">Tất cả</option>
              <option value="completed">Hoàn thành</option>
              <option value="ongoing">Đang chạy</option>
              <option value="cancelled">Đã huỷ</option>
            </select>
            <button onClick={openAdd} className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm">
              <PlusOutlined className="w-4 h-4 mr-2" /> Thêm khách hàng
            </button>
            <button 
              onClick={() => {
                resetRentals();
                setAllRentals(getRentals());
              }}
              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md text-sm"
            >
              Reset Data
            </button>
          </div>
        </div>


        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Tên khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Xe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Bắt đầu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Kết thúc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Giá thuê</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredList.map((r: RentalType) => {
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.vehicleId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(r.startAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(r.endAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === 'completed' ? 'bg-green-100 text-green-800' : r.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {r.status === 'completed' ? 'Hoàn thành' : r.status === 'ongoing' ? 'Đang chạy' : r.status === 'cancelled' ? 'Đã huỷ' : 'cancelled'}
                    </span>
                      {/* <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === 'completed' ? 'bg-green-100 text-green-800' : r.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {r.status}
                    </span> */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.priceCents}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <Button
                        type="text"
                        onClick={() => openView(r.id)}
                        className="inline-flex items-center text-sm !text-blue-700 mr-4 hover:text-blue-600"
                      >
                        <EyeOutlined className="mr-2 text-xl" />
                      </Button>
                      <Button
                        type="text"
                        onClick={() => openEdit(r.id)}
                        className="inline-flex items-center text-sm text-gray-600 mr-4"

                      >
                        <EditOutlined className="text-xl" />
                      </Button>
                      <Button
                        type="text"
                        className="inline-flex items-center text-sm text-red-600"
                        onClick={() => handleDelete(r.id)}
                      >
                        <DeleteOutlined className="mr-7 !text-red-600 text-xl" />
                      </Button>
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
        </div>
        {/* View Modal */}
        <Modal visible={viewVisible} title="Chi tiết thuê" onCancel={closeView} footer={[<Button key="close" onClick={closeView}>Đóng</Button>]}>
          {selected ? (
            <div className="space-y-2">
              <div><strong>ID:</strong> {selected.id}</div>
              <div><strong>Tên khách hàng:</strong> {selected.name}</div>
              <div><strong>Customer ID:</strong> {selected.customerId || '-'}</div>
              <div><strong>Xe:</strong> {selected.vehicleId}</div>
              <div><strong>Bắt đầu:</strong> {formatDate(selected.startAt)}</div>
              <div><strong>Kết thúc:</strong> {formatDate(selected.endAt)}</div>
              <div><strong>Trạng thái:</strong> {selected.status}</div>
              <div><strong>Giá thuê:</strong> {selected.priceCents}</div>
              <div><strong>Ghi chú:</strong> {selected.notes || '-'}</div>
            </div>
          ) : null}
        </Modal>

        {/* Add / Edit Modal */}
        <Modal visible={formVisible} title={isEditing ? 'Chỉnh sửa thuê' : 'Thêm thuê'} onCancel={closeForm} onOk={submitForm} okText="Lưu">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">Tên khách hàng</label>
              <Input value={formValues.name as string || ''} onChange={(e) => handleFormChange('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Mã xe</label>
              <Input value={formValues.vehicleId as string || ''} onChange={(e) => handleFormChange('vehicleId', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Bắt đầu (ISO)</label>
              <Input value={formValues.startAt as string || ''} onChange={(e) => handleFormChange('startAt', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Kết thúc (ISO)</label>
              <Input value={formValues.endAt as string || ''} onChange={(e) => handleFormChange('endAt', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Trạng thái</label>
              <Select value={formValues.status || 'ongoing'} onChange={(val) => handleFormChange('status', val as Rental['status'])} style={{ width: '100%' }}>
                <Select.Option value="completed">Hoàn thành</Select.Option>
                <Select.Option value="ongoing">Đang chạy</Select.Option>
                <Select.Option value="cancelled">Đã huỷ</Select.Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-700">Giá thuê (cents)</label>
              <InputNumber style={{ width: '100%' }} value={formValues.priceCents as number || 0} onChange={(val) => handleFormChange('priceCents', val)} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Ghi chú</label>
              <Input.TextArea rows={3} value={formValues.notes as string || ''} onChange={(e) => handleFormChange('notes', e.target.value)} />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default RentalHistory;

