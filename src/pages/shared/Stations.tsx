// src/pages/shared/Stations.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findNearbyStations, getAllStations } from '@/services/stationService';
import StationCard from '@/components/StationCard';
import HeroCarousel from '@/components/HeroCarousel';
import { Input } from '@/components/ui/input'; // Using shadcn Input
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
  Zap,
  Star,
  Loader2,
  LocateFixed,
} from 'lucide-react';
import type { Station } from '@/types/station';
import type { StationSearchFilters } from '@/services/stationService';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Copied city list from VehicleAvailable.tsx
// const cityOptionsRaw = [
//   'Hanoi', 'Ho Chi Minh', 'Da Nang', 'Hai Phong', 'Can Tho', 'Nha Trang', 'Hue', 'Vung Tau', 'Bien Hoa', 'Buon Ma Thuot', 'Da Lat', 'Quy Nhon', 'Thanh Hoa', 'Nam Dinh', 'Vinh', 'Thai Nguyen', 'Bac Ninh', 'Phan Thiet', 'Long Xuyen', 'Rach Gia', 'Bac Lieu', 'Ca Mau', 'Tuy Hoa', 'Pleiku', 'Tra Vinh', 'Soc Trang', 'Ha Long', 'Uong Bi', 'Lao Cai', 'Yen Bai', 'Dien Bien Phu', 'Son La', 'Hoa Binh', 'Tuyen Quang', 'Bac Giang', 'Bac Kan', 'Cao Bang', 'Lang Son', 'Ha Giang', 'Phu Ly', 'Hung Yen', 'Ha Tinh', 'Quang Binh', 'Quang Tri', 'Dong Ha', 'Quang Ngai', 'Tam Ky', 'Kon Tum', 'Gia Nghia', 'Tay Ninh', 'Ben Tre', 'Vinh Long', 'Cao Lanh', 'Sa Dec', 'My Tho', 'Chau Doc', 'Tan An', 'Binh Duong', 'Binh Phuoc', 'Phuoc Long', 'Thu Dau Mot', 'Binh Thuan', 'Binh Dinh', 'Quang Nam', 'Quang Ninh', 'Quang Ngai', 'Quang Tri', 'Quang Binh', 'Ninh Binh', 'Ninh Thuan', 'Ha Nam', 'Ha Tinh', 'Hau Giang', 'Kien Giang', 'Lam Dong', 'Lang Son', 'Lao Cai', 'Nam Dinh', 'Nghe An', 'Phu Tho', 'Phu Yen', 'Quang Binh', 'Quang Nam', 'Quang Ngai', 'Quang Ninh', 'Quang Tri', 'Soc Trang', 'Son La', 'Tay Ninh', 'Thai Binh', 'Thai Nguyen', 'Thanh Hoa', 'Tien Giang', 'Tra Vinh', 'Tuyen Quang', 'Vinh Long', 'Vinh Phuc', 'Yen Bai'
// ];
const cityOptionsRaw = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Biên Hòa', 'Buôn Ma Thuột', 'Đà Lạt', 'Quy Nhơn', 'Thanh Hóa', 'Nam Định', 'Vinh', 'Thái Nguyên', 'Bắc Ninh', 'Phan Thiết', 'Long Xuyên', 'Rạch Giá', 'Bạc Liêu', 'Cà Mau', 'Tuy Hòa', 'Pleiku', 'Trà Vinh', 'Sóc Trăng', 'Hạ Long', 'Uông Bí', 'Lào Cai', 'Yên Bái', 'Điện Biên Phủ', 'Sơn La', 'Hòa Bình', 'Tuyên Quang', 'Bắc Giang', 'Bắc Kạn', 'Cao Bằng', 'Lạng Sơn', 'Hà Giang', 'Phủ Lý', 'Hưng Yên', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Đông Hà', 'Quảng Ngãi', 'Tam Kỳ', 'Kon Tum', 'Gia Nghĩa', 'Tây Ninh', 'Bến Tre', 'Vĩnh Long', 'Cao Lãnh', 'Sa Đéc', 'Mỹ Tho', 'Châu Đốc', 'Tân An', 'Bình Dương', 'Bình Phước', 'Phước Long', 'Thủ Dầu Một', 'Bình Thuận', 'Bình Định', 'Quảng Nam', 'Quảng Ninh', 'Quảng Ngãi', 'Quảng Trị', 'Quảng Bình', 'Ninh Bình', 'Ninh Thuận', 'Hà Nam', 'Hà Tĩnh', 'Hậu Giang', 'Kiên Giang', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Nam Định', 'Nghệ An', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];
const cityOptions = Array.from(new Set(cityOptionsRaw));
// Add "All Cities" to the beginning
// TRANSLATED:
const allCityOptions = ["All Cities", ...cityOptions];

// Data type for Client Filters
interface ClientFilters {
  searchTerm: string;
  status: 'all' | 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  fastCharging: 'all' | 'true' | 'false';
  minRating: 'all' | '1' | '2' | '3' | '4' | '5';
  sortBy: string;
}

const StationsPage: React.FC = () => {
  // === State ===
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  // Default state changed to empty string to fetch all initially
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

  const [isFindingNearby, setIsFindingNearby] = useState(false); // Trạng thái đang tìm vị trí/trạm
  const [searchMode, setSearchMode] = useState<'city' | 'nearby'>('city'); // Chế độ tìm kiếm
  const [nearbyError, setNearbyError] = useState<string | null>(null); // Lỗi khi tìm lân cận
  // === Logic ===

  // 1. API CALL: Runs when `apiCityFilter` changes (on keystroke)
  useEffect(() => {
    // Chỉ fetch theo thành phố nếu đang ở mode 'city'
    if (searchMode !== 'city') return;

    const fetchStationsByCity = async () => {
      setLoading(true);
      setAllStations([]);
      setCurrentPage(1);
      setNearbyError(null); // Xóa lỗi lân cận cũ

      const filterParams: StationSearchFilters = {};
      if (apiCityFilter && apiCityFilter !== 'All Cities') {
        filterParams.city = apiCityFilter;
      }

      try {
        const data = await getAllStations(filterParams, { sort: 'name:asc' });
        setAllStations(data.stations || []);
      } catch (error) {
        console.error('Failed to fetch stations by city:', error);
        setNearbyError('Could not fetch stations for the selected city.'); // Hiển thị lỗi chung
      } finally {
        setLoading(false);
      }
    };

    // Thêm debounce nhỏ để tránh gọi API liên tục khi gõ nhanh
    const debounceFetch = setTimeout(() => {
      fetchStationsByCity();
    }, 300); // Đợi 300ms sau khi ngừng gõ

    return () => clearTimeout(debounceFetch); // Cleanup debounce

  }, [apiCityFilter, searchMode]); // Reruns on every keystroke, like VehicleAvailable.tsx

  // 2. CLIENT FILTERING: (No change)
  const filteredAndSortedStations = useMemo(() => {
    let stations = [...allStations];

    // Filter by searchTerm (Name or Address)
    if (clientFilters.searchTerm) {
      const term = clientFilters.searchTerm.toLowerCase();
      stations = stations.filter(
        (station) =>
          station.name.toLowerCase().includes(term) ||
          station.address.toLowerCase().includes(term)
      );
    }
    // Filter by Status
    if (clientFilters.status !== 'all') {
      const status = clientFilters.status === 'ACTIVE' ? 'active' : (clientFilters.status === 'INACTIVE' ? 'inactive' : 'maintenance');
      stations = stations.filter((station) => station.status === status);
    }
    // Filter by Fast Charging
    if (clientFilters.fastCharging !== 'all') {
      const hasFastCharging = clientFilters.fastCharging === 'true';
      stations = stations.filter(
        (station) => station.fastCharging === hasFastCharging
      );
    }
    // Filter by Rating
    if (clientFilters.minRating !== 'all') {
      const minRating = Number(clientFilters.minRating);
      stations = stations.filter((station) => station.rating >= minRating);
    }
    // Sorting
    stations.sort((a, b) => {
      const [field, order] = clientFilters.sortBy.split(':');
      let valA: any; let valB: any;
      switch (field) {
        case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
        case 'totalSlots': valA = a.totalSlots; valB = b.totalSlots; break;
        case 'rating': valA = a.rating; valB = b.rating; break;
        default: return 0;
      }
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    // Sắp xếp: Nếu đang ở mode nearby, ưu tiên sắp xếp theo distance
    if (searchMode === 'nearby') {
      stations.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      // Sắp xếp theo lựa chọn của người dùng (như cũ)
      stations.sort((a, b) => {
        const [field, order] = clientFilters.sortBy.split(':');
        let valA: any; let valB: any;
        switch (field) {
          case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
          case 'totalSlots': valA = a.totalSlots; valB = b.totalSlots; break;
          case 'rating': valA = a.rating; valB = b.rating; break;
          default: return 0;
        }
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return stations;
  }, [allStations, clientFilters, searchMode]);

  // 3. CLIENT PAGINATION: (No change)
  const totalPages = Math.ceil(filteredAndSortedStations.length / stationsPerPage);
  const paginatedStations = useMemo(() => {
    const startIndex = (currentPage - 1) * stationsPerPage;
    const endIndex = startIndex + stationsPerPage;
    return filteredAndSortedStations.slice(startIndex, endIndex);
  }, [filteredAndSortedStations, currentPage, stationsPerPage]);

  // Handler for client filters
  const handleClientFilterChange = (
    key: keyof ClientFilters,
    value: string
  ) => {
    setClientFilters(prev => ({ ...prev, [key]: value as any }));
    setCurrentPage(1);
  };

  // Handler for API filter (City)
  const handleApiCityChange = (cityValue: string) => {
    setApiCityFilter(cityValue);
    setSearchMode('city'); // QUAN TRỌNG: Chuyển về mode tìm theo thành phố
    setNearbyError(null);
  };

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support finding your location.",
        variant: "destructive",
      });
      return;
    }

    setIsFindingNearby(true);
    setLoading(true); // Hiển thị skeleton chung
    setAllStations([]); // Xóa danh sách cũ
    setCurrentPage(1);
    setNearbyError(null);
    setApiCityFilter(''); // Xóa bộ lọc thành phố
    setSearchMode('nearby'); // Chuyển sang mode nearby

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location:', { latitude, longitude });

        try {
          const nearbyStations = await findNearbyStations({ lat: latitude, lng: longitude });
          setAllStations(nearbyStations);
          if (nearbyStations.length === 0) {
            setNearbyError("No stations found near your current location.");
          }
        } catch (error: any) {
          console.error("Error fetching nearby stations:", error);
          setNearbyError(error.message || "Could not find nearby stations.");
          toast({
            title: "Error Finding Stations",
            description: error.message || "Could not find nearby stations. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsFindingNearby(false);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let message = "Could not get your location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied. Please enable it in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "The request to get user location timed out.";
        }
        setNearbyError(message);
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
        setIsFindingNearby(false);
        setLoading(false);
        setSearchMode('city'); // Quay lại mode city nếu lỗi vị trí
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Options
    );
  };

  // Handler for pagination
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
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-slate-100 pb-12">
      <div className="mb-8">
        <HeroCarousel
          slides={[{
            title: "Khám phá các trạm thuê xe điện chuyên nghiệp",
            subtitle: "Tìm kiếm, lọc và lựa chọn trạm phù hợp nhất cho hành trình của bạn. Giao diện hiện đại, trải nghiệm mượt mà.",
            image: "https://voffice.com.sg/wp-content/uploads/2024/10/car-dealer-singapore.jpg",
            ctaText: "Tìm trạm gần bạn",
            ctaHref: "/stations/nearby"
          }, {
            title: "Hệ thống trạm phủ sóng toàn quốc",
            subtitle: "Dễ dàng tìm kiếm trạm ở mọi thành phố lớn, hỗ trợ sạc nhanh và nhiều tiện ích.",
            image: "https://media.licdn.com/dms/image/v2/D5612AQFHUcJajkhxbQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1692850315219?e=2147483647&v=beta&t=bvm8lGx9r-xai8-smpoDE0GQwzZNuuyy6_B2OToJyWw",
            ctaText: "Hướng dẫn thuê xe",
            ctaHref: "/how-it-works"
          }]}
          className="rounded-2xl shadow-xl"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 p-6 bg-white/90 rounded-2xl shadow-xl border border-slate-100 backdrop-blur-lg"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="name-search"
                placeholder="Tìm theo tên hoặc địa chỉ trạm..."
                className="pl-10 text-base rounded-full border-slate-300 focus:border-primary"
                value={clientFilters.searchTerm}
                onChange={(e) => handleClientFilterChange('searchTerm', e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-[250px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <Input placeholder="Search city..." className="pl-10 text-base rounded-full border-slate-300 focus:border-primary" value={apiCityFilter} onChange={(e) => handleApiCityChange(e.target.value)} list="city-list" disabled={isFindingNearby || searchMode === 'nearby'} />
              <datalist id="city-list">{allCityOptions.map((city, idx) => (<option key={city + idx} value={city} />))}</datalist>
            </div>

            <Button
              variant="outline"
              className="rounded-full font-semibold text-base shadow hover:bg-green-100 transition-colors duration-200 text-green-700 border-green-300"
              onClick={handleFindNearby}
              disabled={isFindingNearby || loading} // Disable khi đang tìm hoặc đang load
            >
              {isFindingNearby ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="mr-2 h-4 w-4" />
              )}
              {isFindingNearby ? 'Đang tìm...' : 'Tìm gần đây'}
            </Button>

            <Button
              variant="outline"
              className="rounded-full font-semibold text-base shadow hover:bg-blue-100 transition-colors duration-200"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showMoreFilters ? 'Ẩn bộ lọc' : 'Thêm bộ lọc'}
            </Button>
          </div>
          {/* Hiển thị lỗi tìm kiếm lân cận */}
          {nearbyError && searchMode === 'nearby' && (
            <div className="mt-4 text-center text-red-600 bg-red-50 p-3 rounded-md border border-red-200 text-sm">
              {nearbyError}
            </div>
          )}
          <AnimatePresence>
            {showMoreFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }} // Thêm marginTop khi hiện
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden" // Quan trọng để animation height hoạt động
              >
                <Separator className="my-4" /> {/* Separator vẫn ở đây */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* ... (Select cho Status, FastCharging, Rating, SortBy như cũ) ... */}
                  <Select value={clientFilters.status} onValueChange={(value) => handleClientFilterChange('status', value)}>
                    <SelectTrigger className="rounded-full"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="UNDER_MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={clientFilters.fastCharging} onValueChange={(value) => handleClientFilterChange('fastCharging', value)}>
                    <SelectTrigger className="rounded-full"><Zap className="mr-2 h-4 w-4" /><SelectValue placeholder="Fast Charging" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Charging</SelectItem>
                      <SelectItem value="true">Fast Charging</SelectItem>
                      <SelectItem value="false">Standard Charging</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={clientFilters.minRating} onValueChange={(value) => handleClientFilterChange('minRating', value)}>
                    <SelectTrigger className="rounded-full"><Star className="mr-2 h-4 w-4" /><SelectValue placeholder="Rating" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Rating</SelectItem>
                      <SelectItem value="5">5 Stars & Up</SelectItem>
                      <SelectItem value="4">4 Stars & Up</SelectItem>
                      <SelectItem value="3">3 Stars & Up</SelectItem>
                      <SelectItem value="2">2 Stars & Up</SelectItem>
                      <SelectItem value="1">1 Star & Up</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Ẩn SortBy khi đang tìm gần đây (vì đã sort theo distance) */}
                  {searchMode === 'city' && (
                    <Select value={clientFilters.sortBy} onValueChange={(value) => handleClientFilterChange('sortBy', value)}>
                      <SelectTrigger className="rounded-full"><SelectValue placeholder="Sort By" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                        <SelectItem value="totalSlots:desc">Capacity (High-Low)</SelectItem>
                        <SelectItem value="totalSlots:asc">Capacity (Low-High)</SelectItem>
                        <SelectItem value="rating:desc">Rating (High-Low)</SelectItem>
                        <SelectItem value="rating:asc">Rating (Low-High)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* === STATION LIST AREA === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <StationSkeletonCard key={index} />)
          ) : (
            <AnimatePresence>
              {paginatedStations.map((station, idx) => (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                  className="h-full"
                >
                  <StationCard
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
                      distance: searchMode === 'nearby' ? station.distance : undefined,
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* No Results Message */}
        {!loading && paginatedStations.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <BatteryCharging className="mx-auto h-12 w-12 text-gray-400" />
            {/* TRANSLATED: */}
            <h3 className="mt-2 text-lg font-medium text-gray-900">No stations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {allStations.length > 0
                // TRANSLATED:
                ? 'Try adjusting your search filters.'
                // TRANSLATED:
                : 'No stations available for this city.'}
            </p>
          </div>
        )}

        {/* Pagination (Client-side) */}
        {!loading && filteredAndSortedStations.length > stationsPerPage && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              variant="outline"
            >
              {/* TRANSLATED: */}
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              {/* TRANSLATED: */}
              Page {currentPage} / {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              variant="outline"
            >
              {/* TRANSLATED: */}
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationsPage;