import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { findRental } from '../../../../data/rentalsStore';
import { Button } from 'antd';

const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString('vi-VN') : '-';

const RentalDetail: React.FC = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const rental = rentalId ? findRental(rentalId) : null;

  if (!rental) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Chi tiết lịch thuê</h2>
        <p className="text-gray-500 mt-2">Không tìm thấy lịch thuê.</p>
        <div className="mt-4">
          <Link to="/admin/customers/history">
            <Button type="default">Quay lại</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Chi tiết lịch thuê</h2>
        <Link to="/admin/customers/history">
          <Button type="default">Quay lại</Button>
        </Link>
      </div>
      <div className="mt-6 space-y-3 text-sm text-gray-700">
        <div><strong>ID:</strong> {rental.id}</div>
        <div><strong>Tên khách hàng:</strong> {rental.name || '-'}</div>
        <div><strong>ID khách hàng:</strong> {rental.customerId || '-'}</div>
        <div><strong>Xe:</strong> {rental.vehicleId}</div>
        <div><strong>Bắt đầu:</strong> {formatDate(rental.startAt)}</div>
        <div><strong>Kết thúc:</strong> {formatDate(rental.endAt)}</div>
        <div><strong>Trạng thái:</strong> {rental.status}</div>
        <div><strong>Giá thuê:</strong> {rental.priceCents ?? '-'}</div>
        {rental.notes && <div><strong>Ghi chú:</strong> {rental.notes}</div>}
      </div>
    </div>
  );
};

export default RentalDetail;
