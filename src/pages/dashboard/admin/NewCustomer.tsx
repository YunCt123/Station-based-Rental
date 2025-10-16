import React, { useState } from 'react';
import { addCustomer } from '../../../data/customersStore';
import type { Customer } from '../../../data/customersStore';

type Props = {
  onCreate?: (c: Customer) => void;
  onClose?: () => void;
};

const NewCustomer: React.FC<Props> = ({ onCreate, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name || 'Khách mới',
      email: email || '-',
      phone: phone || '-',
      totalRentals: 0,
      risk: 'low' as const,
    };
    const created = addCustomer(payload as any);
    onCreate?.(created);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
           <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
  Thêm khách hàng mới
</h1>
            <p className="text-sm text-gray-500">Điền thông tin cơ bản để tạo hồ sơ khách hàng</p>
        </div>
    <div  className='border p-4 rounded-lg shadow-sm space-y-4'>
      <div  >
        <label className="block text-sm text-gray-700">Họ và tên</label>
        <input value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm text-gray-700">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm text-gray-700">Số điện thoại</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
      </div>
      <div className="flex space-x-2 justify-end">
        <button type="button" onClick={() => onClose?.()} className="px-4 py-2 border rounded-md">Hủy</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Tạo</button>
      </div>
      </div>
    </form>
  );
};

export default NewCustomer;
