import React, { useEffect, useState } from 'react';
import type { UserProfile } from '../../../../services/userService';
import userService from '../../../../services/userService';
import { message } from 'antd';
import { toast } from '../../../../hooks/use-toast';

type Props = {
  user?: UserProfile | null;
  onUpdate?: (u: UserProfile) => void;
  onClose?: () => void;
};

const EditCustomer: React.FC<Props> = ({ user, onUpdate, onClose }) => {
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState<string>(
    user?.dateOfBirth ? user.dateOfBirth.substring(0, 10) : ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || '');
  const [licenseExpiry, setLicenseExpiry] = useState<string>(user?.licenseExpiry ? user.licenseExpiry.substring(0,10) : '');
  const [licenseClass, setLicenseClass] = useState(user?.licenseClass || '');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.substring(0,10) : '');
      setLicenseNumber(user.licenseNumber || '');
      setLicenseExpiry(user.licenseExpiry ? user.licenseExpiry.substring(0,10) : '');
      setLicenseClass(user.licenseClass || '');
    }
  }, [user]);

  if (!user) return <div className="p-6">Không tìm thấy người dùng để sửa.</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Một số backend có thể yêu cầu gửi kèm userId trong body
      const updated = await userService.updateUser(user._id, {
        name,
        phoneNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
        licenseNumber: licenseNumber || undefined,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry).toISOString() : undefined,
        licenseClass: licenseClass || undefined
      } as any);
      onUpdate?.(updated);
      // Prefer AntD message for immediate feedback and custom toast for global queue
      message.success('Cập nhật người dùng thành công');
      toast({ title: 'Thành công', description: 'Thông tin người dùng đã được cập nhật.' });
      onClose?.();
    } catch (err: any) {
      setError(err?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">Cập nhật người dùng</h2>
        <p className="text-sm text-gray-500">Chỉnh sửa thông tin cơ bản</p>
      </div>
      <div className='border p-4 rounded-lg shadow-sm space-y-4'>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm text-gray-700">Họ và tên</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Số điện thoại</label>
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Ngày sinh</label>
          <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700">Số GPLX</label>
            <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Ngày hết hạn GPLX</label>
            <input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>
            <div>
            <label className="block text-sm text-gray-700">Hạng GPLX</label>
            <input value={licenseClass} onChange={(e) => setLicenseClass(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={() => onClose?.()} className="px-4 py-2 border rounded-md">Hủy</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditCustomer;
