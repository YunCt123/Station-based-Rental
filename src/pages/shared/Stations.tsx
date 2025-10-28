// src/pages/shared/Stations.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { getAllStations } from '@/services/stationService';
import StationCard from '@/components/StationCard';
import { Input } from '@/components/ui/input'; // Dùng Input của shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  MapPin,
  BatteryCharging,
  Filter,
  X,
  Zap,
  Star,
} from 'lucide-react';
import type { Station } from '@/types/station';
import type { StationSearchFilters } from '@/services/stationService';
import { Separator } from '@/components/ui/separator';

// THÊM MỚI: Sao chép danh sách thành phố từ VehicleAvailable.tsx
const cityOptionsRaw = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Biên Hòa', 'Buôn Ma Thuột', 'Đà Lạt', 'Quy Nhơn', 'Thanh Hóa', 'Nam Định', 'Vinh', 'Thái Nguyên', 'Bắc Ninh', 'Phan Thiết', 'Long Xuyên', 'Rạch Giá', 'Bạc Liêu', 'Cà Mau', 'Tuy Hòa', 'Pleiku', 'Trà Vinh', 'Sóc Trăng', 'Hạ Long', 'Uông Bí', 'Lào Cai', 'Yên Bái', 'Điện Biên Phủ', 'Sơn La', 'Hòa Bình', 'Tuyên Quang', 'Bắc Giang', 'Bắc Kạn', 'Cao Bằng', 'Lạng Sơn', 'Hà Giang', 'Phủ Lý', 'Hưng Yên', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Đông Hà', 'Quảng Ngãi', 'Tam Kỳ', 'Kon Tum', 'Gia Nghĩa', 'Tây Ninh', 'Bến Tre', 'Vĩnh Long', 'Cao Lãnh', 'Sa Đéc', 'Mỹ Tho', 'Châu Đốc', 'Tân An', 'Bình Dương', 'Bình Phước', 'Phước Long', 'Thủ Dầu Một', 'Bình Thuận', 'Bình Định', 'Quảng Nam', 'Quảng Ninh', 'Quảng Ngãi', 'Quảng Trị', 'Quảng Bình', 'Ninh Bình', 'Ninh Thuận', 'Hà Nam', 'Hà Tĩnh', 'Hậu Giang', 'Kiên Giang', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Nam Định', 'Nghệ An', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];
const cityOptions = Array.from(new Set(cityOptionsRaw));
// Thêm "Tất cả thành phố" vào đầu danh sách
const allCityOptions = ["Tất cả thành phố", ...cityOptions];

// Kiểu dữ liệu cho các bộ lọc phía Client
interface ClientFilters {
  searchTerm: string;
  status: 'all' | 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  fastCharging: 'all' | 'true' | 'false';
  minRating: 'all' | '1' | '2' | '3' | '4' | '5';
  sortBy: string;
}

const StationsPage: React.FC = () => {
  // === State ===
  const [loading, setLoading] = useState(true);
  // Sửa state mặc định thành "Tất cả thành phố"
  const [apiCityFilter, setApiCityFilter] = useState<string>(''); 
  const [allStations, setAllStations] = useState<Station[]>([]); 

  const [clientFilters, setClientFilters] = useState<ClientFilters>({
    searchTerm: '',
    status: 'all',
    fastCharging: 'all',
    minRating: 'all',
    sortBy: 'name:asc',
  });
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const stationsPerPage = 9;

  // === Logic ===

  // 1. GỌI API: Chạy khi `apiCityFilter` thay đổi (mỗi khi gõ phím)
  useEffect(() => {
    const fetchStationsByCity = async () => {
      setLoading(true);
      setAllStations([]); 
      setCurrentPage(1); 

      const filterParams: StationSearchFilters = {};
      
      // Chỉ áp dụng filter nếu thành phố không phải là "Tất cả"
      if (apiCityFilter && apiCityFilter !== 'Tất cả thành phố') {
        filterParams.city = apiCityFilter;
      }
      
      try {
        // Chúng ta vẫn gọi `getAllStations` vì nó hỗ trợ lọc client-side tốt hơn
        // (Nếu `apiCityFilter` trống, nó sẽ lấy tất cả)
        const data = await getAllStations(filterParams, { sort: 'name:asc' });
        setAllStations(data.stations || []);
      } catch (error) {
        console.error('Failed to fetch stations by city:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStationsByCity();
  }, [apiCityFilter]); // Chạy lại mỗi khi gõ phím, giống hệt VehicleAvailable.tsx

  // 2. LỌC CLIENT: (Không thay đổi)
  const filteredAndSortedStations = useMemo(() => {
    let stations = [...allStations];

    // Lọc theo searchTerm (Tên hoặc Địa chỉ)
    if (clientFilters.searchTerm) {
      const term = clientFilters.searchTerm.toLowerCase();
      stations = stations.filter(
        (station) =>
          station.name.toLowerCase().includes(term) ||
          station.address.toLowerCase().includes(term)
      );
    }
    // Lọc theo Trạng thái
    if (clientFilters.status !== 'all') {
      const status = clientFilters.status === 'ACTIVE' ? 'active' : (clientFilters.status === 'INACTIVE' ? 'inactive' : 'maintenance');
      stations = stations.filter((station) => station.status === status);
    }
    // Lọc theo Sạc nhanh
    if (clientFilters.fastCharging !== 'all') {
      const hasFastCharging = clientFilters.fastCharging === 'true';
      stations = stations.filter(
        (station) => station.fastCharging === hasFastCharging
      );
    }
    // Lọc theo Đánh giá
    if (clientFilters.minRating !== 'all') {
      const minRating = Number(clientFilters.minRating);
      stations = stations.filter((station) => station.rating >= minRating);
    }
    // Sắp xếp
    stations.sort((a, b) => {
      const [field, order] = clientFilters.sortBy.split(':');
      let valA: any; let valB: any;
      switch(field) {
        case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
        case 'totalSlots': valA = a.totalSlots; valB = b.totalSlots; break;
        case 'rating': valA = a.rating; valB = b.rating; break;
        default: return 0;
      }
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return stations;
  }, [allStations, clientFilters]);

  // 3. PHÂN TRANG CLIENT: (Không thay đổi)
  const totalPages = Math.ceil(filteredAndSortedStations.length / stationsPerPage);
  const paginatedStations = useMemo(() => {
    const startIndex = (currentPage - 1) * stationsPerPage;
    const endIndex = startIndex + stationsPerPage;
    return filteredAndSortedStations.slice(startIndex, endIndex);
  }, [filteredAndSortedStations, currentPage, stationsPerPage]);

  // Hàm xử lý chung cho các filter của client
  const handleClientFilterChange = (
    key: keyof ClientFilters,
    value: string
  ) => {
    setClientFilters(prev => ({ ...prev, [key]: value as any }));
    setCurrentPage(1); 
  };

  // Hàm xử lý riêng cho filter API (Thành phố)
  const handleApiCityChange = (cityValue: string) => {
    setApiCityFilter(cityValue);
  };

  // Hàm xử lý phân trang
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // === JSX ===
  
  const StationSkeletonCard: React.FC = () => (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" /> <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" /> <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tìm trạm thuê</h1>
      
      {/* === KHU VỰC FILTER NGANG === */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-lg space-y-4">
        {/* Hàng 1: Search, City, Nút Thêm Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search (Client) */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="name-search"
              placeholder="Tìm theo tên hoặc địa chỉ trạm..."
              className="pl-10"
              value={clientFilters.searchTerm}
              onChange={(e) => handleClientFilterChange('searchTerm', e.target.value)}
            />
          </div>
          
          {/* THAY THẾ: Sử dụng Input + Datalist cho Thành phố (API) */}
          <div className="relative w-full md:w-[250px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              placeholder="Tìm thành phố..."
              className="pl-10"
              value={apiCityFilter}
              // Cập nhật state trên mỗi lần gõ phím
              onChange={(e) => handleApiCityChange(e.target.value)} 
              list="city-list" // Kết nối với datalist
            />
            {/* Đây là <datalist> giống hệt VehicleAvailable.tsx */}
            <datalist id="city-list">
              {allCityOptions.map((city, idx) => (
                  <option key={city + idx} value={city} />
              ))}
            </datalist>
          </div>

          {/* Nút Thêm Filter */}
          <Button 
            variant="outline" 
            className="w-full md:w-auto"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showMoreFilters ? 'Ẩn filter' : 'Thêm filter'}
          </Button>
        </div>

        {/* Hàng 2: Các Filter khác (hiện khi bấm nút) */}
        {showMoreFilters && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filter Trạng thái */}
              <Select
                value={clientFilters.status}
                onValueChange={(value) => handleClientFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                  <SelectItem value="UNDER_MAINTENANCE">Đang bảo trì</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Filter Sạc nhanh */}
              <Select
                value={clientFilters.fastCharging}
                onValueChange={(value) => handleClientFilterChange('fastCharging', value)}
              >
                <SelectTrigger>
                  <Zap className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sạc nhanh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi loại sạc</SelectItem>
                  <SelectItem value="true">Có sạc nhanh</SelectItem>
                  <SelectItem value="false">Không có</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Filter Đánh giá */}
              <Select
                value={clientFilters.minRating}
                onValueChange={(value) => handleClientFilterChange('minRating', value)}
              >
                <SelectTrigger>
                  <Star className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Đánh giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi đánh giá</SelectItem>
                  <SelectItem value="5">Từ 5 sao</SelectItem>
                  <SelectItem value="4">Từ 4 sao</SelectItem>
                  <SelectItem value="3">Từ 3 sao</SelectItem>
                  <SelectItem value="2">Từ 2 sao</SelectItem>
                  <SelectItem value="1">Từ 1 sao</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Sắp xếp */}
              <Select
                value={clientFilters.sortBy}
                onValueChange={(value) => handleClientFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name:asc">Tên (A-Z)</SelectItem>
                  <SelectItem value="name:desc">Tên (Z-A)</SelectItem>
                  <SelectItem value="totalSlots:desc">Sức chứa (Cao-Thấp)</SelectItem>
                  <SelectItem value="totalSlots:asc">Sức chứa (Thấp-Cao)</SelectItem>
                  <SelectItem value="rating:desc">Đánh giá (Cao-Thấp)</SelectItem>
                  <SelectItem value="rating:asc">Đánh giá (Thấp-Cao)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* === KHU VỰC DANH SÁCH TRẠM === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <StationSkeletonCard key={index} />
            ))
          : paginatedStations.map((station) => (
              <StationCard
                key={station.id}
                station={{
                  ...station,
                  id: station.id,
                  name: station.name,
                  address: station.address,
                  imageUrl: station.image || 'https://via.placeholder.com/400x300?text=EV+Station',
                  availableCount: station.availableVehicles,
                  totalCount: station.totalSlots,
                  fastCharging: station.fastCharging,
                  rating: station.rating,
                }}
              />
            ))}
      </div>

      {/* Thông báo nếu không tìm thấy kết quả */}
      {!loading && paginatedStations.length === 0 && (
        <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
          <BatteryCharging className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy trạm nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            {allStations.length > 0
              ? 'Thử thay đổi bộ lọc tìm kiếm.'
              : 'Không có trạm nào cho thành phố này.'}
          </p>
        </div>
      )}
      
      {/* Phân trang (Client-side) */}
      {!loading && filteredAndSortedStations.length > stationsPerPage && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            variant="outline"
          >
            Trang trước
          </Button>
          <span className="text-sm text-gray-700">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            variant="outline"
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
};

export default StationsPage;