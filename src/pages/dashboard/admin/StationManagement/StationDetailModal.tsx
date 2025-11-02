import React, { useState, useEffect } from 'react';
import {
  Modal,
  Descriptions,
  Image,
  Tag,
  Card,
  Row,
  Col,
  Progress,
  Divider,
  Typography,
  Space,
  Rate,
  List,
  Spin,
  Button,
  Tabs
} from 'antd';
import {
  EnvironmentOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CarOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { stationService } from '@/services/stationService';
import type { Vehicle } from '@/types/vehicle';
import { LeafletMap } from '@/components/LeafletMap';
import api from '@/services/api';

const { Title, Text } = Typography;

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string; // Backend uses phoneNumber, not phone
  role: string;
  avatar?: string;
  status: string;
  createdAt: string;
}

interface StationStaffResponse {
  station: {
    id: string;
    name: string;
    address: string;
    city: string;
    status: string;
  };
  manager: User | null;
  staff: User[];
  summary: {
    total_staff: number;
    has_manager: boolean;
    active_staff: number;
  };
}

interface Station {
  _id: string;
  name: string;
  address?: string;
  city: string;
  geo: {
    coordinates: [number, number];
  };
  totalSlots: number;
  amenities: string[];
  fastCharging: boolean;
  rating: {
    avg: number;
    count: number;
  };
  operatingHours: {
    mon_fri?: string;
    weekend?: string;
    holiday?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  manager_id?: string;
  staff_ids?: string[];
  metrics: {
    vehicles_total: number;
    vehicles_available: number;
    vehicles_in_use: number;
    utilization_rate: number;
  };
  image?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

interface StationDetailModalProps {
  visible: boolean;
  station: Station | null;
  onCancel: () => void;
}

const StationDetailModal: React.FC<StationDetailModalProps> = ({
  visible,
  station,
  onCancel
}) => {
  const [stationVehicles, setStationVehicles] = useState<{
    vehicles: Vehicle[];
    count: number;
    loading: boolean;
  }>({
    vehicles: [],
    count: 0,
    loading: false
  });

  const [stationStaff, setStationStaff] = useState<{
    manager: User | null;
    staff: User[];
    summary: {
      total_staff: number;
      has_manager: boolean;
      active_staff: number;
    } | null;
    loading: boolean;
  }>({
    manager: null,
    staff: [],
    summary: null,
    loading: false
  });

  // Fetch station vehicles when modal opens
  const fetchStationVehicles = React.useCallback(async () => {
    if (!station?._id) return;
    
    setStationVehicles(prev => ({ ...prev, loading: true }));
    try {
      const response = await stationService.getStationVehicles(station._id);
      setStationVehicles({
        vehicles: response.vehicles,
        count: response.count,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching station vehicles:', error);
      setStationVehicles(prev => ({ ...prev, loading: false }));
    }
  }, [station?._id]);

  // Fetch station staff information using new API
  const fetchStationStaff = React.useCallback(async () => {
    if (!station?._id) return;
    
    setStationStaff(prev => ({ ...prev, loading: true }));
    try {
      console.log('🔍 Fetching station staff for:', station._id);
      const response = await api.get<{
        success: boolean;
        data: StationStaffResponse;
      }>(`/stations/${station._id}/staff`);
      
      console.log('✅ Station staff response:', response.data);
      
      const staffData = response.data.data;
      setStationStaff({
        manager: staffData.manager,
        staff: staffData.staff,
        summary: staffData.summary,
        loading: false
      });
    } catch (error) {
      console.error('❌ Error fetching station staff:', error);
      setStationStaff(prev => ({ ...prev, loading: false }));
    }
  }, [station?._id]);

  useEffect(() => {
    if (visible && station?._id) {
      fetchStationVehicles();
      fetchStationStaff();
    }
  }, [visible, station?._id, fetchStationVehicles, fetchStationStaff]);

  if (!station) return null;

  // Safe access to nested properties
  const coordinates = station.geo?.coordinates || [0, 0];
  const rating = station.rating || { avg: 0, count: 0 };
  const operatingHours = station.operatingHours || {};
  const metrics = station.metrics || {
    vehicles_total: 0,
    vehicles_available: 0,
    vehicles_in_use: 0,
    utilization_rate: 0
  };
  const amenities = station.amenities || [];

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'red';
      case 'UNDER_MAINTENANCE':
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
      case 'UNDER_MAINTENANCE':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  // Get utilization color
  const getUtilizationColor = (rate: number) => {
    if (rate >= 0.8) return '#ff4d4f';
    if (rate >= 0.6) return '#faad14';
    return '#52c41a';
  };

  // Amenity labels
  const amenityLabels: Record<string, string> = {
    wifi: 'Wi-Fi',
    cafe: 'Quán cà phê',
    restroom: 'Nhà vệ sinh',
    parking: 'Bãi đỗ xe',
    fast_charging: 'Sạc nhanh',
    shopping: 'Mua sắm',
    atm: 'ATM',
    food_court: 'Khu ăn uống',
    security: 'An ninh',
    waiting_area: 'Khu chờ',
    phone_charging: 'Sạc điện thoại',
    air_conditioning: 'Điều hòa'
  };

  // Amenity icons
  // const amenityIcons: Record<string, React.ReactNode> = {
  //   wifi: '📶',
  //   cafe: '☕',
  //   restroom: '🚻',
  //   parking: '🅿️',
  //   fast_charging: '⚡',
  //   shopping: '🛍️',
  //   atm: '🏧',
  //   food_court: '🍽️',
  //   security: '🔒',
  //   waiting_area: '🪑',
  //   phone_charging: '🔌',
  //   air_conditioning: '❄️'
  // };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <EnvironmentOutlined className="mr-2" />
          Chi tiết trạm: {station.name}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1400}
      style={{ top: 20 }}
    >
      <Row gutter={24}>
        {/* Left Column - Image and Overview */}
        <Col span={8}>
          <Card>
            {station.image && (
              <Image
                src={station.image}
                alt={station.name}
                style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
                placeholder
                fallback="/placeholder-station.jpg"
              />
            )}
            
            <div>
              <Title level={4}>{station.name}</Title>
              <Space wrap style={{ marginBottom: 16 }}>
                <Tag color={getStatusColor(station.status)} className="text-sm">
                  {getStatusText(station.status)}
                </Tag>
                {station.fastCharging && (
                  <Tag color="gold" icon={<ThunderboltOutlined />}>
                    Sạc nhanh
                  </Tag>
                )}
                <Tag color="blue">{station.city}</Tag>
              </Space>
            </div>

            {/* Address */}
            <div className="mb-4">
              <Text strong>
                <EnvironmentOutlined /> Địa chỉ
              </Text>
              <div className="mt-1">
                <Text>{station.address}</Text>
                <br />
                <Text type="secondary">{station.city}</Text>
              </div>
            </div>

            {/* Coordinates */}
            <div className="mb-4">
              <Text strong>Tọa độ GPS</Text>
              <div className="mt-1">
                <Text code>
                  {(coordinates[1] || 0).toFixed(6)}, {(coordinates[0] || 0).toFixed(6)}
                </Text>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <Text strong>Đánh giá</Text>
              <div className="mt-1">
                <Rate disabled defaultValue={rating.avg || 0} style={{ fontSize: 16 }} />
                <div className="text-sm text-gray-500">
                  {(rating.avg || 0).toFixed(1)}/5 ({rating.count || 0} đánh giá)
                </div>
              </div>
            </div>

            {/* Location Map */}
            <div className="mb-4">
              <Text strong>Vị trí trạm</Text>
              <div className="mt-2">
                <LeafletMap
                  station={{
                    id: station._id,
                    name: station.name,
                    address: station.address || '',
                    city: station.city,
                    coordinates: {
                      lat: coordinates[1] || 0,
                      lng: coordinates[0] || 0,
                    },
                    availableVehicles: stationVehicles.vehicles.filter(v => v.availability === 'available').length
                  }}
                  height="250px"
                  showControls={true}
                  showNearbyStations={true}
                />
              </div>
            </div>
          </Card>
        </Col>

        {/* Middle Column - Details */}
        <Col span={8}>
          <Card title="Thông tin chi tiết">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="ID">
                <Text code>{station._id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số slot">
                <Text strong>{station.totalSlots}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Xe có sẵn">
                <Space>
                  <span style={{ color: '#52c41a', fontWeight: 600 }}>
                    {stationVehicles.loading ? (
                      <Spin size="small" />
                    ) : (
                      stationVehicles.vehicles.filter(v => v.availability === 'available').length
                    )}
                  </span>
                  <Button 
                    size="small" 
                    type="link" 
                    icon={<ReloadOutlined />}
                    onClick={fetchStationVehicles}
                    loading={stationVehicles.loading}
                  >
                    Làm mới
                  </Button>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Xe đang sử dụng">
                <span style={{ color: '#1890ff', fontWeight: 600 }}>
                  {stationVehicles.loading ? (
                    <Spin size="small" />
                  ) : (
                    stationVehicles.vehicles.filter(v => v.availability === 'rented').length
                  )}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Xe bảo trì">
                <span style={{ color: '#faad14', fontWeight: 600 }}>
                  {stationVehicles.loading ? (
                    <Spin size="small" />
                  ) : (
                    stationVehicles.vehicles.filter(v => v.availability === 'maintenance').length
                  )}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng xe">
                <span style={{ color: '#722ed1', fontWeight: 600 }}>
                  {stationVehicles.loading ? (
                    <Spin size="small" />
                  ) : (
                    stationVehicles.count
                  )}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Manager and Staff Information */}
            <div className="mb-4">

                  {/* Manager */}
                  {stationStaff.manager ? (
                    <div className="mb-3">
                      <Text strong>
                        <UserOutlined /> Quản lý trạm:
                      </Text>
                      <div className="mt-1 p-2 bg-gray-50 rounded">
                        <div>
                          <Text strong>{stationStaff.manager.name}</Text>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{stationStaff.manager.email}</div>
                          {stationStaff.manager.phoneNumber && (
                            <div>{stationStaff.manager.phoneNumber}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <Text strong>
                        <UserOutlined /> Quản lý trạm:
                      </Text>
                      <div className="mt-1 text-gray-500">Chưa có quản lý được chỉ định</div>
                    </div>
                  )}

                  {/* Staff */}
                  <div>
                    <Text strong>
                      <TeamOutlined /> Nhân viên ({stationStaff.staff.length}):
                    </Text>
                    {stationStaff.staff.length > 0 ? (
                      <div className="mt-1">
                        {stationStaff.staff.map((staffMember) => (
                          <div key={staffMember._id} className="p-2 bg-gray-50 rounded mb-2">
                            <div>
                              <Text strong>{staffMember.name}</Text>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>{staffMember.email}</div>
                              {staffMember.phoneNumber && (
                                <div>{staffMember.phoneNumber}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 text-gray-500">Chưa có nhân viên nào được chỉ định</div>
                    )}
                  </div>
                </div>
            

            <Divider />

            {/* Utilization Rate */}
            <div className="mb-4">
              <Text strong>Tỷ lệ sử dụng</Text>
              <Progress
                percent={Math.round((metrics.utilization_rate || 0) * 100)}
                strokeColor={getUtilizationColor(metrics.utilization_rate || 0)}
                className="mt-2"
              />
            </div>

            <Divider />

            {/* Operating Hours */}
            <div className="mb-4">
              <Text strong>
                <ClockCircleOutlined /> Giờ hoạt động
              </Text>
              <div className="mt-2">
                {operatingHours.mon_fri && (
                  <div className="mb-1">
                    <Text>Thứ 2-6: </Text>
                    <Text strong>{operatingHours.mon_fri}</Text>
                  </div>
                )}
                {operatingHours.weekend && (
                  <div className="mb-1">
                    <Text>Cuối tuần: </Text>
                    <Text strong>{operatingHours.weekend}</Text>
                  </div>
                )}
                {operatingHours.holiday && (
                  <div className="mb-1">
                    <Text>Ngày lễ: </Text>
                    <Text strong>{operatingHours.holiday}</Text>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {station.description && (
              <>
                <Divider />
                <div>
                  <Text strong>Mô tả</Text>
                  <div className="mt-2">
                    <Text>{station.description}</Text>
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Divider />
            <div className="text-sm text-gray-500">

              <div>Cập nhật: {new Date(station.updatedAt).toLocaleString()}</div>
            </div>
          </Card>
        </Col>

        {/* Right Column - Amenities and Stats */}
        <Col span={8}>
          <Card title="Tiện ích & Dịch vụ" className="mb-4">
            <List
              dataSource={amenities}
              renderItem={(amenity) => (
                <List.Item style={{ padding: '8px 0', border: 'none' }}>
                  <Space>
                    {/* <span style={{ fontSize: '16px' }}>
                      {amenityIcons[amenity] || '•'}
                    </span> */}
                    <Text>{amenityLabels[amenity] || amenity}</Text>
                  </Space>
                </List.Item>
              )}
              locale={{ emptyText: 'Không có tiện ích nào' }}
            />
          </Card>

          {/* Statistics */}
          <Card title="Thống kê realtime">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div className="text-2xl font-bold text-blue-600">
                    {station.totalSlots}
                  </div>
                  <div className="text-sm text-gray-500">Tổng slot</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div className="text-2xl font-bold text-green-600">
                    {stationVehicles.loading ? (
                      <Spin size="small" />
                    ) : (
                      stationVehicles.vehicles.filter(v => v.availability === 'available').length
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Xe sẵn sàng</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div className="text-2xl font-bold text-orange-600">
                    {stationVehicles.loading ? (
                      <Spin size="small" />
                    ) : (
                      stationVehicles.vehicles.filter(v => v.availability === 'rented').length
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Đang sử dụng</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div className="text-2xl font-bold text-purple-600">
                    {stationVehicles.loading ? (
                      <Spin size="small" />
                    ) : (
                      stationVehicles.count > 0 
                        ? Math.round((stationVehicles.vehicles.filter(v => v.availability === 'rented').length / stationVehicles.count) * 100)
                        : 0
                    )}%
                  </div>
                  <div className="text-sm text-gray-500">Tỷ lệ sử dụng</div>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Vehicle List */}
          <Card 
            title={
              <Space>
                <CarOutlined />
                Danh sách xe tại trạm
              </Space>
            } 
            className="mt-4"
            extra={
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={fetchStationVehicles}
                loading={stationVehicles.loading}
              >
                Làm mới
              </Button>
            }
          >
            {stationVehicles.loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '10px' }}>Đang tải danh sách xe...</div>
              </div>
            ) : (
              <Tabs defaultActiveKey="all" size="small">
                <Tabs.TabPane 
                  tab={`Tất cả (${stationVehicles.count})`} 
                  key="all"
                >
                  <List
                    dataSource={stationVehicles.vehicles}
                    renderItem={(vehicle) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Image
                              src={vehicle.image}
                              alt={vehicle.name}
                              width={60}
                              height={40}
                              style={{ borderRadius: 4 }}
                              placeholder
                            />
                          }
                          title={
                            <Space>
                              <Text strong>{vehicle.name}</Text>
                              <Tag color={
                                vehicle.availability === 'available' ? 'green' :
                                vehicle.availability === 'rented' ? 'blue' : 'orange'
                              }>
                                {vehicle.availability === 'available' ? 'Có sẵn' :
                                 vehicle.availability === 'rented' ? 'Đang thuê' : 'Bảo trì'}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Space>
                              <Text type="secondary">{vehicle.brand} {vehicle.model}</Text>
                              <Text type="secondary">•</Text>
                              <Text type="secondary">Pin: {vehicle.batteryLevel}%</Text>
                              <Text type="secondary">•</Text>
                              <Text type="secondary">{vehicle.pricePerHour?.toLocaleString()}đ/h</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                    locale={{ emptyText: 'Không có xe nào tại trạm này' }}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane 
                  tab={`Có sẵn (${stationVehicles.vehicles.filter(v => v.availability === 'available').length})`} 
                  key="available"
                >
                  <List
                    dataSource={stationVehicles.vehicles.filter(v => v.availability === 'available')}
                    renderItem={(vehicle) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Image
                              src={vehicle.image}
                              alt={vehicle.name}
                              width={60}
                              height={40}
                              style={{ borderRadius: 4 }}
                              placeholder
                            />
                          }
                          title={<Text strong>{vehicle.name}</Text>}
                          description={
                            <Space>
                              <Text type="secondary">{vehicle.brand} {vehicle.model}</Text>
                              <Text type="secondary">•</Text>
                              <Text type="secondary">Pin: {vehicle.batteryLevel}%</Text>
                              <Text type="secondary">•</Text>
                              <Text type="secondary">{vehicle.pricePerHour?.toLocaleString()}đ/h</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                    locale={{ emptyText: 'Không có xe nào sẵn sàng' }}
                  />
                </Tabs.TabPane>
              </Tabs>
            )}
          </Card>

          {/* Quick Actions Info */}
          <Card 
            title="Thông tin quản lý" 
            className="mt-4" 
            size="small"
            extra={
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={fetchStationStaff}
                loading={stationStaff.loading}
                type="link"
              >
                Làm mới
              </Button>
            }
          >
            <div className="text-sm">
              <div className="flex justify-between py-1">
                <Text>Trạng thái:</Text>
                <Tag color={getStatusColor(station.status)}>
                  {getStatusText(station.status)}
                </Tag>
              </div>
              <div className="flex justify-between py-1">
                <Text>Sạc nhanh:</Text>
                <Text>{station.fastCharging ? 'Có' : 'Không'}</Text>
              </div>
              <div className="flex justify-between py-1">
                <Text>Số tiện ích:</Text>
                <Text strong>{amenities.length}</Text>
              </div>
              <div className="flex justify-between py-1">
                <Text>Quản lý:</Text>
                <Text strong>
                  {stationStaff.loading ? (
                    <Spin size="small" />
                  ) : (
                    stationStaff.manager ? stationStaff.manager.name : 'Chưa có'
                  )}
                </Text>
              </div>
              <div className="flex justify-between py-1">
                <Text>Nhân viên:</Text>
                <Text strong>
                  {stationStaff.loading ? (
                    <Spin size="small" />
                  ) : (
                    `${stationStaff.staff.length} người`
                  )}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default StationDetailModal;