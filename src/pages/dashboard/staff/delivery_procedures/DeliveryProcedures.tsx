import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Input, DatePicker, Select, Alert, Typography, Tabs } from 'antd';
import { SearchOutlined, CarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useToast } from '../../../../hooks/use-toast';
import api from '../../../../services/api';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rentalsForCheckin, setRentalsForCheckin] = useState<BackendRental[]>([]);
  const [rentalsForReturn, setRentalsForReturn] = useState<BackendRental[]>([]);
  const [searchText, setSearchText] = useState('');

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
          onClick={() => navigate(`/dashboard/staff/checkin/${record._id}`)}
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
              <div><strong>Đã giao:</strong> {new Date(record.pickup.at).toLocaleString('vi-VN')}</div>
              <div className="text-sm text-gray-500">Staff: {record.pickup.staff_id}</div>
            </div>
          ) : (
            <div className="text-gray-500">Chưa có thông tin giao xe</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tình trạng',
      key: 'rental_status',
      render: (_, record) => {
        const now = new Date();
        const createdTime = new Date(record.createdAt);
        const hoursPassed = Math.ceil((now.getTime() - createdTime.getTime()) / (1000 * 60 * 60));
        
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
          onClick={() => navigate(`/dashboard/staff/return/${record._id}`)}
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
            className="w-32"
            allowClear
          >
            <Option value="confirmed">Chờ giao xe</Option>
            <Option value="ongoing">Đang thuê</Option>
            <Option value="overdue">Quá hạn</Option>
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
              <CarOutlined />
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
              <CheckCircleOutlined />
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
    </div>
  );
};

export default DeliveryProcedures;