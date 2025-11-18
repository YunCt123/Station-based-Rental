/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Zap, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { stationService, type Station } from "@/services/stationService";
import {
  PageTransition,
  FadeIn,
  SlideIn,
  LoadingWrapper,
} from "@/components/LoadingComponents";
import { VehicleCardSkeleton } from "@/components/ui/skeleton";

const Stations = () => {
  // State for stations data
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stations from API
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
        setError(null);
        setIsLoading(true);
        
        console.log('🏢 Đang lấy danh sách trạm từ API...');
        
        // Test connection first
        await stationService.testConnection();
        console.log('🔗 Kết nối API trạm thành công');
        
        // Get active stations
        const response = await stationService.getActiveStations({}, {
          limit: 50,
          sort: 'name'
        });
        
        console.log('✅ Lấy danh sách trạm thành công:', response.stations);
        
        // Fetch real vehicle counts for each station
        const stationsWithRealCounts = await Promise.all(
          response.stations.map(async (station) => {
            try {
              // Get total vehicle count for station
              const allVehiclesData = await stationService.getStationVehicles(station.id);
              const totalVehicles = allVehiclesData.count;
              
              // Get available vehicle count for station
              const availableVehiclesData = await stationService.getStationVehicles(station.id, 'AVAILABLE');
              const availableVehicles = availableVehiclesData.count;
              
              console.log(`📊 Trạm ${station.name}: ${availableVehicles}/${totalVehicles} phương tiện`);
              
              return {
                ...station,
                totalVehicles,
                availableVehicles
              };
            } catch (vehicleError) {
              console.warn(`⚠️ Không thể lấy thông tin phương tiện cho trạm ${station.name}:`, vehicleError);
              // Fallback to backend metrics or default values
              return {
                ...station,
                totalVehicles: station.totalVehicles || 0,
                availableVehicles: station.availableVehicles || 0
              };
            }
          })
        );
        
        setStations(stationsWithRealCounts);
        
      } catch (error: any) {
        console.error('❌ Lỗi khi lấy danh sách trạm:', error);
        setError(`Không thể tải danh sách trạm: ${error.message || 'Lỗi không xác định'}`);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const getStatusBadge = (status: Station['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="badge-available">Hoạt động</Badge>;
      case 'maintenance':
        return <Badge variant="destructive">Bảo trì</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Không hoạt động</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hiển thị lỗi */}
          {error && (
            <FadeIn>
              <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-destructive">{error}</p>
                </div>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Thử lại
                </Button>
              </div>
            </FadeIn>
          )}

          <LoadingWrapper
            isLoading={isLoading}
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <VehicleCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            {stations.length > 0 ? (
              <SlideIn direction="bottom" delay={200}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {stations.map((station, index) => (
                    <FadeIn key={station.id} delay={300 + index * 100}>
                      <Card className="card-premium h-full">
                        <CardContent className="p-6 h-full flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold">
                              {station.name}
                            </h3>
                            {getStatusBadge(station.status)}
                          </div>

                          <div className="space-y-3 mb-6 flex-1">
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {station.address}
                                </p>
                                {station.city && (
                                  <p className="text-xs text-muted-foreground">
                                    {station.city}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-primary" />
                              <p className="text-sm">
                                {station.operatingHours.weekday || 
                                 station.operatingHours.weekend || 
                                 "24/7"}
                              </p>
                            </div>

                            {station.fastCharging && (
                              <div className="flex items-center space-x-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                <p className="text-sm">Có sạc nhanh</p>
                              </div>
                            )}

                            <div className="mb-4 min-h-[60px]">
                              <p className="text-sm font-medium mb-2">Tiện ích:</p>
                              {station.amenities.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {station.amenities.slice(0, 3).map((amenity, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                  {station.amenities.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{station.amenities.length - 3} nữa
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  Chỉ có các tiện ích cơ bản
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                  {station.availableVehicles}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Có sẵn
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                  {station.totalVehicles}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Tổng số
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t min-h-[50px] flex items-center">
                              {station.rating > 0 ? (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-sm">Đánh giá:</span>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium">
                                      {station.rating.toFixed(1)}
                                    </span>
                                    <span className="text-yellow-500">★</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({station.reviewCount} đánh giá)
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-sm">Đánh giá:</span>
                                  <span className="text-xs text-muted-foreground">
                                    Chưa có đánh giá
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="pt-4">
                              <Button asChild className="w-full">
                                <Link to={`/stations/${station.id}`}>
                                  Xem chi tiết
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  ))}
                </div>
              </SlideIn>
            ) : !isLoading && !error ? (
              <FadeIn delay={400}>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Không tìm thấy trạm nào
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Hiện tại không có trạm nào khả dụng. Vui lòng kiểm tra lại sau.
                  </p>
                </div>
              </FadeIn>
            ) : null}
          </LoadingWrapper>
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