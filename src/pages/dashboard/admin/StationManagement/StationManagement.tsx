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
  Select,
  Image,
  Rate,
  Progress,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  ExportOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import StationFormModal from './StationFormModal';
import StationDetailModal from './StationDetailModal';
import { adminStationService } from '../../../../services/adminStationService';

const { Option } = Select;

// Form values interface
interface StationFormValues {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  capacity: number;
  openTime: string;
  closeTime: string;
  amenities: string[];
  phone: string;
  email: string;
}

// Temporary interface - will be replaced with actual API interface
interface Station {
  _id: string;
  name: string;
  address: string;
  city: string;
  geo: {
    coordinates: [number, number];
  };
  totalSlots: number;
  amenities: string[];
  fastCharging: boolean;
  rating: number;
  operatingHours: {
    open: string;
    close: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  image: string;
  metrics: {
    availableSlots: number;
    occupiedSlots: number;
    maintenanceSlots: number;
  };
  pricing: {
    parkingFee: number;
    chargingFee: number;
    currency: string;
  };
  contact: {
    phone?: string;
    email?: string;
  };
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const StationManagement: React.FC = () => {
  // State management
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  
  // Modal states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Load stations data
  const loadStations = async () => {
    setLoading(true);
    try {
      const response = await adminStationService.getAllStations({
        limit: 100,
        page: 1,
        sort: '-createdAt'
      });
      
      if (response.success && response.data) {
        // Transform API data to match component interface
        const transformedStations: Station[] = response.data.map(station => ({
          _id: station._id,
          name: station.name,
          address: station.address || '',
          city: station.city,
          geo: {
            coordinates: station.geo.coordinates
          },
          totalSlots: station.totalSlots,
          amenities: station.amenities,
          fastCharging: station.fastCharging,
          rating: station.rating?.avg || 0,
          operatingHours: {
            open: station.operatingHours?.mon_fri?.split('-')[0] || '06:00',
            close: station.operatingHours?.mon_fri?.split('-')[1] || '22:00'
          },
          status: station.status === 'UNDER_MAINTENANCE' ? 'MAINTENANCE' : station.status as 'ACTIVE' | 'INACTIVE',
          image: station.image || '/placeholder-station.jpg',
          metrics: {
            availableSlots: station.metrics?.vehicles_available || 0,
            occupiedSlots: station.metrics?.vehicles_in_use || 0,
            maintenanceSlots: station.totalSlots - (station.metrics?.vehicles_available || 0) - (station.metrics?.vehicles_in_use || 0)
          },
          pricing: {
            parkingFee: 10000,
            chargingFee: 3500,
            currency: 'VND'
          },
          contact: {
            phone: '+84123456789',
            email: `${station.name.toLowerCase().replace(/\s+/g, '')}@evstation.com`
          },
          description: `Trạm sạc ${station.name} tại ${station.city}`,
          createdAt: station.createdAt,
          updatedAt: station.updatedAt
        }));
        
        setStations(transformedStations);
      } else {
        message.error('Không thể tải danh sách trạm');
      }
    } catch (error) {
      console.error('Error loading stations:', error);
      message.error('Lỗi khi tải danh sách trạm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  // Handlers
  const handleCreateStation = () => {
    setEditingStation(null);
    setIsFormModalVisible(true);
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
    setIsFormModalVisible(true);
  };

  const handleDeleteStation = (station: Station) => {
    Modal.confirm({
      title: 'Xác nhận xóa trạm',
      content: `Bạn có chắc chắn muốn xóa trạm "${station.name}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await adminStationService.deleteStation(station._id);
          if (response.success) {
            message.success('Xóa trạm thành công');
            loadStations();
          } else {
            message.error('Xóa trạm thất bại');
          }
        } catch (error) {
          console.error('Error deleting station:', error);
          message.error('Xóa trạm thất bại');
        }
      }
    });
  };

  const handleViewDetails = (station: Station) => {
    setSelectedStation(station);
    setIsDetailModalVisible(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      console.log('Received form values:', JSON.stringify(values, null, 2));
      
      // StationFormModal returns geo.coordinates array [lng, lat]
      if (!values.geo || !values.geo.coordinates || values.geo.coordinates.length !== 2) {
        console.error('Missing or invalid geo.coordinates in values:', values);
        message.error('Thiếu thông tin tọa độ');
        return;
      }
      
      const stationData = {
        name: values.name,
        address: values.address,
        city: values.city,
        geo: values.geo,  // { coordinates: [lng, lat] }
        capacity: values.capacity,
        operatingHours: values.operatingHours,
        amenities: values.amenities || [],
        contactInfo: values.contactInfo || { phone: '', email: '' },
        image: values.image,
        description: values.description
      };
      
      console.log('Sending to API:', JSON.stringify(stationData, null, 2));
      
      if (editingStation) {
        const response = await adminStationService.updateStation(editingStation._id, stationData as any);
        
        if (response.success) {
          message.success('Cập nhật trạm thành công');
        } else {
          message.error('Cập nhật trạm thất bại');
        }
      } else {
        const response = await adminStationService.createStation(stationData as any);
        
        if (response.success) {
          message.success('Tạo trạm mới thành công');
        } else {
          message.error('Tạo trạm mới thất bại');
        }
      }
      
      setIsFormModalVisible(false);
      setEditingStation(null);
      loadStations();
    } catch (error: any) {
      console.error('Error saving station:', error);
      const errorMessage = error?.message || (editingStation ? 'Cập nhật trạm thất bại' : 'Tạo trạm mới thất bại');
      message.error(errorMessage);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'red';
      case 'MAINTENANCE':
        return 'orange';
      default:
        return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'INACTIVE':
        return 'Ngưng hoạt động';
      case 'MAINTENANCE':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  // Calculate utilization rate
  const getUtilizationRate = (station: Station) => {
    const { availableSlots, occupiedSlots } = station.metrics;
    const totalActive = availableSlots + occupiedSlots;
    return totalActive > 0 ? (occupiedSlots / totalActive) * 100 : 0;
  };

  // Filter data
  const filteredStations = stations.filter(station => {
    const matchesSearch = !searchText || 
      station.name.toLowerCase().includes(searchText.toLowerCase()) ||
      station.address.toLowerCase().includes(searchText.toLowerCase()) ||
      station.city.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || station.status === statusFilter;
    const matchesCity = !cityFilter || station.city === cityFilter;
    
    return matchesSearch && matchesStatus && matchesCity;
  });

  // Get unique cities for filter
  const uniqueCities = Array.from(new Set(stations.map(s => s.city)));

  // Table columns
  const columns: ColumnsType<Station> = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string, record: Station) => (
        <Image
          src={image}
          alt={record.name}
          width={80}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          placeholder
          fallback="/placeholder-station.jpg"
        />
      )
    },
    {
      title: 'Thông tin trạm',
      key: 'stationInfo',
      render: (_, record: Station) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {record.name}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <EnvironmentOutlined /> {record.address}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.city}
          </div>
        </div>
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
      title: 'Slot sạc',
      key: 'slots',
      render: (_, record: Station) => {
        const { availableSlots, occupiedSlots, maintenanceSlots } = record.metrics;
        const utilizationRate = getUtilizationRate(record);
        
        return (
          <div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>
              <span style={{ color: '#52c41a' }}>{availableSlots}</span> / 
              <span style={{ color: '#1890ff' }}> {occupiedSlots}</span> / 
              <span style={{ color: '#faad14' }}> {maintenanceSlots}</span>
            </div>
            <Progress
              percent={utilizationRate}
              size="small"
              status={utilizationRate > 80 ? 'exception' : 'normal'}
              showInfo={false}
            />
            <div style={{ fontSize: 12, color: '#666' }}>
              Tổng: {record.totalSlots} slot
            </div>
          </div>
        );
      }
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <div>
          <Rate disabled defaultValue={rating} style={{ fontSize: 12 }} />
          <div style={{ fontSize: 12, color: '#666' }}>
            {rating}/5
          </div>
        </div>
      )
    },
    {
      title: 'Tiện ích',
      key: 'features',
      render: (_, record: Station) => (
        <div>
          {record.fastCharging && (
            <Tooltip title="Sạc nhanh">
              <ThunderboltOutlined style={{ color: '#faad14', marginRight: 4 }} />
            </Tooltip>
          )}
          <div style={{ fontSize: 12 }}>
            {record.amenities.length} tiện ích
          </div>
        </div>
      )
    },
    {
      title: 'Giờ hoạt động',
      key: 'hours',
      render: (_, record: Station) => (
        <div style={{ fontSize: 12 }}>
          <div>{record.operatingHours.open}</div>
          <div>đến {record.operatingHours.close}</div>
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record: Station) => (
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
              onClick={() => handleEditStation(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteStation(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Card title="Quản lý trạm sạc" className="h-full">
      {/* Header Controls */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Space>
            <Input
              placeholder="Tìm kiếm trạm, địa chỉ..."
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
              <Option value="ACTIVE">Hoạt động</Option>
              <Option value="INACTIVE">Ngưng hoạt động</Option>
              <Option value="MAINTENANCE">Bảo trì</Option>
            </Select>
            <Select
              placeholder="Thành phố"
              value={cityFilter}
              onChange={setCityFilter}
              style={{ width: 150 }}
              allowClear
            >
              {uniqueCities.map(city => (
                <Option key={city} value={city}>{city}</Option>
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
              onClick={handleCreateStation}
            >
              Thêm trạm mới
            </Button>
          </Space>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stations.length}
              </div>
              <div className="text-sm text-gray-500">Tổng số trạm</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stations.filter(s => s.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-gray-500">Hoạt động</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stations.filter(s => s.status === 'INACTIVE').length}
              </div>
              <div className="text-sm text-gray-500">Ngưng hoạt động</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stations.filter(s => s.status === 'MAINTENANCE').length}
              </div>
              <div className="text-sm text-gray-500">Bảo trì</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredStations}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} trạm`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Modals */}
      <StationFormModal
        visible={isFormModalVisible}
        station={editingStation as any}
        onCancel={() => {
          setIsFormModalVisible(false);
          setEditingStation(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <StationDetailModal
        visible={isDetailModalVisible}
        station={selectedStation as any}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedStation(null);
        }}
      />
    </Card>
  );
};

export default StationManagement;