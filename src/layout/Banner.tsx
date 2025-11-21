import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import img from '../assets/hero-ev-station.jpg';
import { vehicleService } from '@/services/vehicleService';
import { stationService, type Station } from '@/services/stationService';
import { useToast } from '@/hooks/use-toast';

const Banner: React.FC = () => {
  const [location, setLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [searchMode, setSearchMode] = useState<'location' | 'nearby'>('location');
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [totalStations, setTotalStations] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Lấy vị trí hiện tại của người dùng
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Không hỗ trợ định vị",
        description: "Trình duyệt của bạn không hỗ trợ định vị GPS.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        try {
          // Tìm trạm xung quanh vị trí hiện tại
          const stations = await stationService.findNearbyStations({
            lat: latitude,
            lng: longitude,
            radiusKm: 30
          });
          
          setNearbyStations(stations);
          setSearchMode('nearby');
          
          toast({
            title: "Tìm thấy trạm gần bạn",
            description: `Đã tìm thấy ${stations.length} trạm sạc trong bán kính 30km`,
            variant: "default",
          });
        } catch (error) {
          console.error('Lỗi tìm trạm:', error);
          toast({
            title: "Lỗi tìm trạm",
            description: "Không thể tìm trạm xung quanh. Vui lòng thử lại.",
            variant: "destructive",
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        let message = "Không thể lấy vị trí của bạn.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép và thử lại.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Thông tin vị trí không khả dụng.";
            break;
          case error.TIMEOUT:
            message = "Yêu cầu lấy vị trí đã hết thời gian chờ.";
            break;
        }
        
        toast({
          title: "Lỗi định vị",
          description: message,
          variant: "destructive",
        });
      }
    );
  };
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Lấy tổng số xe có sẵn
        const { vehicles } = await vehicleService.getAvailableVehicles({}, { limit: 1000 });
        setTotalVehicles(vehicles.length);

        // Lấy tổng số trạm sạc
        const stationsData = await stationService.getAllStations();
        setTotalStations(stationsData.stations.length);
        
      } catch (error) {
        console.error('Không thể tải số liệu:', error);
        // Giữ giá trị mặc định nếu API thất bại
        setTotalVehicles(50);
        setTotalStations(8);
      }
    };

    loadStats();
  }, []);

  const handleStationSelect = (station: Station) => {
    // Điều hướng đến trang trạm với các xe có sẵn
    navigate(`/stations/${station.id}/vehicles`, {
      state: { 
        station,
        pickupDate, 
        returnDate,
        fromNearby: true 
      }
    });
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      toast({
        title: "Yêu cầu địa điểm",
        description: "Vui lòng nhập địa điểm nhận xe để tìm kiếm.",
        variant: "destructive",
      });
      return;
    }

    if (!pickupDate || !returnDate) {
      toast({
        title: "Yêu cầu ngày tháng", 
        description: "Vui lòng chọn cả ngày nhận và ngày trả xe.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(pickupDate) >= new Date(returnDate)) {
      toast({
        title: "Ngày tháng không hợp lệ",
        description: "Ngày trả xe phải sau ngày nhận xe.",
        variant: "destructive", 
      });
      return;
    }

    try {
      setIsSearching(true);
      
      console.log('🔍 Đang tìm kiếm xe:', { location, pickupDate, returnDate });
      
      // Tìm kiếm xe theo địa điểm
      const { vehicles } = await vehicleService.searchVehiclesByLocation(location);
      
      if (vehicles.length === 0) {
        toast({
          title: "Không tìm thấy xe",
          description: `Không có xe nào có sẵn tại "${location}". Vui lòng thử địa điểm khác.`,
          variant: "destructive",
        });
        return;
      }

      // Điều hướng đến trang xe với các tham số tìm kiếm
      const searchParams = new URLSearchParams({
        location: location,
        pickup: pickupDate,
        return: returnDate,
      });
      
      navigate(`/vehicles?${searchParams.toString()}`);
      
      toast({
        title: "Tìm kiếm thành công",
        description: `Đã tìm thấy ${vehicles.length} xe có sẵn tại ${location}`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Tìm kiếm thất bại:', error);
      toast({
        title: "Tìm kiếm thất bại",
        description: "Không thể tìm kiếm xe. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-18">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Nội dung bên trái */}
          <div className="space-y-8">
            {/* Huy hiệu */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              100% Xe Điện
            </div>
            
            {/* Tiêu đề chính */}
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Thuê Xe Điện Cao Cấp
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                  {" "}Dễ Dàng
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Trải nghiệm tương lai của giao thông với đội xe thân thiện với môi trường của chúng tôi. 
                Sạch sẽ, hiệu quả và sẵn sàng cho chuyến phiêu lưu tiếp theo của bạn.
              </p>
            </div>

            {/* Form tìm kiếm */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              {/* Tabs để chọn chế độ tìm kiếm */}
              <div className="flex mb-6 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setSearchMode('location')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    searchMode === 'location'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Tìm theo địa điểm
                </button>
                <button
                  onClick={() => setSearchMode('nearby')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    searchMode === 'nearby'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Trạm gần tôi
                </button>
              </div>

              {searchMode === 'location' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tìm Xe Điện Hoàn Hảo Của Bạn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa Điểm Nhận Xe
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Nhập địa điểm..."
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày Nhận Xe
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày Trả Xe
                      </label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center shadow-lg"
                  >
                    {isSearching ? (
                      <>
                        <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Đang tìm kiếm...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Tìm Xe Có Sẵn
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tìm Trạm Sạc Gần Bạn</h3>
                  
                  {!userLocation && nearbyStations.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Chúng tôi sẽ tìm các trạm sạc xe điện gần vị trí hiện tại của bạn
                      </p>
                      <button
                        onClick={getUserLocation}
                        disabled={isGettingLocation}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center mx-auto"
                      >
                        {isGettingLocation ? (
                          <>
                            <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Đang lấy vị trí...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                            </svg>
                            Lấy vị trí của tôi
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Hiển thị ngày tháng cho việc đặt trước */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày Nhận Xe
                          </label>
                          <input
                            type="date"
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày Trả Xe
                          </label>
                          <input
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Danh sách trạm gần */}
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {nearbyStations.map((station) => (
                          <div
                            key={station.id}
                            onClick={() => handleStationSelect(station)}
                            className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{station.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{station.address}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {station.availableVehicles} xe có sẵn
                                  </span>
                                  {station.fastCharging && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Sạc nhanh
                                    </span>
                                  )}
                                  <div className="flex items-center text-xs text-gray-500">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {station.distance?.toFixed(1)} km
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4 text-right">
                                <div className="flex items-center text-sm text-yellow-600">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                  {station.rating.toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {station.reviewCount} đánh giá
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={getUserLocation}
                        disabled={isGettingLocation}
                        className="w-full mt-4 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Làm mới vị trí
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Nội dung bên phải - Hình ảnh */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={img} 
                alt="Trạm Sạc Xe Điện" 
                className="w-full h-[600px] object-cover rounded-2xl shadow-2xl"
              />
              {/* Thẻ số liệu nổi */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {totalVehicles > 0 ? `${totalVehicles}+` : '...'}
                </div>
                <div className="text-sm text-gray-600">Xe Điện</div>
              </div>
              
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-green-600">4.9★</div>
                <div className="text-sm text-gray-600">Đánh Giá Khách Hàng</div>
              </div>
              
              <div className="absolute top-1/2 -left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {totalStations > 0 ? totalStations : '...'}
                </div>
                <div className="text-sm text-gray-600">Trạm Sạc</div>
              </div>
            </div>
            
            {/* Trang trí nền */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-blue-500 to-green-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
