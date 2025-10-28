// src/pages/shared/Stations.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { getAllStations } from '@/services/stationService';
import StationCard from '@/components/StationCard';
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
} from 'lucide-react';
import type { Station } from '@/types/station';
import type { StationSearchFilters } from '@/services/stationService';
import { Separator } from '@/components/ui/separator';

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

  // === Logic ===

  // 1. API CALL: Runs when `apiCityFilter` changes (on keystroke)
  useEffect(() => {
    const fetchStationsByCity = async () => {
      setLoading(true);
      setAllStations([]);
      setCurrentPage(1);

      const filterParams: StationSearchFilters = {};

      // Only apply filter if city is not empty or "All Cities"
      // TRANSLATED:
      if (apiCityFilter && apiCityFilter !== 'All Cities') {
        filterParams.city = apiCityFilter;
      }

      try {
        const data = await getAllStations(filterParams, { sort: 'name:asc' });
        setAllStations(data.stations || []);
      } catch (error) {
        console.error('Failed to fetch stations by city:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStationsByCity();
  }, [apiCityFilter]); // Reruns on every keystroke, like VehicleAvailable.tsx

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
    <div className="container mx-auto p-4 md:p-8">
      {/* TRANSLATED: */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Find a Rental Station</h1>

      {/* === HORIZONTAL FILTER AREA === */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-lg space-y-4">
        {/* Row 1: Search, City, More Filters Button */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search (Client) */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="name-search"
              // TRANSLATED:
              placeholder="Search by station name or address..."
              className="pl-10"
              value={clientFilters.searchTerm}
              onChange={(e) => handleClientFilterChange('searchTerm', e.target.value)}
            />
          </div>

          {/* City Input + Datalist (API) */}
          <div className="relative w-full md:w-[250px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              // TRANSLATED:
              placeholder="Search city..."
              className="pl-10"
              value={apiCityFilter}
              // Update state on every keystroke
              onChange={(e) => handleApiCityChange(e.target.value)}
              list="city-list" // Connect to datalist
            />
            {/* Datalist like VehicleAvailable.tsx */}
            <datalist id="city-list">
              {allCityOptions.map((city, idx) => (
                  <option key={city + idx} value={city} />
              ))}
            </datalist>
          </div>

          {/* More Filters Button */}
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {/* TRANSLATED: */}
            {showMoreFilters ? 'Hide Filters' : 'More Filters'}
          </Button>
        </div>

        {/* Row 2: Other Filters (shown on button click) */}
        {showMoreFilters && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <Select
                value={clientFilters.status}
                onValueChange={(value) => handleClientFilterChange('status', value)}
              >
                <SelectTrigger>
                  {/* TRANSLATED: */}
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {/* TRANSLATED: */}
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="UNDER_MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              {/* Fast Charging Filter */}
              <Select
                value={clientFilters.fastCharging}
                onValueChange={(value) => handleClientFilterChange('fastCharging', value)}
              >
                <SelectTrigger>
                  <Zap className="mr-2 h-4 w-4" />
                  {/* TRANSLATED: */}
                  <SelectValue placeholder="Fast Charging" />
                </SelectTrigger>
                <SelectContent>
                  {/* TRANSLATED: */}
                  <SelectItem value="all">Any Charging</SelectItem>
                  <SelectItem value="true">Fast Charging</SelectItem>
                  <SelectItem value="false">Standard Charging</SelectItem>
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select
                value={clientFilters.minRating}
                onValueChange={(value) => handleClientFilterChange('minRating', value)}
              >
                <SelectTrigger>
                  <Star className="mr-2 h-4 w-4" />
                  {/* TRANSLATED: */}
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  {/* TRANSLATED: */}
                  <SelectItem value="all">Any Rating</SelectItem>
                  <SelectItem value="5">5 Stars & Up</SelectItem>
                  <SelectItem value="4">4 Stars & Up</SelectItem>
                  <SelectItem value="3">3 Stars & Up</SelectItem>
                  <SelectItem value="2">2 Stars & Up</SelectItem>
                  <SelectItem value="1">1 Star & Up</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By Filter */}
              <Select
                value={clientFilters.sortBy}
                onValueChange={(value) => handleClientFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  {/* TRANSLATED: */}
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  {/* TRANSLATED: */}
                  <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                  <SelectItem value="totalSlots:desc">Capacity (High-Low)</SelectItem>
                  <SelectItem value="totalSlots:asc">Capacity (Low-High)</SelectItem>
                  <SelectItem value="rating:desc">Rating (High-Low)</SelectItem>
                  <SelectItem value="rating:asc">Rating (Low-High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* === STATION LIST AREA === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <StationSkeletonCard key={index} />
            ))
          : paginatedStations.map((station) => (
              <StationCard
                key={station.id}
                station={{
                  ...station, // Pass all original station data
                  // Ensure required props for StationCard are explicitly passed
                  id: station.id,
                  name: station.name,
                  address: station.address,
                  imageUrl: station.image || 'https://via.placeholder.com/400x300?text=EV+Station',
                  availableCount: station.availableVehicles,
                  totalCount: station.totalSlots,
                  fastCharging: station.fastCharging, // Pass fastCharging
                  rating: station.rating,             // Pass rating
                }}
              />
            ))}
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
  );
};

export default StationsPage;