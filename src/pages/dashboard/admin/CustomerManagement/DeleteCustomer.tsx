import React from 'react';
import { useNavigate } from 'react-router-dom';
import { findCustomer, deleteCustomer } from '../../../../data/customersStore';

type Props = {
  id?: string | null;
};

const DeleteCustomer: React.FC<Props> = ({ id }) => {
  const navigate = useNavigate();

  if (!id) return <div className="p-6">Không có id khách hàng.</div>;

  const customer = findCustomer(id);

  if (!customer) return <div className="p-6">Không tìm thấy khách hàng.</div>;

  const handleDelete = () => {
    deleteCustomer(id);
    // refresh the page so the list updates
    window.location.reload();
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-red-600">Xoá khách hàng</h2>
      <p className="mt-2 text-sm text-gray-600">Bạn có chắc muốn xóa khách hàng <strong>{customer.name}</strong>? Hành động này không thể hoàn tác.</p>
      <div className="mt-6 flex justify-end space-x-2">
        <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded-md">Hủy</button>
        <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Xoá</button>
      </div>
    </div>
  );
};

export default DeleteCustomer;
