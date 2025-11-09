import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Input, DatePicker, Select, Alert, Typography, Tabs } from 'antd';
import { SearchOutlined, CarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useToast } from '../../../../hooks/use-toast';
import api from '../../../../services/api';
import CheckinForm from './CheckinForm';
import VehicleReturnForm from './VehicleReturnForm';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// Interface matching backend Rental model
interface BackendRental {
  _id: string;
  booking_id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  vehicle_id: {
    _id: string;
    name: string;
    brand: string;
    model: string;
    type: string;
    seats: number;
    battery_kWh: number;
    batteryLevel: number;
    odo_km: number;
    image: string;
    year: number;
    licensePlate?: string;
  };
  station_id: {
    _id: string;
    name: string;
    address: string;
    city: string;
  };
  status: 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'DISPUTED';
  pickup?: {
    at?: string;
    photos?: string[];
    staff_id?: string;
    odo_km?: number;
    soc?: number;
    notes?: string;
  };
  return?: {
    at?: string;
    photos?: string[];
    odo_km?: number;
    soc?: number;
  };
  pricing_snapshot: {
    hourly_rate?: number;
    daily_rate?: number;
    currency: string;
    deposit?: number;
  };
  charges?: {
    rental_fee: number;
    late_fee: number;
    damage_fee: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
  closed_at?: string;
}

const DeliveryProcedures: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rentalsForCheckin, setRentalsForCheckin] = useState<BackendRental[]>([]);
  const [rentalsForReturn, setRentalsForReturn] = useState<BackendRental[]>([]);
  const [searchText, setSearchText] = useState('');
  
  // Checkin modal state
  const [checkinModalVisible, setCheckinModalVisible] = useState(false);
  const [selectedRentalForCheckin, setSelectedRentalForCheckin] = useState<BackendRental | null>(null);
  
  // Return modal state
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [selectedRentalForReturn, setSelectedRentalForReturn] = useState<BackendRental | null>(null);

  // Fetch rentals for checkin (CONFIRMED status) - those awaiting staff checkin
  const fetchRentalsForCheckin = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching CONFIRMED rentals for checkin...');
      
      const response = await api.get('/rentals/all', {
        params: { status: 'CONFIRMED' }
      });

      console.log('Checkin API Response:', response.data);
      
      if (response.data.success) {
        setRentalsForCheckin(response.data.data || []);
        console.log('Successfully loaded checkin rentals:', response.data.data?.length || 0);
      } else {
        console.error('API returned success=false:', response.data.message);
        toast({
          title: "Lỗi",
          description: response.data.message || "Không thể tải danh sách booking cần giao xe",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error('Error fetching rentals for checkin:', error);
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      toast({
        title: "Lỗi kết nối",
        description: `Không thể tải danh sách booking cần giao xe: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch rentals for return (ONGOING status) - those already checked in and ready for return
  const fetchRentalsForReturn = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching ONGOING rentals for return...');
      
      const response = await api.get('/rentals/all', {
        params: { status: 'ONGOING' }
      });

      console.log('Return API Response:', response.data);
      
      if (response.data.success) {
        setRentalsForReturn(response.data.data || []);
        console.log('Successfully loaded return rentals:', response.data.data?.length || 0);
      } else {
        console.error('API returned success=false:', response.data.message);
        toast({
          title: "Lỗi",
          description: response.data.message || "Không thể tải danh sách xe cần nhận trả",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error('Error fetching rentals for return:', error);
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      toast({
        title: "Lỗi kết nối",
        description: `Không thể tải danh sách xe cần nhận trả: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRentalsForCheckin();
    fetchRentalsForReturn();
  }, [fetchRentalsForCheckin, fetchRentalsForReturn]);

  // Handler for opening checkin modal
  const handleCheckinClick = (rental: BackendRental) => {
    setSelectedRentalForCheckin(rental);
    setCheckinModalVisible(true);
  };

  // Handler for closing checkin modal
  const handleCheckinCancel = () => {
    setCheckinModalVisible(false);
    setSelectedRentalForCheckin(null);
  };

  // Handler for successful checkin
  const handleCheckinSuccess = () => {
    setCheckinModalVisible(false);
    setSelectedRentalForCheckin(null);
    // Refresh both lists since a rental moves from checkin to return list
    fetchRentalsForCheckin();
    fetchRentalsForReturn();
    toast({
      title: "Thành công",
      description: "Xe đã được giao thành công!",
      variant: "default",
    });
  };

  // Handler for opening return modal
  const handleReturnClick = (rental: BackendRental) => {
    setSelectedRentalForReturn(rental);
    setReturnModalVisible(true);
  };

  // Handler for closing return modal
  const handleReturnCancel = () => {
    setReturnModalVisible(false);
    setSelectedRentalForReturn(null);
  };

  // Handler for successful return
  const handleReturnSuccess = () => {
    setReturnModalVisible(false);
    setSelectedRentalForReturn(null);
    // Refresh both lists since a rental moves from return to completed
    fetchRentalsForCheckin();
    fetchRentalsForReturn();
    toast({
      title: "Thành công",
      description: "Xe đã được nhận trả thành công!",
      variant: "default",
    });
  };

  // Columns for checkin table
  const checkinColumns: ColumnsType<BackendRental> = [
    {
      title: 'Xe',
      key: 'vehicle',
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.vehicle_id?.name}</div>
          <div className="text-sm text-gray-500">{record.vehicle_id?.licensePlate || `${record.vehicle_id?.brand} ${record.vehicle_id?.model}`}</div>
        </div>
      ),
    },
    {
      title: 'Trạm',
      key: 'station',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.station_id?.name}</div>
          <div className="text-sm text-gray-500">{record.station_id?.address}</div>
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.user_id?.name}</div>
          <div className="text-sm text-gray-500">{record.user_id?.email}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          Chờ giao xe
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<CarOutlined />}
          onClick={() => handleCheckinClick(record)}
        >
          Giao xe
        </Button>
      ),
    },
  ];

  // Columns for return table
  const returnColumns: ColumnsType<BackendRental> = [
    {
      title: 'Xe',
      key: 'vehicle',
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.vehicle_id?.name}</div>
          <div className="text-sm text-gray-500">{record.vehicle_id?.licensePlate || `${record.vehicle_id?.brand} ${record.vehicle_id?.model}`}</div>
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.user_id?.name}</div>
          <div className="text-sm text-gray-500">{record.user_id?.email}</div>
        </div>
      ),
    },
    {
      title: 'Thời gian giao xe',
      key: 'pickup_time',
      render: (_, record) => (
        <div>
          {record.pickup?.at ? (
            <div>
              <div className="font-medium">{new Date(record.pickup.at).toLocaleDateString('vi-VN')}</div>
              <div className="text-sm text-gray-500">{new Date(record.pickup.at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-xs text-blue-600">Staff: {record.pickup.staff_id?.substring(0, 8)}...</div>
            </div>
          ) : (
            <div className="text-gray-500">Chưa có thông tin giao xe</div>
          )}
        </div>
      ),
    },
    {
      title: 'Ngày nhận xe dự kiến',
      key: 'expected_return',
      sorter: (a, b) => {
        const getReturnDate = (record: BackendRental) => {
          if (!record.pickup?.at) return new Date().getTime();
          const pickupDate = new Date(record.pickup.at);
          const returnDate = new Date(pickupDate);
          if (record.pricing_snapshot?.daily_rate) {
            returnDate.setDate(returnDate.getDate() + 1);
          } else if (record.pricing_snapshot?.hourly_rate) {
            returnDate.setHours(returnDate.getHours() + 8);
          } else {
            returnDate.setHours(returnDate.getHours() + 24);
          }
          return returnDate.getTime();
        };
        return getReturnDate(a) - getReturnDate(b);
      },
      render: (_, record) => {
        if (!record.pickup?.at) {
          return <div className="text-gray-500">Chưa xác định</div>;
        }

        const pickupDate = new Date(record.pickup.at);
        const now = new Date();
        
        // Calculate expected return date based on rental duration
        const expectedReturnDate = new Date(pickupDate);
        
        // If there's daily rate, assume 1 day rental, otherwise default to 24 hours
        if (record.pricing_snapshot?.daily_rate) {
          expectedReturnDate.setDate(expectedReturnDate.getDate() + 1);
        } else if (record.pricing_snapshot?.hourly_rate) {
          // For hourly rentals, assume 8 hours as default
          expectedReturnDate.setHours(expectedReturnDate.getHours() + 8);
        } else {
          // Default to 24 hours
          expectedReturnDate.setHours(expectedReturnDate.getHours() + 24);
        }

        const isOverdue = now > expectedReturnDate;
        const timeDiff = Math.abs(now.getTime() - expectedReturnDate.getTime());
        
        // Calculate time difference
        let timeDisplay = '';
        const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) {
          timeDisplay = `${daysDiff} ngày`;
        } else {
          timeDisplay = `${hoursDiff} giờ`;
        }

        return (
          <div>
            <div className={isOverdue ? "text-red-600 font-semibold" : "font-medium"}>
              {expectedReturnDate.toLocaleDateString('vi-VN')}
            </div>
            <div className="text-sm text-gray-500">
              {expectedReturnDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-orange-500"}`}>
              {isOverdue ? `Quá hạn ${timeDisplay}` : `Còn ${timeDisplay}`}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Tình trạng',
      key: 'rental_status',
      render: (_, record) => {
        const now = new Date();
        const pickupTime = record.pickup?.at ? new Date(record.pickup.at) : new Date(record.createdAt);
        const hoursPassed = Math.ceil((now.getTime() - pickupTime.getTime()) / (1000 * 60 * 60));
        
        return (
          <div>
            <Tag color="green" icon={<CarOutlined />}>
              Đang thuê
            </Tag>
            <div className="text-gray-500 text-sm mt-1">
              {hoursPassed} giờ đã trôi qua
            </div>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => handleReturnClick(record)}
        >
          Nhận xe trả
        </Button>
      ),
    },
  ];

  const filteredCheckinRentals = rentalsForCheckin.filter(rental =>
    rental.vehicle_id?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    rental.vehicle_id?.licensePlate?.toLowerCase().includes(searchText.toLowerCase()) ||
    rental.station_id?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    rental.user_id?.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredReturnRentals = rentalsForReturn.filter(rental =>
    rental.vehicle_id?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    rental.vehicle_id?.licensePlate?.toLowerCase().includes(searchText.toLowerCase()) ||
    rental.station_id?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    rental.user_id?.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="flex items-center">
          <CarOutlined className="mr-3 text-blue-600" />
          Quy trình giao nhận xe
        </Title>
        <p className="text-gray-600">
          Quản lý việc giao xe cho khách hàng và nhận xe trả về
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Tìm kiếm theo tên xe, biển số, trạm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
          
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            className="w-64"
          />
          
          <Select
            placeholder="Trạng thái"
            className="w-40"
            allowClear
          >
            <Option value="confirmed">Chờ giao xe</Option>
            <Option value="ongoing">Đang thuê</Option>
            <Option value="overdue">Xe quá hạn</Option>
            <Option value="returning_soon">Sắp đến hạn trả</Option>
          </Select>
          
          <Button 
            type="primary" 
            onClick={() => {
              fetchRentalsForCheckin();
              fetchRentalsForReturn();
            }}
          >
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Main Content */}
      <Tabs defaultActiveKey="checkin" size="large">
        <TabPane 
          tab={
            <span>
              Cần giao xe ({filteredCheckinRentals.length})
            </span>
          } 
          key="checkin"
        >
          {filteredCheckinRentals.length === 0 ? (
            <Alert
              message="Không có booking nào cần giao xe"
              description="Tất cả các booking đã được giao xe hoặc chưa có booking mới"
              type="info"
              showIcon
            />
          ) : (
            <Card>
              <Table
                columns={checkinColumns}
                dataSource={filteredCheckinRentals}
                loading={loading}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} booking`,
                }}
              />
            </Card>
          )}
        </TabPane>

        <TabPane 
          tab={
            <span>
              Cần nhận xe ({filteredReturnRentals.length})
            </span>
          } 
          key="return"
        >
          {filteredReturnRentals.length === 0 ? (
            <Alert
              message="Không có xe nào cần nhận trả"
              description="Tất cả các xe đã được trả hoặc chưa có xe nào được giao"
              type="info"
              showIcon
            />
          ) : (
            <Card>
              <Table
                columns={returnColumns}
                dataSource={filteredReturnRentals}
                loading={loading}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} xe`,
                }}
              />
            </Card>
          )}
        </TabPane>
      </Tabs>

      {/* Checkin Modal */}
      {selectedRentalForCheckin && (
        <CheckinForm
          visible={checkinModalVisible}
          onCancel={handleCheckinCancel}
          onSuccess={handleCheckinSuccess}
          rental={selectedRentalForCheckin}
        />
      )}

      {/* Return Modal */}
      {selectedRentalForReturn && (
        <VehicleReturnForm
          visible={returnModalVisible}
          onCancel={handleReturnCancel}
          onSuccess={handleReturnSuccess}
          rental={selectedRentalForReturn}
        />
      )}
    </div>
  );
};

export default DeliveryProcedures;