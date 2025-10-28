import { useEffect, useMemo, useState } from 'react';
import { stationService } from '../../../../services/stationService';
import { vehicleService } from '../../../../services/vehicleService';
import { Card, Input, Modal, Space, Spin, Table, Tag, message, Descriptions } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Mock reserved data
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
      dataIndex: 'image',
      key: 'image',
      render: (img: string) => (
        <img src={img} alt="vehicle" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
    {
      title: 'Xe',
      key: 'vehicleInfo',
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.name}</div>
          <div style={{ color: '#888' }}>{record.model} &bull; {record.type}</div>
        </div>
      ),
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'RESERVED' ? 'gold' : 'blue'}>{status}</Tag>,
    },
    {
      title: 'Pin (%)',
      dataIndex: 'batteryLevel',
      key: 'batteryLevel',
      render: (battery: number) => <Tag color="blue">{battery}%</Tag>,
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Giá/giờ',
      dataIndex: 'pricePerHour',
      key: 'pricePerHour',
      render: (_: any, record: any) => record.pricePerHour ? `${record.pricePerHour.toLocaleString()} ${record.currency || 'VND'}` : '--',
    },
    {
      title: 'Số ghế',
      dataIndex: 'seats',
      key: 'seats',
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
        styles={{ body: { padding: 24, maxHeight: '70vh' } }}
        width={820}
      >
        {selectedVehicle && (
          <>
            <Card style={{ marginBottom: 8 }} bodyStyle={{ padding: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#1890ff', letterSpacing: 1 }}>{selectedVehicle.name} <span style={{ color: '#555', fontWeight: 400 }}>({selectedVehicle.year})</span></div>
              <div style={{ marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                <Tag color={selectedVehicle.status === 'RESERVED' ? 'gold' : 'blue'} style={{ fontWeight: 500, fontSize: 15 }}>{selectedVehicle.status === 'RESERVED' ? 'Đã đặt trước' : selectedVehicle.status}</Tag>
                {selectedVehicle.active === false && <Tag color="red">Không hoạt động</Tag>}
                <Tag color="blue">{selectedVehicle.type}</Tag>
                <Tag color="geekblue">{selectedVehicle.brand}</Tag>
              </div>
            </Card>
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', padding: 8 }}>
              <img
                src={selectedVehicle.image}
                alt="vehicle"
                style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 12, border: '2px solid #e4e4e4', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', flexShrink: 0 }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '50vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <Card title="Thông tin chung" style={{ marginBottom: 8 }} bodyStyle={{ padding: 16 }}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="ID"><b>{selectedVehicle.id}</b></Descriptions.Item>
                      <Descriptions.Item label="Tên xe">{selectedVehicle.name}</Descriptions.Item>
                      <Descriptions.Item label="Model">{selectedVehicle.model}</Descriptions.Item>
                      <Descriptions.Item label="Năm sản xuất">{selectedVehicle.year}</Descriptions.Item>
                      <Descriptions.Item label="Số chỗ ngồi">{selectedVehicle.seats}</Descriptions.Item>
                      <Descriptions.Item label="Trạm hiện tại">{selectedVehicle.location}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                  <Card title="Giá thuê" style={{ marginBottom: 8 }} bodyStyle={{ padding: 16 }}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Giá thuê/giờ"><span style={{ color: '#faad14', fontWeight: 600 }}>{selectedVehicle.pricePerHour?.toLocaleString()} VND</span></Descriptions.Item>
                      <Descriptions.Item label="Giá thuê/ngày"><span style={{ color: '#faad14', fontWeight: 600 }}>{selectedVehicle.pricePerDay?.toLocaleString()} VND</span></Descriptions.Item>
                      <Descriptions.Item label="Đơn vị tiền tệ">{selectedVehicle.currency || 'VND'}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <Card title="Thông số kỹ thuật" style={{ marginBottom: 8 }} bodyStyle={{ padding: 16 }}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Tình trạng kỹ thuật">{selectedVehicle.condition}</Descriptions.Item>
                      <Descriptions.Item label="Pin (%)"><span style={{ color: '#52c41a', fontWeight: 600 }}>{selectedVehicle.batteryLevel}%</span></Descriptions.Item>
                      <Descriptions.Item label="Dung lượng pin">{selectedVehicle.batterykWh} kWh</Descriptions.Item>
                      <Descriptions.Item label="Quãng đường còn lại">{selectedVehicle.range} km</Descriptions.Item>
                      <Descriptions.Item label="Odo">{selectedVehicle.mileage} km</Descriptions.Item>
                      <Descriptions.Item label="Khóa phiên bản">{selectedVehicle.lockVersion}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                  <Card title="Đánh giá & chuyến đi" style={{ marginBottom: 8 }} bodyStyle={{ padding: 16 }}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Đánh giá trung bình"><span style={{ color: '#1890ff', fontWeight: 600 }}>{selectedVehicle.rating}</span></Descriptions.Item>
                      <Descriptions.Item label="Số lượt đánh giá">{selectedVehicle.reviewCount}</Descriptions.Item>
                      <Descriptions.Item label="Số chuyến đi">{selectedVehicle.trips}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <Card title="Mô tả & Tính năng" style={{ marginBottom: 8 }} bodyStyle={{ padding: 16 }}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Mô tả">{selectedVehicle.description}</Descriptions.Item>
                      <Descriptions.Item label="Tags">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 260 }}>
                          {selectedVehicle.tags?.map((tag: string) => (
                            <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>
                          ))}
                        </div>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                  <Card title="Thời gian" style={{ marginBottom: 8 }} bodyStyle={{ padding: 16 }}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Tính năng">{selectedVehicle.features?.join(', ')}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
                {/* <div style={{ marginTop: 12, color: '#faad14', textAlign: 'center', fontWeight: 500 }}>
                  Xác nhận chuyển sang màn hình thủ tục bàn giao.
                </div> */}
              </div>
            </div>
          </>
        )}
      </Modal>
    </Card>
  );
}

export default VehicleReserved;