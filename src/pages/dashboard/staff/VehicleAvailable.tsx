import React, { useState, useEffect } from 'react';
import {
    Table,
    Input,
    Space,
    Spin,
    Tag,
    Card,
    Modal,
    Descriptions,
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

    useEffect(() => {
        // Simulate loading
        setLoading(true);
        setTimeout(() => {
            setVehicles(mockVehicles);
            setLoading(false);
        }, 1000);
    }, []);

    // Show details modal instead of navigating
    const handleOpenDetails = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setIsModalVisible(true);
    };
    const handleCloseDetails = () => {
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
                    onClick={() => handleOpenDetails(record)}
                >
                    Chi tiết
                </button>
            ),
        },
    ];

    return (
        <Card title="Danh sách xe có sẵn">
            {/* Modal chi tiết xe */}
            <Modal
                title="Chi tiết xe"
                open={isModalVisible}
                onCancel={handleCloseDetails}
                footer={null}
                bodyStyle={{ padding: 24 }}
                width={760}
            >
                {selectedVehicle && (
                    <div
                        style={{
                            display: 'flex',
                            gap: 16,
                            alignItems: 'flex-start',
                        }}
                    >
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
                                <Tag color="green" style={{ fontWeight: 500 }}>Có sẵn</Tag>
                            </div>
                            <Descriptions
                                size="middle"
                                column={2}
                                labelStyle={{ color: '#888', width: 120 }}
                                contentStyle={{ fontWeight: 500 }}
                                bordered
                            >
                                <Descriptions.Item label="ID">{selectedVehicle.id}</Descriptions.Item>
                                <Descriptions.Item label="Biển số">{selectedVehicle.licensePlate}</Descriptions.Item>
                                <Descriptions.Item label="Loại xe">{selectedVehicle.type}</Descriptions.Item>
                                <Descriptions.Item label="Model">{selectedVehicle.model}</Descriptions.Item>
                                <Descriptions.Item label="Tình trạng kỹ thuật">{selectedVehicle.technicalStatus}</Descriptions.Item>
                                <Descriptions.Item label="Pin">{selectedVehicle.battery}</Descriptions.Item>
                                <Descriptions.Item label="Vị trí">{selectedVehicle.location}</Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color="green">Có sẵn</Tag>
                                </Descriptions.Item>
                            </Descriptions>
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
