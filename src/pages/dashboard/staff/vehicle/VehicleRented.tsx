import { useState, useEffect } from 'react';
import { Table, Tag, Card, Space } from 'antd';

// Dữ liệu mẫu
const mockRentedVehicles = [
  {
    id: 1,
    model: 'Toyota Vios',
    licensePlate: 'ABC-123',
    customer: { name: 'Nguyễn Văn A', phone: '0901234567' },
    rentStart: '2024-06-01 08:00',
    rentEnd: '2024-06-01 18:00',
    lastStatus: { battery: '70%', technical: 'Tốt', updated: '2024-06-01 07:50' },
    estimatedCost: '500,000đ',
  },
  {
    id: 2,
    model: 'Honda Wave',
    licensePlate: 'XYZ-789',
    customer: { name: 'Trần Thị B', phone: '0912345678' },
    rentStart: '2024-06-01 09:30',
    rentEnd: '2024-06-01 17:00',
    lastStatus: { battery: '55%', technical: 'Bình thường', updated: '2024-06-01 09:20' },
    estimatedCost: '120,000đ',
  },
];

type Vehicle = {
  id: number;
  model: string;
  licensePlate: string;
  customer: { name: string; phone: string };
  rentStart: string;
  rentEnd: string;
  lastStatus: { battery: string; technical: string; updated: string };
  estimatedCost: string;
};

const VehicleRented = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    // Giả lập lấy dữ liệu
    setVehicles(mockRentedVehicles);
  }, []);

  const columns = [
    {
      title: 'ID / Model / Biển số',
      key: 'vehicleInfo',
      render: (_: any, record: any) => (
        <div>
          <div><b>ID:</b> {record.id}</div>
          <div><b>Model:</b> {record.model}</div>
          <div><b>Biển số:</b> {record.licensePlate}</div>
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: any, record: any) => (
        <div>
          <div><b>{record.customer.name}</b></div>
          <div>{record.customer.phone}</div>
        </div>
      ),
    },
    {
      title: 'Thời gian thuê',
      key: 'rentTime',
      render: (_: any, record: any) => (
        <div>
          <div>Bắt đầu: {record.rentStart}</div>
          <div>Dự kiến trả: {record.rentEnd}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái lần cuối',
      key: 'lastStatus',
      render: (_: any, record: any) => (
        <div>
          <Tag color="blue">Pin: {record.lastStatus.battery}</Tag>
          <Tag color="green">Kỹ thuật: {record.lastStatus.technical}</Tag>
          <div style={{ fontSize: 12, color: '#888' }}>Cập nhật: {record.lastStatus.updated}</div>
        </div>
      ),
    },
    {
      title: 'Chi phí tạm tính',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      render: (cost: string) => <b style={{ color: '#faad14' }}>{cost}</b>,
    },
  ];

  return (
    <Card title="Danh sách xe đang cho thuê">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Table
          columns={columns}
          dataSource={vehicles}
          rowKey="id"
        />
      </Space>
    </Card>
  );
}

export default VehicleRented;