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
  Tooltip,
  Image,
  Select
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import VehicleFormModal from './VehicleFormModal';
import VehicleDetailModal from './VehicleDetailModal';
import { adminVehicleService, type AdminVehicle } from '../../../../services/adminVehicleService';
import { adminStationService } from '../../../../services/adminStationService';

const { Option } = Select;

// Form values interface matching backend requirements
interface VehicleFormValues {
  name: string;
  year: number;
  brand: string;
  model: string;
  type: string;
  licensePlate: string;
  seats: number;
  pricePerHour: number;
  pricePerDay: number;
  battery_kWh: number;
  batteryLevel: number;
  range: number;
  odo_km: number;
  features: string[];
  condition: 'excellent' | 'good' | 'fair';
  description: string;
  tags: string[];
  image: string;
  station_id: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'RESERVED';
  currency: string;
}

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
  description?: string;
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
  const loadVehicles = async (forceRefresh = false) => {
    setLoading(true);
    try {
      console.log('Loading vehicles...', forceRefresh ? '(forced refresh)' : '');
      const response = await adminVehicleService.getAllVehicles({
        limit: 100,
        page: 1,
        sort: '-updatedAt' // Sort by most recently updated
      });
      
      console.log('Vehicles API response:', response);
      
      if (response.success && response.data) {
        // Transform API data to match component interface
        const transformedVehicles: Vehicle[] = response.data.map(vehicle => {
          console.log('Transforming vehicle:', vehicle);
          return {
            _id: vehicle._id,
            name: vehicle.name,
            brand: vehicle.brand || 'Unknown',
            model: vehicle.model || '',
            type: vehicle.type || 'Car',
            year: vehicle.year,
            seats: vehicle.seats,
            batteryLevel: vehicle.batteryLevel || vehicle.battery_soc || 80,
            battery_kWh: vehicle.battery_kWh || 50,
            status: vehicle.status,
            image: vehicle.image || '/placeholder-vehicle.jpg',
            licensePlate: vehicle.licensePlate || `${vehicle.brand}-${vehicle._id.slice(-4)}`, // Use real licensePlate or fallback
            odo_km: vehicle.odo_km || vehicle.mileage || 0,
            station_id: vehicle.station_id ? {
              _id: vehicle.station_id,
              name: vehicle.station_name || 'Unknown Station',
              city: 'Ho Chi Minh'
            } : undefined,
            pricePerHour: vehicle.pricePerHour || vehicle.pricing?.hourly || 100000,
            pricePerDay: vehicle.pricePerDay || vehicle.pricing?.daily || 600000,
            currency: vehicle.pricing?.currency || 'VND',
            condition: vehicle.condition || 'good',
            range: vehicle.range || 300,
            features: vehicle.features || [],
            tags: vehicle.tags || [],
            description: vehicle.description || '',
            rating: vehicle.rating || 4.0,
            reviewCount: vehicle.reviewCount || 0,
            trips: vehicle.trips || 0,
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt
          };
        });
        
        console.log('Transformed vehicles:', transformedVehicles);
        setVehicles(transformedVehicles);
      } else {
        console.error('Failed to load vehicles:', response);
        message.error('Không thể tải danh sách xe');
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      message.error('Lỗi khi tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  // Update a specific vehicle in the state
  const updateVehicleInState = (updatedVehicle: Vehicle) => {
    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => 
        vehicle._id === updatedVehicle._id ? updatedVehicle : vehicle
      )
    );
  };

  // Transform API vehicle to component vehicle
  const transformApiVehicle = (apiVehicle: AdminVehicle): Vehicle => {
    return {
      _id: apiVehicle._id,
      name: apiVehicle.name,
      brand: apiVehicle.brand || 'Unknown',
      model: apiVehicle.model || '',
      type: apiVehicle.type || 'Car',
      year: apiVehicle.year,
      seats: apiVehicle.seats,
      batteryLevel: apiVehicle.batteryLevel || apiVehicle.battery_soc || 80,
      battery_kWh: apiVehicle.battery_kWh || 50,
      status: apiVehicle.status,
      image: apiVehicle.image || '/placeholder-vehicle.jpg',
      licensePlate: apiVehicle.licensePlate || `${apiVehicle.brand}-${apiVehicle._id.slice(-4)}`, // Use real licensePlate or fallback
      odo_km: apiVehicle.odo_km || apiVehicle.mileage || 0,
      station_id: apiVehicle.station_id ? {
        _id: apiVehicle.station_id,
        name: apiVehicle.station_name || 'Unknown Station',
        city: 'Ho Chi Minh'
      } : undefined,
      pricePerHour: apiVehicle.pricePerHour || apiVehicle.pricing?.hourly || 100000,
      pricePerDay: apiVehicle.pricePerDay || apiVehicle.pricing?.daily || 600000,
      currency: apiVehicle.pricing?.currency || 'VND',
      condition: apiVehicle.condition || 'good',
      range: apiVehicle.range || 300,
      features: apiVehicle.features || [],
      tags: apiVehicle.tags || [],
      description: apiVehicle.description || '',
      rating: apiVehicle.rating || 4.0,
      reviewCount: apiVehicle.reviewCount || 0,
      trips: apiVehicle.trips || 0,
      createdAt: apiVehicle.createdAt,
      updatedAt: apiVehicle.updatedAt
    };
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
          const response = await adminVehicleService.deleteVehicle(vehicle._id);
          if (response.success) {
            message.success('Xóa xe thành công');
            loadVehicles();
          } else {
            message.error('Xóa xe thất bại');
          }
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

  // Helper function to get station name by ID
  const getStationName = async (stationId: string): Promise<string> => {
    try {
      const response = await adminStationService.getStationById(stationId);
      return response.success ? response.data.name : '';
    } catch (error) {
      console.error('Error fetching station name:', error);
      return '';
    }
  };

  // Helper function to create synchronized pricing data
  const createPricingData = (pricePerHour: number, pricePerDay: number, currency: string = 'VND') => {
    return {
      pricePerHour,
      pricePerDay,
      pricing: {
        hourly: pricePerHour,
        daily: pricePerDay,
        currency
      }
    };
  };

  const handleFormSubmit = async (values: VehicleFormValues) => {
    try {
      console.log('=== FORM SUBMIT DEBUG ===');
      console.log('Form values:', values);
      console.log('Editing vehicle:', editingVehicle);
      
      // Always handle as JSON since image is already uploaded to Cloudinary
      const formValues = values;
      
      // Validate and transform pricing values
      const pricePerHour = Number(formValues.pricePerHour);
      const pricePerDay = Number(formValues.pricePerDay);
      
      if (isNaN(pricePerHour) || pricePerHour <= 0) {
        message.error('Giá thuê theo giờ không hợp lệ');
        return;
      }
      
      if (isNaN(pricePerDay) || pricePerDay <= 0) {
        message.error('Giá thuê theo ngày không hợp lệ');
        return;
      }
      
      console.log('Validated pricing:', { pricePerHour, pricePerDay });
      
      // Get station name if station_id is provided
      let stationName = '';
      if (formValues.station_id) {
        stationName = await getStationName(formValues.station_id);
        console.log('Station name:', stationName);
      }

      // Create synchronized pricing data
      const pricingData = createPricingData(pricePerHour, pricePerDay, formValues.currency);
      console.log('Pricing data:', pricingData);
        
        if (editingVehicle) {
          console.log('=== UPDATE OPERATION ===');
          console.log('Updating vehicle with ID:', editingVehicle._id);
          
          const updateData = {
            name: formValues.name,
            year: Number(formValues.year),
            brand: formValues.brand,
            model: formValues.model,
            type: formValues.type,
            licensePlate: formValues.licensePlate,
            seats: Number(formValues.seats),
            ...pricingData, // Spread synchronized pricing
            batteryLevel: Number(formValues.batteryLevel),
            battery_kWh: Number(formValues.battery_kWh),
            range: Number(formValues.range),
            odo_km: Number(formValues.odo_km),
            features: formValues.features || [],
            condition: formValues.condition,
            description: formValues.description || '',
            tags: formValues.tags || [],
            image: formValues.image,
            station_id: formValues.station_id || undefined,
            station_name: stationName, // Add station name
            status: formValues.status || 'AVAILABLE',
          };
          
          console.log('=== UPDATE DATA ===');
          console.log('Update payload:', updateData);
          
          const response = await adminVehicleService.updateVehicle(editingVehicle._id, updateData);
          console.log('=== UPDATE RESPONSE ===');
          console.log('API response:', response);
          
          if (response.success) {
            message.success('Cập nhật xe thành công');
            console.log('Updated vehicle data:', response.data);
            
            // Update the specific vehicle in state instead of reloading all
            if (response.data) {
              const updatedVehicle = transformApiVehicle(response.data);
              console.log('Transformed updated vehicle:', updatedVehicle);
              updateVehicleInState(updatedVehicle);
            }
          } else {
            message.error('Cập nhật xe thất bại');
            console.error('Update failed:', response);
          }
        } else {
          console.log('=== CREATE OPERATION ===');
          const createData = {
            name: formValues.name,
            year: Number(formValues.year),
            brand: formValues.brand,
            model: formValues.model,
            type: formValues.type,
            licensePlate: formValues.licensePlate,
            seats: Number(formValues.seats),
            ...pricingData, // Spread synchronized pricing
            battery_kWh: Number(formValues.battery_kWh),
            batteryLevel: Number(formValues.batteryLevel),
            range: Number(formValues.range),
            odo_km: Number(formValues.odo_km),
            features: formValues.features || [],
            condition: formValues.condition,
            description: formValues.description || '',
            tags: formValues.tags || [],
            image: formValues.image,
            station_id: formValues.station_id || undefined,
            station_name: stationName, // Add station name
            status: formValues.status || 'AVAILABLE',
            active: true
          };
          
          console.log('=== CREATE DATA ===');
          console.log('Create payload:', createData);
          
          const response = await adminVehicleService.createVehicle(createData);
          console.log('=== CREATE RESPONSE ===');
          console.log('API response:', response);
          
          if (response.success) {
            message.success('Tạo xe mới thành công');
          } else {
            message.error('Tạo xe mới thất bại');
          }
        }
      
      // Close modal and reset state
      setIsFormModalVisible(false);
      setEditingVehicle(null);
      
      // Only reload if it was a create operation or update failed
      if (!editingVehicle) {
        console.log('Reloading vehicles after create...');
        setTimeout(() => {
          loadVehicles(true); // Force refresh
        }, 500);
      }
      
    } catch (error) {
      console.error('Error saving vehicle:', error);
      message.error(editingVehicle ? 'Cập nhật xe thất bại' : 'Tạo xe mới thất bại');
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
            {/* <Button icon={<ExportOutlined />}>
              Xuất Excel
            </Button> */}
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