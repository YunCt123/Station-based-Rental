import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Table, Tag, message, Space, Descriptions, Image } from 'antd';
import { rentalService } from '../../../../services/rentalService';
import type { StationRental } from '../../../../services/rentalService';
import type { Booking } from '../../../../services/bookingService';

const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}) : '-';

const formatCurrency = (amount: number, currency: string = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Helper function to safely get nested value
const getNestedValue = (obj: any, path: string, defaultValue: any = null) => {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper to extract ID from object or string
const extractId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value._id) return value._id.toString();
  if (value.$oid) return value.$oid;
  return String(value);
};

// Helper to check if object is populated
const isPopulated = (value: any): boolean => {
  return value && typeof value === 'object' && '_id' in value;
};

// Helper to get booking info
const getBookingInfo = (rental: StationRental) => {
  const bookingId = rental.booking_id;
  
  if (isPopulated(bookingId)) {
    const booking = bookingId as Booking;
    const pricing = booking.pricing_snapshot as any;
    return {
      start_at: booking.start_at,
      end_at: booking.end_at,
      total_amount: pricing?.total_price ?? pricing?.totalPrice ?? 0,
      deposit_amount: pricing?.deposit ?? pricing?.deposit_amount ?? 0,
      status: booking.status
    };
  }
  
  // Fallback to pickup/return times
  return {
    start_at: rental.pickup?.at,
    end_at: rental.return?.at || rental.pickup?.at,
    total_amount: rental.pricing_snapshot?.total_price || 0,
    deposit_amount: rental.pricing_snapshot?.deposit || 0,
    status: 'UNKNOWN'
  };
};

const RentalHistory: React.FC = () => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StationRental['status']>('all');
  const [allRentals, setAllRentals] = useState<StationRental[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [selected, setSelected] = useState<StationRental | null>(null);

  // Fetch rentals from API
  const fetchRentals = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching all rentals...');
      const data = await rentalService.getAllRentals();
      console.log('✅ Rentals fetched:', data.length);
      
      if (data.length > 0) {
        console.log('📊 Sample rental:', data[0]);
        console.log('📅 Booking info:', getBookingInfo(data[0]));
      }
      
      setAllRentals(data);
    } catch (error) {
      console.error('❌ Failed to fetch rentals:', error);
      message.error('Không thể tải danh sách lịch sử thuê xe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  // Apply filters
  const filteredList = allRentals.filter(rental => {
    const userName = getNestedValue(rental, 'user_id.name', '').toLowerCase();
    const userEmail = getNestedValue(rental, 'user_id.email', '').toLowerCase();
    const userPhone = getNestedValue(rental, 'user_id.phoneNumber', '').toLowerCase();
    const vehicleName = getNestedValue(rental, 'vehicle_id.name', '').toLowerCase();
    const vehiclePlate = getNestedValue(rental, 'vehicle_id.licensePlate', '').toLowerCase();
    
    const searchLower = query.toLowerCase();
    const matchesQuery = query === '' || 
      userName.includes(searchLower) ||
      userEmail.includes(searchLower) ||
      userPhone.includes(searchLower) ||
      vehicleName.includes(searchLower) ||
      vehiclePlate.includes(searchLower) ||
      extractId(rental._id).includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
    
    return matchesQuery && matchesStatus;
  });

  const openView = (rental: StationRental) => {
    console.log('🔍 Opening rental detail:', rental);
    setSelected(rental);
    setViewVisible(true);
  };

  const closeView = () => {
    setViewVisible(false);
    setSelected(null);
  };

  // Get status tag
  const getStatusTag = (status: string) => {
    const configs: Record<string, { color: string; text: string }> = {
      'CONFIRMED': { color: 'orange', text: 'Chờ nhận xe' },
      'ONGOING': { color: 'blue', text: 'Đang thuê' },
      'RETURN_PENDING': { color: 'gold', text: 'Chờ thanh toán' },
      'COMPLETED': { color: 'green', text: 'Hoàn thành' },
      'DISPUTED': { color: 'red', text: 'Tranh chấp' },
      'REJECTED': { color: 'red', text: 'Bị từ chối' },
      'CANCELLED': { color: 'default', text: 'Đã hủy' }
    };
    const config = configs[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Table columns
  const columns = [
    {
      title: 'Mã thuê',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (id: string | any) => {
        const idStr = extractId(id);
        return (
          <span className="font-mono text-xs">{idStr.slice(-8) || 'N/A'}</span>
        );
      }
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 200,
      render: (_: unknown, record: StationRental) => {
        const userId = record.user_id;
        const isUserPopulated = isPopulated(userId);
        
        if (isUserPopulated) {
          const user = userId as any;
          return (
            <div>
              <div className="font-medium">{user.name || 'Không rõ'}</div>
              <div className="text-xs text-gray-500">{user.phoneNumber || '-'}</div>
            </div>
          );
        } else {
          return (
            <div>
              <div className="font-medium text-gray-400">ID: {extractId(userId).slice(-8)}</div>
              <div className="text-xs text-gray-400">Chưa load thông tin</div>
            </div>
          );
        }
      }
    },
    {
      title: 'Xe',
      key: 'vehicle',
      width: 200,
      render: (_: unknown, record: StationRental) => {
        const vehicleId = record.vehicle_id;
        const isVehiclePopulated = isPopulated(vehicleId);
        
        if (isVehiclePopulated) {
          const vehicle = vehicleId as any;
          return (
            <div className="flex items-center gap-2">
              {vehicle.image && (
                <Image
                  src={vehicle.image}
                  alt={vehicle.name}
                  width={40}
                  height={40}
                  className="rounded object-cover"
                  preview={false}
                />
              )}
              <div>
                <div className="font-medium">{vehicle.model || 'Không rõ'}</div>
                <div className="text-xs text-gray-500">{vehicle.licensePlate || '-'}</div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="text-gray-400">
              <div className="font-medium">ID: {extractId(vehicleId).slice(-8)}</div>
              <div className="text-xs">Chưa load thông tin</div>
            </div>
          );
        }
      }
    },
    {
      title: 'Trạm',
      key: 'station',
      width: 150,
      render: (_: unknown, record: StationRental) => {
        const stationId = record.station_id;
        const isStationPopulated = isPopulated(stationId);
        
        if (isStationPopulated) {
          const station = stationId as any;
          return <span>{station.name}</span>;
        } else {
          return <span className="text-gray-400">ID: {extractId(stationId).slice(-8)}</span>;
        }
      }
    },
    {
      title: 'Thời gian thuê',
      key: 'duration',
      width: 180,
      render: (_: unknown, record: StationRental) => {
        const bookingInfo = getBookingInfo(record);
        
        return (
          <div className="text-xs">
            <div>Bắt đầu: {formatDate(bookingInfo.start_at)}</div>
            <div>Kết thúc: {formatDate(bookingInfo.end_at)}</div>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status || 'CONFIRMED')
    },
    {
      title: 'Tổng tiền',
      key: 'total',
      width: 120,
      render: (_: unknown, record: StationRental) => {
        const total = record.charges?.total || record.pricing_snapshot?.total_price || 0;
        const currency = record.pricing_snapshot?.currency || 'VND';
        return (
          <span className="font-semibold">
            {formatCurrency(total, currency)}
          </span>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: StationRental) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => openView(record)}
        >
          Xem
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button type="text" className="px-0">
          <Link to="/admin/dashboard" className="text-sm">← Quay lại dashboard</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lịch sử thuê xe</h1>
            <p className="text-sm text-gray-500">
              Xem tất cả lịch sử thuê xe của khách hàng ({filteredList.length} bản ghi)
            </p>
          </div>
          
          <Space>
            <Input.Search
              placeholder="Tìm theo tên, SĐT, email, xe..."
              allowClear
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: 300 }}
            />
            <select 
              className="border rounded-md px-3 py-2" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="CONFIRMED">Chờ nhận xe</option>
              <option value="ONGOING">Đang thuê</option>
              <option value="RETURN_PENDING">Chờ thanh toán</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="DISPUTED">Tranh chấp</option>
              <option value="REJECTED">Bị từ chối</option>
            </select>
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchRentals}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey={(record) => extractId(record._id)}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`
          }}
          scroll={{ x: 1200 }}
        />

        {/* View Detail Modal */}
        <Modal 
          visible={viewVisible} 
          title="Chi tiết thuê xe" 
          onCancel={closeView}
          width={800}
          footer={[
            <Button key="close" onClick={closeView}>Đóng</Button>
          ]}
        >
          {selected && (() => {
            const bookingInfo = getBookingInfo(selected);
            
            return (
              <div className="space-y-4">
                {/* Booking Info */}
                <Descriptions title="Thông tin đặt xe" bordered size="small">
                  <Descriptions.Item label="Mã booking">
                    <span className="font-mono">{extractId(selected.booking_id)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái booking" span={2}>
                    {isPopulated(selected.booking_id) && 
                      getStatusTag((selected.booking_id as Booking).status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá trị booking">
                    {formatCurrency(bookingInfo.total_amount, selected.pricing_snapshot?.currency)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền cọc" span={2}>
                    {formatCurrency(bookingInfo.deposit_amount, selected.pricing_snapshot?.currency)}
                  </Descriptions.Item>
                </Descriptions>

                {/* Customer Info */}
                <Descriptions title="Thông tin khách hàng" bordered size="small">
                  <Descriptions.Item label="Tên" span={2}>
                    {getNestedValue(selected, 'user_id.name', 
                      `ID: ${extractId(selected.user_id)}`)}
                  </Descriptions.Item>
                  <Descriptions.Item label="SĐT">
                    {getNestedValue(selected, 'user_id.phoneNumber', '-')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email" span={3}>
                    {getNestedValue(selected, 'user_id.email', '-')}
                  </Descriptions.Item>
                </Descriptions>

                {/* Vehicle Info */}
                <Descriptions title="Thông tin xe" bordered size="small">
                  <Descriptions.Item label="Xe" span={3}>
                    <div className="flex items-center gap-2">
                      {getNestedValue(selected, 'vehicle_id.image') && (
                        <Image
                          src={selected.vehicle_id.image}
                          width={60}
                          height={60}
                          className="rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">
                          {getNestedValue(selected, 'vehicle_id.name', 
                            `ID: ${extractId(selected.vehicle_id)}`)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getNestedValue(selected, 'vehicle_id.brand', '')} {getNestedValue(selected, 'vehicle_id.model', '')}
                        </div>
                      </div>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Biển số">
                    {getNestedValue(selected, 'vehicle_id.licensePlate', '-')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại xe" span={2}>
                    {getNestedValue(selected, 'vehicle_id.type', '-')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Pin hiện tại">
                    {getNestedValue(selected, 'vehicle_id.batteryLevel', 0)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Pin khi nhận" span={2}>
                    {selected.pickup?.soc ? Math.round(selected.pickup.soc * 100) : 0}%
                  </Descriptions.Item>
                </Descriptions>

                {/* Rental Info */}
                <Descriptions title="Thông tin thuê" bordered size="small">
                  <Descriptions.Item label="Mã thuê" span={3}>
                    <span className="font-mono">{extractId(selected._id)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạm" span={3}>
                    {getNestedValue(selected, 'station_id.name', `ID: ${extractId(selected.station_id)}`)}
                    {getNestedValue(selected, 'station_id.address') && 
                      ` - ${selected.station_id.address}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="Bắt đầu">
                    {formatDate(bookingInfo.start_at)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kết thúc">
                    {formatDate(bookingInfo.end_at)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    {getStatusTag(selected.status)}
                  </Descriptions.Item>
                  {selected.pickup?.at && (
                    <Descriptions.Item label="Đã nhận xe" span={3}>
                      {formatDate(selected.pickup.at)}
                    </Descriptions.Item>
                  )}
                  {selected.return?.at && (
                    <Descriptions.Item label="Đã trả xe" span={3}>
                      {formatDate(selected.return.at)}
                    </Descriptions.Item>
                  )}
                  {selected.pickup?.notes && (
                    <Descriptions.Item label="Ghi chú nhận xe" span={3}>
                      {selected.pickup.notes}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {/* Pricing Info */}
                <Descriptions title="Thông tin thanh toán" bordered size="small">
                  <Descriptions.Item label="Phí thuê">
                    {formatCurrency(
                      selected.charges?.rental_fee || 0, 
                      selected.pricing_snapshot?.currency
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phí trễ hạn">
                    {formatCurrency(
                      selected.charges?.late_fee || 0, 
                      selected.pricing_snapshot?.currency
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phí hư hỏng">
                    {formatCurrency(
                      selected.charges?.damage_fee || 0, 
                      selected.pricing_snapshot?.currency
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phí vệ sinh">
                    {formatCurrency(
                      selected.charges?.cleaning_fee || 0, 
                      selected.pricing_snapshot?.currency
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền đặt cọc" span={2}>
                    {formatCurrency(
                      selected.pricing_snapshot?.deposit || 0, 
                      selected.pricing_snapshot?.currency
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng cộng" span={3}>
                    <span className="font-bold text-lg text-green-600">
                      {formatCurrency(
                        selected.charges?.total || selected.pricing_snapshot?.total_price || 0,
                        selected.pricing_snapshot?.currency
                      )}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                {/* Photos */}
                {((selected.pickup?.photos && selected.pickup.photos.length > 0) || 
                  (selected.return?.photos && selected.return.photos.length > 0)) && (
                  <div>
                    <h3 className="font-semibold mb-2">Hình ảnh</h3>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {selected.pickup?.photos && selected.pickup.photos.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Ảnh nhận xe:</div>
                          <Image.PreviewGroup>
                            <Space>
                              {selected.pickup.photos.slice(0, 4).map((photo: any, idx: number) => {
                                const photoUrl = typeof photo === 'string' ? photo : photo.url;
                                return (
                                  <Image
                                    key={idx}
                                    src={photoUrl}
                                    width={100}
                                    height={100}
                                    className="rounded object-cover"
                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                                  />
                                );
                              })}
                            </Space>
                          </Image.PreviewGroup>
                        </div>
                      )}
                      {selected.return?.photos && selected.return.photos.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Ảnh trả xe:</div>
                          <Image.PreviewGroup>
                            <Space>
                              {selected.return.photos.slice(0, 4).map((photo: any, idx: number) => {
                                const photoUrl = typeof photo === 'string' ? photo : photo.url;
                                return (
                                  <Image
                                    key={idx}
                                    src={photoUrl}
                                    width={100}
                                    height={100}
                                    className="rounded object-cover"
                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                                  />
                                );
                              })}
                            </Space>
                          </Image.PreviewGroup>
                        </div>
                      )}
                    </Space>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      </div>
    </div>
  );
};

export default RentalHistory;