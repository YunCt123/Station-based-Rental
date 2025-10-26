import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    Input,
    Space,
    Spin,
    Tag,
    Card,
    Modal,
    Descriptions,
    Button,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { stationService } from '../../../../services/stationService';
import { vehicleService } from '../../../../services/vehicleService';


const VehicleAvailable: React.FC = () => {
    const navigate = useNavigate();
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
    // Xoá biến stations không dùng
    const [stationOptions, setStationOptions] = useState<any[]>([]);
    const [selectedStation, setSelectedStation] = useState<string>('');

    useEffect(() => {
        // Không fetch mock nữa, chỉ khởi tạo rỗng
    }, []);

    // Fetch stations khi chọn thành phố
    useEffect(() => {
        if (!selectedCity) return;
        setLoading(true);
        stationService.getStationsByCity(selectedCity)
            .then((stations: any[]) => {
                setStationOptions((stations || []).map((station: any) => ({
                    value: station.id,
                    label: station.name
                })));
                setSelectedStation('');
                setVehicles([]);
            })
            .catch(() => {
                setStationOptions([]);
                setVehicles([]);
            })
            .finally(() => setLoading(false));
    }, [selectedCity]);

    // Fetch vehicles khi chọn trạm
    useEffect(() => {
        if (!selectedStation) return;
        setLoading(true);
        vehicleService.getAvailableVehiclesByStation(selectedStation)
            .then((res: any) => {
                // Support both shapes: an array or an object with a `data` array
                const vehiclesData = Array.isArray(res) ? res : (res?.data || []);
                setVehicles(vehiclesData);
            })
            .catch(() => setVehicles([]))
            .finally(() => setLoading(false));
    }, [selectedStation]);
    // Show details modal instead of navigating
    const handleOpenDetails = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        console.log('Selected Vehicle:', vehicle);
        setIsModalVisible(true);
    };
    const handleCloseDetails = () => {
        setIsModalVisible(false);
        setSelectedVehicle(null);
    };

    const handleStartDeliveryProcedure = () => {
        if (!selectedVehicle) return;
        setIsModalVisible(false);
        // Navigate to delivery procedures with vehicle data
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
            title: 'ID xe / Tên Xe',
            dataIndex: 'licensePlate',
            key: 'licensePlate',
            render: (_: any, record: any) => (
                <div>
                    <div><b>ID:</b> {record.id}</div>
                    <div><b>Tên Xe:</b> {record.name}</div>
                </div>
            ),
            filterDropdown: ({
                setSelectedKeys,
                selectedKeys,
                confirm,
            }: {
                setSelectedKeys: (selectedKeys: React.Key[]) => void;
                selectedKeys: React.Key[];
                confirm: () => void;
            }) => (
                <Input
                    placeholder="Search license plate"
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
            ),
            filterIcon: () => <SearchOutlined />,
        },
        {
            title: 'Loại xe / Model',
            key: 'typeModel',
            render: (_: any, record: any) => (
                <div>
                    <div><b>Loại:</b> {record.type}</div>
                    <div><b>Model:</b> {record.model}</div>
                </div>
            ),
        },
        {
            title: 'Tình trạng kỹ thuật',
            dataIndex: 'condition',
            key: 'condition',
            render: (condition: string) => (
                <Tag color={condition === 'excellent' ? 'blue' : (condition === 'good' ? 'green' : 'red')} style={{display: 'flex', justifyContent: 'center'}}>
                    {condition === 'excellent' ? 'Mới' : (condition === 'good' ? 'Tốt' : 'Cần bảo trì')}
                </Tag>
            ),
        },
        {
            title: 'Pin',
            dataIndex: 'batteryLevel',
            key: 'batteryLevel',
            render: (batteryLevel: string) => (
                <span>{batteryLevel}%</span>
            ),
        },
        {
            title: 'Vị trí xe',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'available' ? 'green' : 'orange'}>
                    Có sẵn
                </Tag>
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
                    onClick={() => handleOpenDetails(record)}
                >
                    Chi tiết
                </button>
            ),
        },
    ];

    return (
        <Card title="Danh sách xe có sẵn">
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
            {/* Modal chi tiết xe */}
            <Modal
                title="Chi tiết xe"
                open={isModalVisible}
                onCancel={handleCloseDetails}
                footer={[
                    <Button key="cancel" onClick={handleCloseDetails}>
                        Đóng
                    </Button>,
                    <Button key="start" type="primary" onClick={handleStartDeliveryProcedure}>
                        Bắt đầu thủ tục bàn giao
                    </Button>,
                ]}
                styles={{ body: { padding: 24 } }}
                width={900}
            >
                {selectedVehicle && (
                    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', padding: 8 }}>
                        <img
                            src={selectedVehicle.image}
                            alt="vehicle"
                            style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 12, border: '2px solid #e4e4e4', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#1890ff', letterSpacing: 1 }}>{selectedVehicle.name} <span style={{ color: '#555', fontWeight: 400 }}>({selectedVehicle.year})</span></div>
                            <div style={{ marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                                <Tag color={selectedVehicle.status === 'AVAILABLE' ? 'green' : 'orange'} style={{ fontWeight: 500, fontSize: 15 }}>{selectedVehicle.status === 'AVAILABLE' ? 'Có sẵn' : selectedVehicle.status}</Tag>
                                {selectedVehicle.active === false && <Tag color="red">Không hoạt động</Tag>}
                                <Tag color="blue">{selectedVehicle.type}</Tag>
                                <Tag color="geekblue">{selectedVehicle.brand}</Tag>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                                {/* Thông tin chung */}
                                <div>
                                    <Descriptions title={<span style={{ fontWeight: 600, color: '#333' }}>Thông tin chung</span>} size="small" column={1} style={{ marginBottom: 12 }}>
                                        <Descriptions.Item label="ID"><b>{selectedVehicle._id || selectedVehicle.id}</b></Descriptions.Item>
                                        <Descriptions.Item label="Tên xe">{selectedVehicle.name}</Descriptions.Item>
                                        <Descriptions.Item label="Model">{selectedVehicle.model}</Descriptions.Item>
                                        <Descriptions.Item label="Năm sản xuất">{selectedVehicle.year}</Descriptions.Item>
                                        <Descriptions.Item label="Số chỗ ngồi">{selectedVehicle.seats}</Descriptions.Item>
                                        <Descriptions.Item label="Trạm hiện tại">{selectedVehicle.location}</Descriptions.Item>
                                    </Descriptions>
                                    <Descriptions title={<span style={{ fontWeight: 600, color: '#333' }}>Giá thuê</span>} size="small" column={1} style={{ marginBottom: 12 }}>
                                        <Descriptions.Item label="Giá thuê/giờ"><span style={{ color: '#faad14', fontWeight: 600 }}>{selectedVehicle.pricePerHour?.toLocaleString()} VND</span></Descriptions.Item>
                                        <Descriptions.Item label="Giá thuê/ngày"><span style={{ color: '#faad14', fontWeight: 600 }}>{selectedVehicle.pricePerDay?.toLocaleString()} VND</span></Descriptions.Item>
                                        <Descriptions.Item label="Đơn vị tiền tệ">{selectedVehicle.priceCurrency}</Descriptions.Item>
                                        {/* <Descriptions.Item label="Giá chi tiết">
                                            {selectedVehicle.pricing ? <span style={{ color: '#faad14', fontWeight: 600 }}>Giờ: {selectedVehicle.pricing.hourly?.toLocaleString()} {selectedVehicle.pricing.currency}, Ngày: {selectedVehicle.pricing.daily?.toLocaleString()} {selectedVehicle.pricing.currency}</span> : ''}
                                        </Descriptions.Item> */}
                                    </Descriptions>
                                </div>
                                {/* Thông số kỹ thuật & đánh giá */}
                                <div>
                                    <Descriptions title={<span style={{ fontWeight: 600, color: '#333' }}>Thông số kỹ thuật</span>} size="small" column={1} style={{ marginBottom: 12 }}>
                                        <Descriptions.Item label="Tình trạng kỹ thuật">{selectedVehicle.condition}</Descriptions.Item>
                                        <Descriptions.Item label="Pin (%)"><span style={{ color: '#52c41a', fontWeight: 600 }}>{selectedVehicle.batteryLevel}%</span></Descriptions.Item>
                                        {/* <Descriptions.Item label="SOC">{selectedVehicle.battery_soc}</Descriptions.Item> */}
                                        <Descriptions.Item label="Dung lượng pin">{selectedVehicle.batterykWh} kWh</Descriptions.Item>
                                        <Descriptions.Item label="Quãng đường còn lại">{selectedVehicle.range} km</Descriptions.Item>
                                        <Descriptions.Item label="Odo">{selectedVehicle.mileage} km</Descriptions.Item>
                                        <Descriptions.Item label="Khóa phiên bản">{selectedVehicle.lockVersion}</Descriptions.Item>
                                    </Descriptions>
                                    <Descriptions title={<span style={{ fontWeight: 600, color: '#333' }}>Đánh giá & chuyến đi</span>} size="small" column={1} style={{ marginBottom: 12 }}>
                                        <Descriptions.Item label="Đánh giá trung bình"><span style={{ color: '#1890ff', fontWeight: 600 }}>{selectedVehicle.rating}</span></Descriptions.Item>
                                        <Descriptions.Item label="Số lượt đánh giá">{selectedVehicle.reviewCount}</Descriptions.Item>
                                        <Descriptions.Item label="Số chuyến đi">{selectedVehicle.trips}</Descriptions.Item>
                                    </Descriptions>
                                </div>
                            </div>
                            {/* Mô tả, tính năng, tags, thời gian */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                                <Descriptions title={<span style={{ fontWeight: 600, color: '#333' }}>Mô tả & tính năng</span>} size="small" column={1} style={{ marginBottom: 12 }}>
                                    <Descriptions.Item label="Mô tả">{selectedVehicle.description}</Descriptions.Item>
                                    <Descriptions.Item label="Tags">{selectedVehicle.tags?.join(', ')}</Descriptions.Item>
                                </Descriptions>
                                <Descriptions title={<span style={{ fontWeight: 600, color: '#333' }}>Thời gian</span>} size="small" column={1}>
                                    <Descriptions.Item label="Tính năng">{selectedVehicle.features?.join(', ')}</Descriptions.Item>
                                    {/* <Descriptions.Item label="Thời gian tạo">{selectedVehicle.createdAt ? new Date(selectedVehicle.createdAt).toLocaleString() : ''}</Descriptions.Item>
                                    <Descriptions.Item label="Cập nhật lần cuối">{selectedVehicle.updatedAt ? new Date(selectedVehicle.updatedAt).toLocaleString() : ''}</Descriptions.Item> */}
                                </Descriptions>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                    placeholder="Search vehicles..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ maxWidth: 300 }}
                />
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={vehicles.filter(v =>
                            Object.values(v).some(val =>
                                val?.toString().toLowerCase().includes(searchText.toLowerCase())
                            )
                        )}
                        rowKey="id"
                    />
                </Spin>
            </Space>
        </Card>
    );
}

export default VehicleAvailable;
