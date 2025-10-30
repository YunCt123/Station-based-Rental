import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Tag,
  Modal,
  message,
  Dropdown,
  Tooltip,
  Image,
  Select,
  Form
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  ExportOutlined,
  MoreOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import VehicleFormModal from './VehicleFormModal';
import VehicleDetailModal from './VehicleDetailModal';

const { Option } = Select;

// Temporary interface - will be replaced with actual API interface
interface Vehicle {
  _id: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  year: number;
  seats: number;
  batteryLevel: number;
  battery_kWh: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'RESERVED';
  image: string;
  licensePlate: string;
  odo_km: number;
  station_id?: {
    _id: string;
    name: string;
    city: string;
  };
  pricePerHour: number;
  pricePerDay: number;
  currency: string;
  condition: string;
  range: number;
  features: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  trips: number;
  createdAt: string;
  updatedAt: string;
}

const VehicleManagement: React.FC = () => {
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  
  // Modal states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Load vehicles data
  const loadVehicles = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await vehicleService.getAllVehicles();
      // setVehicles(response.data);
      
      // Mock data for now
      const mockVehicles: Vehicle[] = [
        {
          _id: '1',
          name: 'VinFast VF 8 Eco',
          brand: 'VinFast',
          model: 'VF 8 Eco',
          type: 'SUV EV',
          year: 2024,
          seats: 5,
          batteryLevel: 85,
          battery_kWh: 87.7,
          status: 'AVAILABLE',
          image: 'https://static-cms-prod.vinfastauto.com/SUV-co-trung-vf-8-eco.jpg',
          licensePlate: '30A-12345',
          odo_km: 12500,
          station_id: {
            _id: 'station1',
            name: 'EV Station - Nguyen Hue',
            city: 'Ho Chi Minh'
          },
          pricePerHour: 520000,
          pricePerDay: 3120000,
          currency: 'VND',
          condition: 'Excellent',
          range: 425,
          features: ['Auto Parking', 'Smart Cabin', 'Fast Charging'],
          tags: ['Premium', 'Electric', 'Family'],
          rating: 4.8,
          reviewCount: 142,
          trips: 256,
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-10-31T00:00:00Z'
        }
      ];
      setVehicles(mockVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      message.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // Handlers
  const handleCreateVehicle = () => {
    setEditingVehicle(null);
    setIsFormModalVisible(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormModalVisible(true);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    Modal.confirm({
      title: 'Xác nhận xóa xe',
      content: `Bạn có chắc chắn muốn xóa xe "${vehicle.name}" (${vehicle.licensePlate})?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          // TODO: Replace with actual API call
          // await vehicleService.deleteVehicle(vehicle._id);
          message.success('Xóa xe thành công');
          loadVehicles();
        } catch (error) {
          console.error('Error deleting vehicle:', error);
          message.error('Xóa xe thất bại');
        }
      }
    });
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalVisible(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingVehicle) {
        // TODO: Replace with actual API call
        // await vehicleService.updateVehicle(editingVehicle._id, values);
        message.success('Cập nhật xe thành công');
      } else {
        // TODO: Replace with actual API call
        // await vehicleService.createVehicle(values);
        message.success('Tạo xe mới thành công');
      }
      setIsFormModalVisible(false);
      setEditingVehicle(null);
      loadVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      message.error('Lưu xe thất bại');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'green';
      case 'RENTED':
        return 'blue';
      case 'MAINTENANCE':
        return 'orange';
      case 'RESERVED':
        return 'purple';
      default:
        return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Có sẵn';
      case 'RENTED':
        return 'Đang thuê';
      case 'MAINTENANCE':
        return 'Bảo trì';
      case 'RESERVED':
        return 'Đã đặt';
      default:
        return status;
    }
  };

  // Filter data
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = !searchText || 
      vehicle.name.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || vehicle.status === statusFilter;
    const matchesBrand = !brandFilter || vehicle.brand === brandFilter;
    
    return matchesSearch && matchesStatus && matchesBrand;
  });

  // Get unique brands for filter
  const uniqueBrands = Array.from(new Set(vehicles.map(v => v.brand)));

  // Table columns
  const columns: ColumnsType<Vehicle> = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string, record: Vehicle) => (
        <Image
          src={image}
          alt={record.name}
          width={80}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          placeholder
        />
      )
    },
    {
      title: 'Thông tin xe',
      key: 'vehicleInfo',
      render: (_, record: Vehicle) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {record.name}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.brand} • {record.model} • {record.year}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            Biển số: {record.licensePlate}
          </div>
        </div>
      )
    },
    {
      title: 'Loại xe',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Pin',
      dataIndex: 'batteryLevel',
      key: 'batteryLevel',
      render: (batteryLevel: number) => (
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {batteryLevel}%
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {batteryLevel >= 80 ? 'Đầy' : batteryLevel >= 50 ? 'Tốt' : 'Thấp'}
          </div>
        </div>
      )
    },
    {
      title: 'Vị trí',
      key: 'location',
      render: (_, record: Vehicle) => (
        <div>
          <div style={{ fontSize: 14 }}>
            {record.station_id?.name || 'Chưa có'}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.station_id?.city || ''}
          </div>
        </div>
      )
    },
    {
      title: 'Giá thuê',
      key: 'pricing',
      render: (_, record: Vehicle) => (
        <div>
          <div style={{ fontSize: 12 }}>
            Giờ: {record.pricePerHour.toLocaleString()} {record.currency}
          </div>
          <div style={{ fontSize: 12 }}>
            Ngày: {record.pricePerDay.toLocaleString()} {record.currency}
          </div>
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record: Vehicle) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditVehicle(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteVehicle(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Card title="Quản lý xe" className="h-full">
      {/* Header Controls */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Space>
            <Input
              placeholder="Tìm kiếm xe, biển số..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="AVAILABLE">Có sẵn</Option>
              <Option value="RENTED">Đang thuê</Option>
              <Option value="MAINTENANCE">Bảo trì</Option>
              <Option value="RESERVED">Đã đặt</Option>
            </Select>
            <Select
              placeholder="Hãng xe"
              value={brandFilter}
              onChange={setBrandFilter}
              style={{ width: 150 }}
              allowClear
            >
              {uniqueBrands.map(brand => (
                <Option key={brand} value={brand}>{brand}</Option>
              ))}
            </Select>
          </Space>
          
          <Space>
            <Button icon={<ExportOutlined />}>
              Xuất Excel
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateVehicle}
            >
              Thêm xe mới
            </Button>
          </Space>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {vehicles.length}
              </div>
              <div className="text-sm text-gray-500">Tổng số xe</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {vehicles.filter(v => v.status === 'AVAILABLE').length}
              </div>
              <div className="text-sm text-gray-500">Có sẵn</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {vehicles.filter(v => v.status === 'RENTED').length}
              </div>
              <div className="text-sm text-gray-500">Đang thuê</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {vehicles.filter(v => v.status === 'MAINTENANCE').length}
              </div>
              <div className="text-sm text-gray-500">Bảo trì</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredVehicles}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} xe`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Modals */}
      <VehicleFormModal
        visible={isFormModalVisible}
        vehicle={editingVehicle}
        onCancel={() => {
          setIsFormModalVisible(false);
          setEditingVehicle(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <VehicleDetailModal
        visible={isDetailModalVisible}
        vehicle={selectedVehicle}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedVehicle(null);
        }}
      />
    </Card>
  );
};

export default VehicleManagement;