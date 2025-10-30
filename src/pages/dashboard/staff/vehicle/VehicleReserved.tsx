import { useEffect, useMemo, useState } from 'react';
import { stationService } from '../../../../services/stationService';
import { bookingService, type Booking } from '../../../../services/bookingService';
import { rentalService, type StationRental } from '../../../../services/rentalService';
import { Card, Input, Modal, Space, Spin, Table, Tag, message, Descriptions, Button, Tabs } from 'antd';
import { SearchOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

const VehicleReserved = () => {
  const navigate = useNavigate();
  
  // State for data
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [ongoingRentals, setOngoingRentals] = useState<StationRental[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState<Booking | StationRental | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'rentals'>('bookings');
  
  // Location state
  const cityOptionsRaw = [
    'Hà Nội', 'Ho Chi Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Biên Hòa', 'Buôn Ma Thuột', 'Đà Lạt', 'Quy Nhơn', 'Thanh Hóa', 'Nam Định', 'Vinh', 'Thái Nguyên', 'Bắc Ninh', 'Phan Thiết', 'Long Xuyên', 'Rạch Giá', 'Bạc Liêu', 'Cà Mau', 'Tuy Hòa', 'Pleiku', 'Trà Vinh', 'Sóc Trăng', 'Hạ Long', 'Uông Bí', 'Lào Cai', 'Yên Bái', 'Điện Biên Phủ', 'Sơn La', 'Hòa Bình', 'Tuyên Quang', 'Bắc Giang', 'Bắc Kạn', 'Cao Bằng', 'Lạng Sơn', 'Hà Giang', 'Phủ Lý', 'Hưng Yên', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Đông Hà', 'Quảng Ngãi', 'Tam Kỳ', 'Kon Tum', 'Gia Nghĩa', 'Tây Ninh', 'Bến Tre', 'Vĩnh Long', 'Cao Lãnh', 'Sa Đéc', 'Mỹ Tho', 'Châu Đốc', 'Tân An', 'Bình Dương', 'Bình Phước', 'Phước Long', 'Thủ Dầu Một', 'Bình Thuận', 'Bình Định', 'Quảng Nam', 'Quảng Ninh', 'Quảng Ngãi', 'Quảng Trị', 'Quảng Bình', 'Ninh Bình', 'Ninh Thuận', 'Hà Nam', 'Hà Tĩnh', 'Hậu Giang', 'Kiên Giang', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Nam Định', 'Nghệ An', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ];
  const cityOptions = Array.from(new Set(cityOptionsRaw));
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [stationOptions, setStationOptions] = useState<Array<{value: string; label: string}>>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');

  // Load stations when city changes
  useEffect(() => {
    if (!selectedCity) return;
    stationService.getStationsByCity(selectedCity)
      .then((stations) => {
        setStationOptions(stations.map((station) => ({
          value: station.id,
          label: station.name
        })));
        setSelectedStation('');
        setConfirmedBookings([]);
        setOngoingRentals([]);
      })
      .catch(() => {
        setStationOptions([]);
      });
  }, [selectedCity]);

  // Load data when station changes
  useEffect(() => {
    if (!selectedStation) {
      setConfirmedBookings([]);
      setOngoingRentals([]);
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Load confirmed bookings (waiting for pickup)
        const bookings = await bookingService.getStationBookings(selectedStation, 'CONFIRMED');
        setConfirmedBookings(bookings);
        
        // Load ongoing rentals (vehicles currently rented out)
        const rentals = await rentalService.getStationRentals(selectedStation, 'ONGOING');
        setOngoingRentals(rentals);
        
        console.log('📋 [VehicleReserved] Data loaded:', {
          bookings: bookings.length,
          rentals: rentals.length
        });
        
      } catch (error) {
        console.error('❌ [VehicleReserved] Error loading data:', error);
        message.error('Không thể tải dữ liệu. Vui lòng thử lại.');
        setConfirmedBookings([]);
        setOngoingRentals([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedStation]);

  // Get current data based on active tab
  const currentData = activeTab === 'bookings' ? confirmedBookings : ongoingRentals;

  // Filter data based on search
  const filtered = useMemo(
    () =>
      currentData.filter((item) =>
        Object.values(item).some((val) =>
          (typeof val === 'object'
            ? JSON.stringify(val)
            : String(val)
          )
            .toLowerCase()
            .includes(searchText.toLowerCase())
        )
      ),
    [currentData, searchText]
  );

  const handleOpen = (item: Booking | StationRental) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleStartDeliveryProcedure = () => {
    if (!selectedItem) return;
    setIsModalVisible(false);
    
    // Navigate to delivery procedures with booking/rental data
    if (activeTab === 'bookings') {
      // For confirmed bookings, start pickup procedure
      message.success('Chuyển sang thủ tục bàn giao xe.');
      navigate('/staff/delivery-procedures', { 
        state: { 
          booking: selectedItem,
          type: 'pickup'
        } 
      });
    } else {
      // For ongoing rentals, start return procedure
      message.success('Chuyển sang thủ tục nhận xe.');
      navigate('/staff/return-procedures', { 
        state: { 
          rental: selectedItem,
          type: 'return'
        } 
      });
    }
  };

  // Helper function to get display data for table
  const getDisplayData = (item: Booking | StationRental) => {
    if (activeTab === 'bookings') {
      const booking = item as Booking;
      return {
        id: booking._id,
        name: booking.vehicle_snapshot?.name || 'Unknown Vehicle',
        brand: booking.vehicle_snapshot?.brand || 'Unknown',
        model: '',
        type: booking.vehicle_snapshot?.type || 'Unknown',
        year: new Date().getFullYear(),
        // ✅ FIX: Get image from populated vehicle_id object
        image: (booking.vehicle_id as any)?.image || (booking as any).vehicle?.image || '/placeholder-vehicle.jpg',
        batteryLevel: 80, // Not available in booking snapshot
        location: booking.station_snapshot?.name || 'Unknown Station',
        status: booking.status,
        pricePerHour: (booking as any).pricing?.hourly_rate || booking.pricing_snapshot?.hourly_rate || 0,
        pricePerDay: (booking as any).pricing?.daily_rate || booking.pricing_snapshot?.daily_rate || 0,
        currency: (booking as any).pricing?.currency || booking.pricing_snapshot?.currency || 'VND',
        seats: 4, // Not available in booking snapshot
        // ✅ FIX: Get customer data from populated user_id object or user field
        customerName: (booking.user_id as any)?.name || (booking as any).user?.name || 'Customer',
        customerEmail: (booking.user_id as any)?.email || (booking as any).user?.email || '',
        customerPhone: (booking.user_id as any)?.phoneNumber || (booking as any).user?.phoneNumber || '',
        startAt: booking.start_at,
        endAt: booking.end_at,
        totalPrice: (booking as any).pricing?.total_price || booking.pricing_snapshot?.totalPrice || 0,
        deposit: (booking as any).pricing?.deposit || booking.pricing_snapshot?.deposit || 0,
        insurance: booking.insurance_option || false
      };
    } else {
      const rental = item as StationRental;
      return {
        id: rental._id,
        name: rental.vehicle_id?.name || 'Unknown Vehicle',
        brand: rental.vehicle_id?.brand || 'Unknown',
        model: rental.vehicle_id?.model || '',
        type: rental.vehicle_id?.type || 'Unknown',
        year: new Date().getFullYear(),
        // ✅ FIX: Use actual vehicle image from rental data
        image: rental.vehicle_id?.image || '/placeholder-vehicle.jpg',
        batteryLevel: rental.vehicle_id?.batteryLevel || 80,
        location: rental.station_id?.name || 'Unknown Station',
        status: rental.status,
        pricePerHour: rental.pricing_snapshot?.hourly_rate || 0,
        pricePerDay: rental.pricing_snapshot?.daily_rate || 0,
        currency: rental.pricing_snapshot?.currency || 'VND',
        seats: rental.vehicle_id?.seats || 4,
        // ✅ FIX: Use actual customer data from rental
        customerName: rental.user_id?.name || 'Customer',
        customerEmail: rental.user_id?.email || '',
        customerPhone: rental.user_id?.phoneNumber || '',
        startAt: rental.start_at,
        endAt: rental.end_at,
        hasPickupPhotos: (rental.pickup?.photos?.length || 0) > 0,
        pickupAt: rental.pickup?.at
      };
    }
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
      title: 'Xe & Khách hàng',
      key: 'vehicleInfo',
      render: (_: unknown, record: Booking | StationRental) => {
        const display = getDisplayData(record);
        return (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              <span style={{ color: '#1890ff' }}>{display.name}</span>
            </div>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>
              {display.brand} • {display.type}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserOutlined style={{ color: '#52c41a' }} />
              <span style={{ fontSize: 12, color: '#52c41a' }}>{display.customerName}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Thời gian',
      key: 'timing',
      render: (_: unknown, record: Booking | StationRental) => {
        const display = getDisplayData(record);
        return (
          <div>
            <div style={{ fontSize: 12, marginBottom: 2 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              <strong>Bắt đầu:</strong> {dayjs(display.startAt).format('DD/MM HH:mm')}
            </div>
            <div style={{ fontSize: 12, marginBottom: 2 }}>
              <strong>Kết thúc:</strong> {dayjs(display.endAt).format('DD/MM HH:mm')}
            </div>
            {activeTab === 'rentals' && display.hasPickupPhotos && display.pickupAt && (
              <div style={{ fontSize: 12, color: '#52c41a' }}>
                <strong>Đã lấy xe:</strong> {dayjs(display.pickupAt).format('DD/MM HH:mm')}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (_: string, record: Booking | StationRental) => {
        const display = getDisplayData(record);
        
        if (activeTab === 'bookings') {
          return <Tag color="gold">Chờ lấy xe</Tag>;
        } else {
          return (
            <div>
              <Tag color="blue">Đang thuê</Tag>
              {display.hasPickupPhotos ? (
                <Tag color="green" style={{ marginTop: 4 }}>Đã lấy xe</Tag>
              ) : (
                <Tag color="orange" style={{ marginTop: 4 }}>Chưa lấy xe</Tag>
              )}
            </div>
          );
        }
      },
    },
    {
      title: 'Pin (%)',
      key: 'batteryLevel',
      render: (_: unknown, record: Booking | StationRental) => {
        const display = getDisplayData(record);
        return <Tag color="blue">{display.batteryLevel}%</Tag>;
      },
    },
    {
      title: 'Vị trí',
      key: 'location',
      render: (_: unknown, record: Booking | StationRental) => {
        const display = getDisplayData(record);
        return display.location;
      },
    },
    {
      title: 'Giá thuê',
      key: 'pricing',
      render: (_: unknown, record: Booking | StationRental) => {
        const display = getDisplayData(record);
        return (
          <div>
            <div style={{ fontSize: 12 }}>
              <strong>Giờ:</strong> {display.pricePerHour?.toLocaleString()} {display.currency}
            </div>
            <div style={{ fontSize: 12 }}>
              <strong>Ngày:</strong> {display.pricePerDay?.toLocaleString()} {display.currency}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Booking | StationRental) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleOpen(record)}
        >
          {activeTab === 'bookings' ? 'Giao xe' : 'Nhận xe'}
        </Button>
      ),
    },
  ];

  return (
    <Card title="Quản lý xe đặt trước & thuê">
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

      {/* Tabs for Bookings vs Rentals */}
      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'bookings' | 'rentals')}>
        <TabPane tab={`Xe chờ lấy (${confirmedBookings.length})`} key="bookings" />
        <TabPane tab={`Xe đang thuê (${ongoingRentals.length})`} key="rentals" />
      </Tabs>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <Spin spinning={loading}>
          <Table 
            columns={columns} 
            dataSource={filtered} 
            rowKey="_id"
            locale={{
              emptyText: selectedStation 
                ? `Không có ${activeTab === 'bookings' ? 'xe chờ lấy' : 'xe đang thuê'} tại trạm này` 
                : 'Vui lòng chọn thành phố và trạm'
            }}
          />
        </Spin>
      </Space>

      {/* Modal chi tiết */}
      <Modal
        title={activeTab === 'bookings' ? 'Xác nhận bàn giao xe' : 'Xác nhận nhận xe'}
        open={isModalVisible}
        onOk={handleStartDeliveryProcedure}
        onCancel={() => setIsModalVisible(false)}
        okText={activeTab === 'bookings' ? 'Bắt đầu bàn giao' : 'Bắt đầu nhận xe'}
        cancelText="Hủy"
        styles={{ body: { padding: 24, maxHeight: '70vh', overflowY: 'auto' } }}
        width={820}
      >
        {selectedItem && (
          <>
            {/* Header thông tin */}
            <Card style={{ marginBottom: 8 }} bodyStyle={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#1890ff' }}>
                    {getDisplayData(selectedItem).name}
                  </div>
                  <div style={{ marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Tag color={activeTab === 'bookings' ? 'gold' : 'blue'} style={{ fontWeight: 500, fontSize: 15 }}>
                      {activeTab === 'bookings' ? 'Chờ lấy xe' : 'Đang thuê'}
                    </Tag>
                    <Tag color="blue">{getDisplayData(selectedItem).type}</Tag>
                    <Tag color="geekblue">{getDisplayData(selectedItem).brand}</Tag>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: '#666' }}>Khách hàng</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>
                    <UserOutlined style={{ marginRight: 4 }} />
                    {getDisplayData(selectedItem).customerName}
                  </div>
                </div>
              </div>
            </Card>

            {/* Thông tin chi tiết */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <img
                src={getDisplayData(selectedItem).image}
                alt="vehicle"
                style={{ width: 200, height: 130, objectFit: 'cover', borderRadius: 12, border: '2px solid #e4e4e4', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Card title="Thông tin xe" size="small">
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="ID">{getDisplayData(selectedItem).id}</Descriptions.Item>
                      <Descriptions.Item label="Loại xe">{getDisplayData(selectedItem).type}</Descriptions.Item>
                      <Descriptions.Item label="Hãng">{getDisplayData(selectedItem).brand}</Descriptions.Item>
                      <Descriptions.Item label="Pin">{getDisplayData(selectedItem).batteryLevel}%</Descriptions.Item>
                      <Descriptions.Item label="Vị trí">{getDisplayData(selectedItem).location}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                  
                  <Card title="Thông tin thuê" size="small">
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Bắt đầu">
                        {dayjs(getDisplayData(selectedItem).startAt).format('DD/MM/YYYY HH:mm')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Kết thúc">
                        {dayjs(getDisplayData(selectedItem).endAt).format('DD/MM/YYYY HH:mm')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giá/giờ">
                        {getDisplayData(selectedItem).pricePerHour?.toLocaleString()} {getDisplayData(selectedItem).currency}
                      </Descriptions.Item>
                      <Descriptions.Item label="Giá/ngày">
                        {getDisplayData(selectedItem).pricePerDay?.toLocaleString()} {getDisplayData(selectedItem).currency}
                      </Descriptions.Item>
                      {activeTab === 'bookings' && (
                        <>
                          <Descriptions.Item label="Tổng tiền">
                            <span style={{ color: '#faad14', fontWeight: 600 }}>
                              {getDisplayData(selectedItem).totalPrice?.toLocaleString()} {getDisplayData(selectedItem).currency}
                            </span>
                          </Descriptions.Item>
                          <Descriptions.Item label="Đặt cọc">
                            <span style={{ color: '#52c41a', fontWeight: 600 }}>
                              {getDisplayData(selectedItem).deposit?.toLocaleString()} {getDisplayData(selectedItem).currency}
                            </span>
                          </Descriptions.Item>
                        </>
                      )}
                    </Descriptions>
                  </Card>
                </div>

                {/* Thông tin trạng thái rental */}
                {activeTab === 'rentals' && selectedItem && 'pickup' in selectedItem && (
                  <Card title="Trạng thái thuê" size="small" style={{ marginTop: 16 }}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Đã lấy xe">
                        {getDisplayData(selectedItem).hasPickupPhotos ? (
                          <Tag color="green">
                            Đã lấy - {getDisplayData(selectedItem).pickupAt ? dayjs(getDisplayData(selectedItem).pickupAt).format('DD/MM HH:mm') : 'N/A'}
                          </Tag>
                        ) : (
                          <Tag color="orange">Chưa lấy xe</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Số ảnh pickup">
                        {((selectedItem as StationRental).pickup?.photos?.length || 0)} ảnh
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </Modal>
    </Card>
  );
}

export default VehicleReserved;