import { useEffect, useMemo, useState } from 'react';
import { Card, Input, Modal, Space, Spin, Table, Tag, message, Descriptions } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

// Mock reserved data
const mockReservedVehicles = [
  {
    id: 11,
    type: 'Car',
    model: 'Hyundai Accent',
    licensePlate: 'ACC-456',
    technicalStatus: 'Tốt',
    battery: '82%',
    status: 'reserved',
    location: 'Station C',
    image: 'https://via.placeholder.com/120x80?text=Car',
    customer: { name: 'Phạm Minh C', phone: '0903334444' }
  },
  {
    id: 22,
    type: 'Motorcycle',
    model: 'Honda Wave',
    licensePlate: 'WAV-789',
    technicalStatus: 'Bình thường',
    battery: '65%',
    status: 'reserved',
    location: 'Station B',
    image: 'https://via.placeholder.com/120x80?text=Moto',
    customer: { name: 'Lê Thị D', phone: '0911112222' }
  },
];

export default function VehicleReserved() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // Seed list with reserved + optionally preselected vehicle from Available screen
    const incoming = (location.state as any)?.vehicle;
    const list = [...mockReservedVehicles];
    if (incoming) {
      list.unshift({
        ...incoming,
        status: 'reserved',
        customer: { name: 'Khách đặt trước', phone: '—' },
      });
      message.success(`Đã thêm xe ${incoming.licensePlate} vào danh sách đặt trước.`);
    }
    setVehicles(list);
    setLoading(false);
  }, [location.state]);

  const filtered = useMemo(
    () =>
      vehicles.filter((v) =>
        Object.values(v).some((val) =>
          (typeof val === 'object'
            ? JSON.stringify(val)
            : String(val)
          )
            .toLowerCase()
            .includes(searchText.toLowerCase())
        )
      ),
    [vehicles, searchText]
  );

  const handleOpen = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsModalVisible(true);
  };

  const handleConfirmHandover = () => {
    if (!selectedVehicle) return;
    setIsModalVisible(false);
    message.success(`Xác nhận giao xe ${selectedVehicle.licensePlate}.`);
    // Navigate to handover procedure screen, pass vehicle data via state
    navigate('/staff/delivery-procedures', { state: { vehicle: selectedVehicle } });
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (img: string) => (
        <img src={img} alt="vehicle" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
    {
      title: 'Xe',
      key: 'vehicle',
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
          <div><b>{record.customer?.name || '—'}</b></div>
          <div>{record.customer?.phone || '—'}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái kỹ thuật',
      key: 'status',
      render: (_: any, record: any) => (
        <div>
          <Tag color="blue">Pin: {record.battery}</Tag>
          <Tag color="green">Kỹ thuật: {record.technicalStatus}</Tag>
          <div style={{ fontSize: 12, color: '#888' }}>Vị trí: {record.location}</div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <button
          style={{
            background: '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '4px 12px',
            cursor: 'pointer'
          }}
          onClick={() => handleOpen(record)}
        >
          Giao xe
        </button>
      ),
    },
  ];

  return (
    <Card title="Xe đã đặt trước">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={filtered} rowKey="id" />
        </Spin>
      </Space>

      <Modal
        title="Xác nhận giao xe"
        open={isModalVisible}
        onOk={handleConfirmHandover}
        onCancel={() => setIsModalVisible(false)}
        okText="Chuyển sang thủ tục bàn giao"
        cancelText="Hủy"
        bodyStyle={{ padding: 24 }}
        width={820}
      >
        {selectedVehicle && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <img
              src={selectedVehicle.image}
              alt="vehicle"
              style={{
                width: 160,
                height: 100,
                objectFit: 'cover',
                borderRadius: 8,
                border: '1px solid #e4e4e4',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {selectedVehicle.type} - {selectedVehicle.model}
                </div>
                <Tag color="gold" style={{ fontWeight: 500 }}>Đã đặt trước</Tag>
              </div>

              <Descriptions
                size="middle"
                column={2}
                bordered
                labelStyle={{ color: '#888', width: 140 }}
                contentStyle={{ fontWeight: 500 }}
              >
                <Descriptions.Item label="ID">{selectedVehicle.id}</Descriptions.Item>
                <Descriptions.Item label="Biển số">{selectedVehicle.licensePlate}</Descriptions.Item>
                <Descriptions.Item label="Loại xe">{selectedVehicle.type}</Descriptions.Item>
                <Descriptions.Item label="Model">{selectedVehicle.model}</Descriptions.Item>
                <Descriptions.Item label="Khách hàng">
                  {selectedVehicle.customer?.name || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Số liên hệ">
                  {selectedVehicle.customer?.phone || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Tình trạng kỹ thuật">{selectedVehicle.technicalStatus}</Descriptions.Item>
                <Descriptions.Item label="Pin">{selectedVehicle.battery}</Descriptions.Item>
                <Descriptions.Item label="Vị trí">{selectedVehicle.location}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color="gold">Đã đặt trước</Tag>
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: 12, color: '#faad14', textAlign: 'center', fontWeight: 500 }}>
                Xác nhận chuyển sang màn hình thủ tục bàn giao.
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
