import React, { useState } from 'react';
import { MailOutlined, PhoneOutlined, IdcardOutlined, CheckCircleOutlined, FileImageOutlined } from '@ant-design/icons';
import type { UserProfile } from '../../../../services/userService';

type Props = {
  user?: UserProfile | null;
};

const CustomerDetailsModal: React.FC<Props> = ({ user }) => {
  if (!user) return <div className="p-6">Không tìm thấy khách hàng.</div>;

  const initials = user.name
    .split(' ')
    .map((s) => s[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const info: { label: string; value: React.ReactNode }[] = [
    { label: 'Email', value: user.email || 'N/A' },
    { label: 'Số điện thoại', value: user.phoneNumber || 'N/A' },
    { label: 'Ngày sinh', value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A' },
    { label: 'Vai trò', value: user.role },
    { label: 'Trạng thái xác minh', value: user.verificationStatus },
    { label: 'Đã xác minh', value: user.isVerified ? 'Có' : 'Chưa' },
    { label: 'Tạo lúc', value: new Date(user.createdAt).toLocaleString('vi-VN') },
    { label: 'Cập nhật lúc', value: new Date(user.updatedAt).toLocaleString('vi-VN') }
  ];

  const docs: { key: string; label: string; url?: string | null }[] = [
    { key: 'idCardFront', label: 'CMND/CCCD mặt trước', url: user.idCardFront },
    { key: 'idCardBack', label: 'CMND/CCCD mặt sau', url: user.idCardBack },
    { key: 'driverLicense', label: 'Giấy phép lái xe', url: user.driverLicense },
    { key: 'selfiePhoto', label: 'Ảnh selfie', url: user.selfiePhoto }
  ];

  const [selectedDoc, setSelectedDoc] = useState<{ key: string; label: string; url: string } | null>(null);

  return (
    <div className="p-6">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-white mb-3">
          <span className="text-2xl text-gray-700">{initials}</span>
        </div>
        <h3 className="text-lg font-semibold text-blue-600 mb-1">{user.name}</h3>
        <div className="text-sm text-gray-500 mb-4 flex gap-6 items-center">
          <div className="flex items-center gap-2"><MailOutlined />{user.email || 'N/A'}</div>
          <div className="flex items-center gap-2"><PhoneOutlined />{user.phoneNumber || 'N/A'}</div>
          {user.verificationStatus === 'APPROVED' && (
            <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircleOutlined />Đã duyệt</span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin cơ bản</h4>
          <dl className="divide-y divide-gray-200">
            {info.map(item => (
              <div key={item.label} className="py-2 flex justify-between text-sm">
                <dt className="text-gray-500">{item.label}</dt>
                <dd className="text-gray-900 text-right max-w-[55%] break-words">{item.value}</dd>
              </div>
            ))}
            {user.rejectionReason && (
              <div className="py-2 flex justify-between text-sm">
                <dt className="text-gray-500">Lý do từ chối</dt>
                <dd className="text-red-600 text-right max-w-[55%] break-words">{user.rejectionReason}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><IdcardOutlined />Tài liệu xác minh</h4>
          <div className="grid grid-cols-2 gap-3">
            {docs.map(doc => (
              <div
                key={doc.key}
                className={`border rounded-md p-2 flex flex-col text-xs bg-white cursor-pointer hover:border-blue-400 ${selectedDoc?.key === doc.key ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => doc.url && setSelectedDoc({ key: doc.key, label: doc.label, url: doc.url })}
                title={doc.label}
              >
                <span className="font-medium mb-1 flex items-center gap-1"><FileImageOutlined />{doc.label}</span>
                {doc.url ? (
                  <span className="text-blue-600 truncate select-none">Xem ảnh</span>
                ) : (
                  <span className="text-gray-400">Chưa có</span>
                )}
              </div>
            ))}
          </div>
          {selectedDoc && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-700">{selectedDoc.label}</h5>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => setSelectedDoc(null)}
                >Đóng ảnh</button>
              </div>
              <div className="border rounded-md bg-black/5 p-2 flex items-center justify-center min-h-[280px]">
                <img
                  src={selectedDoc.url}
                  alt={selectedDoc.label}
                  className="max-h-[260px] object-contain rounded-md shadow"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
