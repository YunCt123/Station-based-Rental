import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Button, Card, Divider, Image, Spin, Tag } from 'antd';
import rentalService, { type StationRental } from '../../../../services/rentalService';
import { useCurrency } from '../../../../lib/currency';

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString('vi-VN') : '-');

const StatusTag: React.FC<{ status?: StationRental['status'] }> = ({ status }) => {
  if (!status) return null;
  const map: Record<string, { color: string; label: string }> = {
    COMPLETED: { color: 'green', label: 'Hoàn thành' },
    ONGOING: { color: 'gold', label: 'Đang chạy' },
    CANCELLED: { color: 'red', label: 'Đã huỷ' },
  };
  const meta = map[status] || { color: 'default', label: status };
  return <Tag color={meta.color}>{meta.label}</Tag>;
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">{title}</h3>
);

const KeyRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex text-sm py-1">
    <div className="w-48 text-gray-500">{label}</div>
    <div className="flex-1 text-gray-800">{value ?? '-'}</div>
  </div>
);

const RentalDetail: React.FC = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const { formatPrice } = useCurrency();
  const [data, setData] = useState<StationRental | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!rentalId) return;
      setLoading(true);
      setError(null);
      try {
        const rental = await rentalService.getRentalById(rentalId);
        setData(rental);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được chi tiết.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [rentalId]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Chi tiết lịch thuê</h2>
        <Link to="/admin/customers/history">
          <Button type="default">Quay lại</Button>
        </Link>
      </div>

      {error && <Alert type="error" message={error} showIcon className="mb-4" />}
      {loading && (
        <div className="py-10 flex justify-center">
          <Spin />
        </div>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Thông tin chung">
            <KeyRow label="Mã thuê" value={data._id} />
            <KeyRow label="Trạng thái" value={<StatusTag status={data.status} />} />
            <KeyRow label="Bắt đầu" value={formatDate(data.start_at)} />
            <KeyRow label="Kết thúc" value={formatDate(data.end_at)} />
            <Divider className="my-3" />
            <KeyRow label="Trạm" value={data.station_id?.name} />
            <KeyRow label="Địa chỉ" value={data.station_id?.address} />
            <KeyRow label="Thành phố" value={data.station_id?.city} />
          </Card>

          <Card title="Khách hàng">
            <KeyRow label="Tên" value={data.user_id?.name} />
            <KeyRow label="Email" value={data.user_id?.email} />
            <KeyRow label="Điện thoại" value={data.user_id?.phoneNumber} />
          </Card>

          <Card title="Xe">
            <KeyRow label="Tên xe" value={data.vehicle_id?.name} />
            <KeyRow label="Hãng" value={data.vehicle_id?.brand} />
            <KeyRow label="Dòng xe" value={data.vehicle_id?.model} />
            <KeyRow label="Năm" value={data.vehicle_id?.year} />
            <KeyRow label="Loại" value={data.vehicle_id?.type} />
            <KeyRow label="Số ghế" value={data.vehicle_id?.seats} />
            <KeyRow label="ODO (km)" value={data.vehicle_id?.odo_km} />
          </Card>

          <Card title="Giá & Thanh toán">
            <KeyRow label="Tổng tiền" value={formatPrice(data.pricing_snapshot?.total_price ?? 0)} />
            <KeyRow label="Tiền cọc" value={formatPrice(data.pricing_snapshot?.deposit ?? 0)} />
            <KeyRow label="Giá gốc" value={formatPrice(data.pricing_snapshot?.base_price ?? 0)} />
            <KeyRow label="Bảo hiểm" value={formatPrice(data.pricing_snapshot?.insurance_price ?? 0)} />
            <KeyRow label="Thuế" value={formatPrice(data.pricing_snapshot?.taxes ?? 0)} />
            <Divider className="my-3" />
            {data.pricing_snapshot?.details && (
              <>
                <KeyRow label="Loại thuê" value={data.pricing_snapshot.details.rentalType === 'daily' ? 'Theo ngày' : 'Theo giờ'} />
                <KeyRow label="Số ngày" value={data.pricing_snapshot.details.days} />
                <KeyRow label="Số giờ" value={data.pricing_snapshot.details.hours} />
                <KeyRow label="Base (raw)" value={formatPrice(data.pricing_snapshot.details.rawBase)} />
              </>
            )}
          </Card>

          <Card title="Bàn giao (Pickup)">
            <KeyRow label="Thời điểm" value={formatDate(data.pickup?.at)} />
            <KeyRow label="ODO (km)" value={data.pickup?.odo_km} />
            <KeyRow label="SOC" value={typeof data.pickup?.soc === 'number' ? `${Math.round((data.pickup.soc as number) * 100)}%` : '-'} />
            <KeyRow label="Ghi chú" value={data.pickup?.notes} />
            <SectionTitle title="Ảnh bàn giao" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(data.pickup?.photos as any[])?.map((p, idx) => (
                <Image key={p._id || idx} src={p.url} alt={`pickup-${idx}`} />
              ))}
            </div>
          </Card>

          <Card title="Trả xe (Return)">
            <KeyRow label="Thời điểm" value={formatDate(data.return?.at)} />
            <KeyRow label="ODO (km)" value={data.return?.odo_km} />
            <KeyRow label="SOC" value={typeof data.return?.soc === 'number' ? `${Math.round((data.return.soc as number) * 100)}%` : '-'} />
            <SectionTitle title="Ảnh trả xe" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(data.return?.photos as any[])?.map((p, idx) => (
                <Image key={p._id || idx} src={p.url} alt={`return-${idx}`} />
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RentalDetail;
