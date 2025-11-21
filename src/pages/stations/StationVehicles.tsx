import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, CarOutlined, ThunderboltOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { stationService, type Station } from '../../services/stationService';
import type { Vehicle } from '../../types/vehicle';
import { useToast } from '../../hooks/use-toast';
import VehicleCard from '../../components/VehicleCard';

const StationVehicles: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<Station | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleCount, setVehicleCount] = useState(0);
  
  // Get passed state data
  const stationData = location.state?.station as Station;
  const pickupDate = location.state?.pickupDate;
  const returnDate = location.state?.returnDate;
  const fromNearby = location.state?.fromNearby;

  useEffect(() => {
    const loadStationVehicles = async () => {
      if (!stationId) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy ID trạm",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        
        // If we have station data from navigation state, use it
        if (stationData) {
          setStation(stationData);
        } else {
          // Otherwise fetch station details
          const stationDetails = await stationService.getStationById(stationId);
          setStation(stationDetails);
        }
        
        // Fetch vehicles at this station
        const stationVehiclesData = await stationService.getStationVehicles(stationId, 'AVAILABLE');
        setVehicles(stationVehiclesData.vehicles);
        setVehicleCount(stationVehiclesData.count);
        
        console.log('Station vehicles loaded:', stationVehiclesData);
        
      } catch (error) {
        console.error('Error loading station vehicles:', error);
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Không thể tải thông tin trạm và xe. Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadStationVehicles();
  }, [stationId, navigate, toast, stationData]);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    // Navigate to booking page with selected vehicle and station
    const searchParams = new URLSearchParams({
      stationId: stationId!,
    });
    
    // Add dates if available
    if (pickupDate) searchParams.append('pickup', pickupDate);
    if (returnDate) searchParams.append('return', returnDate);
    
    navigate(`/booking/${vehicle.id}?${searchParams.toString()}`);
  };

  const handleBackClick = () => {
    if (fromNearby) {
      navigate('/', { state: { activeTab: 'nearby' } });
    } else {
      navigate('/stations');
    }
  };

  const handleGetDirections = () => {
    if (!station) return;
    
    const { coordinates } = station;
    const destination = `${coordinates.lat},${coordinates.lng}`;
    // const stationName = encodeURIComponent(station.name);
    // const stationAddress = encodeURIComponent(station.address);
    
    // Mở Google Maps với chỉ đường
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=&travelmode=driving`;
    
    // Hoặc sử dụng URL với tên và địa chỉ

    
    // Mở trong tab mới
    window.open(googleMapsUrl, '_blank');
    
    toast({
      title: "Đang mở chỉ đường",
      description: "Google Maps sẽ hiển thị chỉ đường đến trạm này.",
      variant: "default",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">Đang tải thông tin trạm và xe...</div>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert
          message="Không tìm thấy trạm"
          description="Trạm sạc không tồn tại hoặc đã bị xóa."
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={handleBackClick}
                className="flex items-center"
              >
                {fromNearby ? 'Về trang chủ' : 'Về danh sách trạm'}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{station.name}</h1>
                <p className="text-gray-600">{station.address}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Nút chỉ đường */}
              <Button 
                type="primary"
                icon={<EnvironmentOutlined />}
                onClick={handleGetDirections}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Chỉ đường
              </Button>
              
              {fromNearby && station.distance && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">Khoảng cách</div>
                  <div className="font-semibold text-blue-600">{station.distance.toFixed(1)} km</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Station Info Card */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Station Image */}
            <div className="md:col-span-1">
              <img
                src={station.image}
                alt={station.name}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
            
            {/* Station Details */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{vehicleCount}</div>
                  <div className="text-sm text-gray-500">Xe có sẵn</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{station.rating.toFixed(1)}★</div>
                  <div className="text-sm text-gray-500">{station.reviewCount} đánh giá</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{station.totalSlots}</div>
                  <div className="text-sm text-gray-500">Tổng chỗ đỗ</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(station.utilizationRate * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Tỷ lệ sử dụng</div>
                </div>
              </div>
              
              {/* Amenities */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {station.fastCharging && (
                    <Tag color="blue" icon={<ThunderboltOutlined />}>
                      Sạc nhanh
                    </Tag>
                  )}
                  {station.amenities.map((amenity) => (
                    <Tag key={amenity} color="green">
                      {amenity}
                    </Tag>
                  ))}
                </div>
              </div>
              


            </div>
          </div>
        </Card>

        {/* Date Selection Info */}
        {(pickupDate || returnDate) && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CarOutlined className="text-blue-600" />
                <div>
                  <div className="font-medium">Thời gian thuê xe đã chọn</div>
                  <div className="text-sm text-gray-600">
                    {pickupDate && `Nhận xe: ${new Date(pickupDate).toLocaleDateString('vi-VN')}`}
                    {pickupDate && returnDate && ' → '}
                    {returnDate && `Trả xe: ${new Date(returnDate).toLocaleDateString('vi-VN')}`}
                  </div>
                </div>
              </div>
              <Button 
                type="link" 
                onClick={() => navigate('/', { state: { activeTab: 'location' } })}
              >
                Thay đổi
              </Button>
            </div>
          </Card>
        )}

        {/* Available Vehicles */}
        <div className="mb-6 mt-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Xe Điện Có Sẵn ({vehicleCount})
          </h2>
          
          {vehicles.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <CarOutlined className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Hiện tại không có xe nào có sẵn
                </h3>
                <p className="text-gray-600 mb-6">
                  Tất cả xe tại trạm này đang được thuê hoặc bảo trì. 
                  Vui lòng thử lại sau hoặc chọn trạm khác.
                </p>
                <div className="space-x-4">
                  <Button type="primary" onClick={() => navigate('/')}>
                    Tìm trạm khác
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    Làm mới
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onSelect={handleVehicleSelect}
                  showLocation={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationVehicles;