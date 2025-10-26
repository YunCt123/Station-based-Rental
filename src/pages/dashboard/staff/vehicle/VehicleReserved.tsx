import { useEffect, useMemo, useState } from 'react';
import { stationService } from '../../../../services/stationService';
import { vehicleService } from '../../../../services/vehicleService';
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
const VehicleReserved = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Thành phố Việt Nam (tĩnh)
  const cityOptionsRaw = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Biên Hòa', 'Buôn Ma Thuột', 'Đà Lạt', 'Quy Nhơn', 'Thanh Hóa', 'Nam Định', 'Vinh', 'Thái Nguyên', 'Bắc Ninh', 'Phan Thiết', 'Long Xuyên', 'Rạch Giá', 'Bạc Liêu', 'Cà Mau', 'Tuy Hòa', 'Pleiku', 'Trà Vinh', 'Sóc Trăng', 'Hạ Long', 'Uông Bí', 'Lào Cai', 'Yên Bái', 'Điện Biên Phủ', 'Sơn La', 'Hòa Bình', 'Tuyên Quang', 'Bắc Giang', 'Bắc Kạn', 'Cao Bằng', 'Lạng Sơn', 'Hà Giang', 'Phủ Lý', 'Hưng Yên', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Đông Hà', 'Quảng Ngãi', 'Tam Kỳ', 'Kon Tum', 'Gia Nghĩa', 'Tây Ninh', 'Bến Tre', 'Vĩnh Long', 'Cao Lãnh', 'Sa Đéc', 'Mỹ Tho', 'Châu Đốc', 'Tân An', 'Bình Dương', 'Bình Phước', 'Phước Long', 'Thủ Dầu Một', 'Bình Thuận', 'Bình Định', 'Quảng Nam', 'Quảng Ninh', 'Quảng Ngãi', 'Quảng Trị', 'Quảng Bình', 'Ninh Bình', 'Ninh Thuận', 'Hà Nam', 'Hà Tĩnh', 'Hậu Giang', 'Kiên Giang', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Nam Định', 'Nghệ An', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ];
  const cityOptions = Array.from(new Set(cityOptionsRaw));
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [stationOptions, setStationOptions] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');

  useEffect(() => {
    if (!selectedCity) return;
    stationService.getStationsByCity(selectedCity)
      .then((stations: any[]) => {
        setStationOptions((stations || []).map((station: any) => ({
          value: station.id,
          label: station.name
        })));
        setSelectedStation('');
      })
      .catch(() => {
        setStationOptions([]);
      });
  }, [selectedCity]);
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy danh sách xe đặt trước theo trạm
  useEffect(() => {
    if (!selectedStation) {
      setVehicles([]);
      return;
    }
    setLoading(true);
    vehicleService.getReservedVehiclesByStation(selectedStation)
      .then((data: any[]) => {
        setVehicles(data || []);
      })
      .catch(() => {
        setVehicles([]);
        message.error('Không lấy được danh sách xe đặt trước.');
      })
      .finally(() => setLoading(false));
  }, [selectedStation]);

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
      dataIndex: 'imageUrl',
      key: 'imageUrl',
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
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Số liên hệ',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
    },
    {
      title: 'Pin',
      dataIndex: 'battery',
      key: 'battery',
      render: (battery: string) => <Tag color="blue">{battery}</Tag>,
    },
    {
      title: 'Kỹ thuật',
      dataIndex: 'technicalStatus',
      key: 'technicalStatus',
      render: (status: string) => <Tag color="green">{status}</Tag>,
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
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
      {/* Chọn thành phố và trạm */}
      <Space style={{ marginBottom: 16 }}>
        <div>
          <span style={{ marginRight: 8 }}>Thành phố:</span>
          <Input.Search
            placeholder="Tìm thành phố..."
            allowClear
            style={{ width: 200 }}
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            list="city-list"
          />
          <datalist id="city-list">
            {cityOptions.map((city, idx) => (
              <option key={city + idx} value={city} />
            ))}
          </datalist>
        </div>
        <div>
          <span style={{ marginRight: 8 }}>Trạm:</span>
          <select
            style={{ width: 200, padding: 4 }}
            value={selectedStation}
            onChange={e => setSelectedStation(e.target.value)}
            disabled={!stationOptions.length}
          >
            <option value="">Chọn trạm...</option>
            {stationOptions.map(station => (
              <option key={station.value} value={station.value}>{station.label}</option>
            ))}
          </select>
        </div>
      </Space>
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
        styles={{ body: { padding: 24 } }}
        width={820}
      >
        {selectedVehicle && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <img
              src={selectedVehicle.imageUrl}
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
                <Descriptions.Item label="Khách hàng">{selectedVehicle.customerName}</Descriptions.Item>
                <Descriptions.Item label="Số liên hệ">{selectedVehicle.customerPhone}</Descriptions.Item>
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

export default VehicleReserved;