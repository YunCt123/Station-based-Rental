import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import img from '../assets/hero-ev-station.jpg';
import { vehicleService } from '@/services/vehicleService';
import { stationService } from '@/services/stationService';
import { useToast } from '@/hooks/use-toast';

const Banner: React.FC = () => {
  const [location, setLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [totalStations, setTotalStations] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Tải số liệu thực tế khi component được mount
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
            </div>

            {/* Danh sách tính năng */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Không Khí Thải</div>
                  <div className="text-sm text-gray-600">100% Điện</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Đặt Xe Nhanh</div>
                  <div className="text-sm text-gray-600">Có Sẵn 24/7</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Đội Xe Cao Cấp</div>
                  <div className="text-sm text-gray-600">Mẫu Mới Nhất</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Hỗ Trợ Chuyên Nghiệp</div>
                  <div className="text-sm text-gray-600">Hỗ Trợ 24/7</div>
                </div>
              </div>
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
