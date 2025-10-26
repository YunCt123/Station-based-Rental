import { useState, useEffect } from 'react';
import { stationService } from '../../../../services/stationService';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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