/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import VehicleCard from '../components/VehicleCard';
import type { Vehicle, VehicleSearchFilters } from '@/types/vehicle';
import { vehicleService } from '@/services/vehicleService';
import { useToast } from '@/hooks/use-toast';
import { LoadingWrapper } from '@/components/LoadingComponents';

const Content: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, _setFilters] = useState<VehicleSearchFilters>({});
  const [sortBy, _setSortBy] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🚗 Đang tải danh sách phương tiện từ API...');
        
        await vehicleService.testConnection();
        
        const { vehicles: fetchedVehicles } = await vehicleService.getAvailableVehicles(
          filters,
          { limit: 6, sort: sortBy || undefined }
        );
        
        console.log('✅ Đã tải phương tiện:', fetchedVehicles.length);
        setVehicles(fetchedVehicles);
        
      } catch (err: unknown) {
        console.error('❌ Lỗi khi tải phương tiện:', err);
        const errorMessage = err instanceof Error ? err.message : 'Không thể tải phương tiện';
        setError(errorMessage);
        toast({
          title: "Lỗi",
          description: "Không thể tải phương tiện. Sử dụng dữ liệu dự phòng.",
          variant: "destructive",
        });
        
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [filters, sortBy, toast]);

  // const handleFilterChange = (filterKey: keyof VehicleSearchFilters, value: string) => {
  //   if (value === '' || value === 'all') {
  //     const newFilters = { ...filters };
  //     delete newFilters[filterKey];
  //     setFilters(newFilters);
  //   } else {
  //     setFilters(prev => ({ ...prev, [filterKey]: value }));
  //   }
  // };

  // const handleSortChange = (value: string) => {
  //   setSortBy(value === 'default' ? '' : value);
  // };

  return (  
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Phương Tiện Điện Có Sẵn
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Lựa chọn từ đội xe điện cao cấp của chúng tôi. Tất cả phương tiện đều được bảo trì và sạc đầy để bạn sử dụng.
          </p>
        </div>

        {/* <div className="flex flex-wrap items-center justify-between mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center space-x-4 mb-4 md:mb-0">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleFilterChange('type', e.target.value)}
              defaultValue=""
            >
              <option value="">Tất Cả Loại</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Crossover">Crossover</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Motorcycle">Xe Máy</option>
              <option value="Scooter">Xe Tay Ga</option>
            </select>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              defaultValue=""
            >
              <option value="">Tất Cả Hãng</option>
              <option value="Tesla">Tesla</option>
              <option value="VinFast">VinFast</option>
              <option value="BMW">BMW</option>
              <option value="Audi">Audi</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Nissan">Nissan</option>
            </select>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleFilterChange('search', e.target.value)}
              defaultValue=""
            >
              <option value="">Tất Cả Địa Điểm</option>
              <option value="District 1">Trạm Quận 1</option>
              <option value="District 7">Trạm Quận 7</option>
              <option value="District 3">Trạm Quận 3</option>
              <option value="Airport">Trạm Sân Bay</option>
              <option value="Binh Thanh">Trạm Bình Thạnh</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sắp xếp theo:</span>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleSortChange(e.target.value)}
              defaultValue="default"
            >
              <option value="default">Mặc Định</option>
              <option value="pricePerHour">Giá: Thấp đến Cao</option>
              <option value="-pricePerHour">Giá: Cao đến Thấp</option>
              <option value="-rating">Đánh Giá</option>
              <option value="-batteryLevel">Mức Pin</option>
              <option value="-range">Quãng Đường</option>
            </select>
          </div>
        </div> */}

        <LoadingWrapper
          isLoading={isLoading}
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          }
        >
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không Thể Tải Phương Tiện</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
              >
                Thử Lại
              </button>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không Có Phương Tiện</h3>
              <p className="text-gray-600">Hãy thử thay đổi bộ lọc hoặc quay lại sau.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </LoadingWrapper>

        {!error && vehicles.length > 0 && (
          <div className="text-center mt-12">
            <button 
              onClick={() => {
                window.location.href = '/vehicles';
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Xem Tất Cả Phương Tiện
            </button>
          </div>
        )}

        {/* <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {isLoading ? '...' : `${vehicles.length}+`}
              </div>
              <div className="text-gray-600">Có Sẵn Ngay</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">8</div>
              <div className="text-gray-600">Trạm Sạc</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Hỗ Trợ Khách Hàng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 mb-2">95%</div>
              <div className="text-gray-600">Hài Lòng Khách Hàng</div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Content;
