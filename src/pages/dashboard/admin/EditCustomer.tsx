import React, { useEffect, useState } from 'react';
import type { Customer } from '../../../data/customersStore';
import { findCustomer, updateCustomer } from '../../../data/customersStore';

type Props = {
  id?: string | null;
  onUpdate?: (c: Customer) => void;
  onClose?: () => void;
};

const EditCustomer: React.FC<Props> = ({ id, onUpdate, onClose }) => {
  const [customer, setCustomer] = useState<Customer | null>(() => (id ? findCustomer(id) ?? null : null));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!id) return;
    const c = findCustomer(id) ?? null;
    setCustomer(c);
    setName(c?.name ?? '');
    setEmail(c?.email ?? '');
    setPhone(c?.phone ?? '');
  }, [id]);

  if (!id || !customer) {
    return <div className="p-6">Không tìm thấy khách hàng để sửa.</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patched = updateCustomer(id, { name, email, phone });
    if (patched) onUpdate?.(patched);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">Cập nhật khách hàng</h2>
        <p className="text-sm text-gray-500">Chỉnh sửa thông tin và lưu lại</p>
      </div>

      <div className='border p-4 rounded-lg shadow-sm space-y-4'>
        <div>
          <label className="block text-sm text-gray-700">Họ và tên</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm text-gray-700">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm text-gray-700">Số điện thoại</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>

        <div className="flex justify-end space-x-2">
          <button type="button" onClick={() => onClose?.()} className="px-4 py-2 border rounded-md">Hủy</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Lưu</button>
        </div>
      </div>
    </form>
  );
};

export default EditCustomer;
