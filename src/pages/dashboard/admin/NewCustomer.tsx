import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Customer } from '../../../data/customers';
import { addCustomer } from '../../../data/customersStore';

type NewCustomerProps = {
  onCreate?: (c: Customer) => void;
  onClose?: () => void; // if provided, do not navigate and call this to close modal
};

const NewCustomer: React.FC<NewCustomerProps> = ({ onCreate, onClose }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = 'c' + Math.floor(Math.random() * 10000).toString();
    const newCustomer: Customer = {
      id,
      name: name || 'Khách mới',
      email: email || '-',
      phone: phone || '-',
      totalRentals: 0,
      lastActive: new Date().toISOString(),
      risk: 'low'
    };

  addCustomer(newCustomer);
  onCreate?.(newCustomer);
  // if called inside a modal, just close the modal; otherwise navigate
  if (onClose) {
    onClose();
  } else {
    navigate('/admin/customers');
  }
  };

  return (
    <div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
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
        <div className="flex space-x-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Tạo</button>
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose(); else navigate('/admin/customers');
            }}
            className="px-4 py-2 border rounded-md">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCustomer;
