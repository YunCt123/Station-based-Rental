import React, { useState, useEffect } from 'react';
import {
    Table,
    Input,
    Space,
    Spin,
    message,
    Tag,
    Card,
    Modal,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';

// Mock data
const mockVehicles = [
    {
        id: 1,
        type: 'Car',
        model: 'Toyota Vios',
        licensePlate: 'ABC-123',
        technicalStatus: 'Tốt',
        battery: '80%',
        status: 'available',
        location: 'Station A',
        image: 'https://i1-vnexpress.vnecdn.net/2023/05/10/Vios202310jpg-1683690295.jpg?w=750&h=450&q=100&dpr=1&fit=crop&s=BteldbQmWr_H2MzwpRG3DQ'
    },
    {
        id: 2,
        type: 'Motorcycle',
        model: 'Honda Wave',
        licensePlate: 'XYZ-789',
        technicalStatus: 'Bình thường',
        battery: '60%',
        status: 'available',
        location: 'Station B',
        image: 'https://via.placeholder.com/80x50?text=Motorcycle'
    },
    {
        id: 3,
        type: 'Bicycle',
        model: 'Giant',
        licensePlate: 'DEF-456',
        technicalStatus: 'Tốt',
        battery: 'N/A',
        status: 'available',
        location: 'Station A',
        image: 'https://via.placeholder.com/80x50?text=Bicycle'
    },
];

export default function VehicleAvailable() {
    const [vehicles, setVehicles] = useState(mockVehicles);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [deliveredVehicle, setDeliveredVehicle] = useState<any>(null);

    useEffect(() => {
        // Simulate loading
        setLoading(true);
        setTimeout(() => {
            setVehicles(mockVehicles);
            setLoading(false);
        }, 1000);
    }, []);

    const handleSelectVehicle = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setIsModalVisible(true);
    };

    const handleConfirmDelivery = () => {
        setDeliveredVehicle(selectedVehicle);
        setIsModalVisible(false);
        message.success(`Xe ${selectedVehicle.licensePlate} đã được giao cho khách.`);
        // Nếu muốn loại xe khỏi danh sách có sẵn:
        setVehicles(prev => prev.filter(v => v.id !== selectedVehicle.id));
        setSelectedVehicle(null);
    };

    const handleCancelDelivery = () => {
        setIsModalVisible(false);
        setSelectedVehicle(null);
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
            title: 'ID xe / Biển số',
            dataIndex: 'licensePlate',
            key: 'licensePlate',
            render: (_: any, record: any) => (
                <div>
                    <div><b>ID:</b> {record.id}</div>
                    <div><b>Biển số:</b> {record.licensePlate}</div>
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
            dataIndex: 'technicalStatus',
            key: 'technicalStatus',
        },
        {
            title: 'Pin',
            dataIndex: 'battery',
            key: 'battery',
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
                    onClick={() => handleSelectVehicle(record)}
                >
                    Chọn xe
                </button>
            ),
        },
    ];

    return (
        <Card title="Available Vehicles">
            {/* Modal xác nhận giao xe */}
            <Modal
                title="Xác nhận giao xe"
                open={isModalVisible}
                onOk={handleConfirmDelivery}
                onCancel={handleCancelDelivery}
                okText="Giao xe"
                cancelText="Hủy"
                bodyStyle={{ padding: 24 }}
            >
                {selectedVehicle && (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                border: '1px solid #f0f0f0',
                                borderRadius: 8,
                                padding: 16,
                                background: '#fafafa',
                                gap: 0,
                            }}
                        >
                            <img
                                src={selectedVehicle.image}
                                alt="vehicle"
                                style={{
                                    width: 120,
                                    height: 80,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                    border: '1px solid #e4e4e4',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                }}
                            />
                            <div style={{ flex: 2, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <div style={{ minWidth: 120, textAlign: 'left' }}>
                                    <div style={{ marginBottom: 12, fontSize: 16 }}>
                                        <b>{selectedVehicle.type} - {selectedVehicle.model}</b>
                                    </div>
                                    <div style={{ color: '#888', marginBottom: 8 }}>ID:</div>
                                    <div style={{ color: '#888', marginBottom: 8 }}>Biển số:</div>
                                    <div style={{ color: '#888', marginBottom: 8 }}>Tình trạng kỹ thuật:</div>
                                    <div style={{ color: '#888', marginBottom: 8 }}>Pin:</div>
                                    <div style={{ color: '#888', marginBottom: 8 }}>Vị trí:</div>
                                    <div style={{ color: '#888', marginBottom: 8 }}>Trạng thái:</div>
                                </div>
                                <div style={{ minWidth: 120, textAlign: 'right' }}>
                                    <div style={{ marginBottom: 12, fontSize: 16, visibility: 'hidden' }}>
                                        {selectedVehicle.type} - {selectedVehicle.model}
                                    </div>
                                    <div style={{ marginBottom: 8 }}><b>{selectedVehicle.id}</b></div>
                                    <div style={{ marginBottom: 8 }}><b>{selectedVehicle.licensePlate}</b></div>
                                    <div style={{ marginBottom: 8 }}>{selectedVehicle.technicalStatus}</div>
                                    <div style={{ marginBottom: 8 }}>{selectedVehicle.battery}</div>
                                    <div style={{ marginBottom: 8 }}>{selectedVehicle.location}</div>
                                    <div style={{ marginBottom: 8 }}>
                                        <Tag color="green" style={{ fontWeight: 500 }}>Có sẵn</Tag>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: 16, color: 'red', textAlign: 'center', fontWeight: 500 }}>
                            Bạn có chắc chắn muốn giao xe này cho khách?
                        </div>
                    </>
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
                {deliveredVehicle && (
                    <Card
                        type="inner"
                        title="Xe đã giao cho khách"
                        style={{
                            marginTop: 16,
                            background: '#f6ffed',
                            borderColor: '#b7eb8f',
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 32,
                                padding: 8,
                            }}
                        >
                            <img
                                src={deliveredVehicle.image}
                                alt="vehicle"
                                style={{
                                    width: 240,
                                    height: 160,
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                    border: '1px solid #e4e4e4',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                    marginRight: 32,
                                }}
                            />
                            <div style={{ flex: 2, width: '100%' }}>
                                <div style={{ marginBottom: 12, fontSize: 16 }}>
                                    <b>{deliveredVehicle.type} - {deliveredVehicle.model}</b>
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'auto 1fr auto 1fr',
                                        gap: '8px 16px',
                                        marginBottom: 8,
                                    }}
                                >
                                    <div style={{ color: '#888' }}>ID:</div>
                                    <div><b>{deliveredVehicle.id}</b></div>
                                    <div style={{ color: '#888' }}>Biển số:</div>
                                    <div><b>{deliveredVehicle.licensePlate}</b></div>
                                    <div style={{ color: '#888' }}>Tình trạng kỹ thuật:</div>
                                    <div>{deliveredVehicle.technicalStatus}</div>
                                    <div style={{ color: '#888' }}>Pin:</div>
                                    <div>{deliveredVehicle.battery}</div>
                                    <div style={{ color: '#888' }}>Vị trí:</div>
                                    <div>{deliveredVehicle.location}</div>
                                    <div style={{ color: '#888' }}>Trạng thái:</div>
                                    <div>
                                        <Tag color="green" style={{ fontWeight: 500 }}>Đã giao</Tag>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </Space>
        </Card>
    );
}

