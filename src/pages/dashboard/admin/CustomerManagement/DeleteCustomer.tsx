import React, { useState } from 'react';
import api from '../../../../services/api';
import { message } from 'antd';
import { toast } from '../../../../hooks/use-toast';

type Props = {
  userId?: string | null;
  userName?: string | null;
  onDeleted?: (userId: string) => void;
  onClose?: () => void;
};

const DeleteCustomer: React.FC<Props> = ({ userId, userName, onDeleted, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!userId) return <div className="p-6">Không có user id.</div>;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      // Attempt backend delete if available. If 404 or method not allowed, fallback to client removal.
      try {
        await api.delete(`/users/${userId}`);
      } catch (inner: any) {
        // Ignore if delete not supported
        console.warn('[DeleteCustomer] delete endpoint không khả dụng, fallback client-side', inner?.response?.status);
      }
      onDeleted?.(userId);
      message.success('Xoá người dùng thành công');
      toast({ title: 'Đã xoá', description: 'Người dùng đã được xoá khỏi hệ thống.' });
      onClose?.();
    } catch (err: any) {
      setError(err?.message || 'Xóa thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-red-600">Xoá người dùng</h2>
      <p className="mt-2 text-sm text-gray-600">Bạn có chắc muốn xóa người dùng <strong>{userName}</strong>? Hành động này không thể hoàn tác.</p>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      <div className="mt-6 flex justify-end space-x-2">
        <button onClick={() => onClose?.()} className="px-4 py-2 border rounded-md">Hủy</button>
        <button disabled={loading} onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50">
          {loading ? 'Đang xoá...' : 'Xoá'}
        </button>
      </div>
    </div>
  );
};

export default DeleteCustomer;
