/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import VehicleCard from "@/components/VehicleCard";
import { VehicleCardSkeleton } from "@/components/ui/skeleton";
import {
  LoadingWrapper,
  PageTransition,
  FadeIn,
  SlideIn,
  SearchLoader,
  FilterLoader,
} from "@/components/LoadingComponents";
import {
  EnhancedSearch,
  ActiveFilters,
  type SearchSuggestion,
} from "@/components/EnhancedSearch";
import { vehicleService } from "@/services/vehicleService";
import type { Vehicle, VehicleSearchFilters } from "@/types/vehicle";
import { Grid, List, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import HeroCarousel from "@/components/HeroCarousel";

const Vehicles = () => {
  const { t, language } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for vehicles data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [currentPage, _setCurrentPage] = useState(1);

  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [locationFilter, setLocationFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");

  // Locations state - will be populated from API
  const [locations, setLocations] = useState<string[]>([]);

  // Handle URL parameters on component mount
  useEffect(() => {
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const vehicleType = searchParams.get("vehicleType");
    const availability = searchParams.get("availability");
    const priceRangeParam = searchParams.get("priceRange");
    const date = searchParams.get("date");
    const time = searchParams.get("time");

    // Handle search term - could come from "search" or "location" parameter
    if (search && search.trim() !== "") {
      setSearchTerm(search.trim());
    } else if (location && location.trim() !== "" && location !== "all") {
      // If no search param but location is set and not "all", use location as search term
      setSearchTerm(location.trim());
    }

    // Keep location filter as "all" by default, regardless of search location
    // This allows users to see vehicles from all locations but filtered by search term
    // The location filter will only be changed when user manually selects a different location

    if (vehicleType && vehicleType.trim() !== "") {
      setVehicleTypeFilter(vehicleType.trim());
    }

    if (availability && availability.trim() !== "") {
      setAvailabilityFilter(availability.trim());
    }

    const sortByParam = searchParams.get("sortBy");
    if (sortByParam) {
      setSortBy(sortByParam);
    }

    if (priceRangeParam) {
      // Handle price range from URL
      switch (priceRangeParam) {
        case "under50":
          setPriceRange([0, 50]);
          break;
        case "50-100":
          setPriceRange([50, 100]);
          break;
        case "over100":
          setPriceRange([100, 200]);
          break;
      }
    }

    // Store date and time for potential future use (booking, etc.)
    if (date && date.trim() !== "") {
      console.log("Selected date:", date.trim());
    }
    if (time && time.trim() !== "") {
      console.log("Selected time:", time.trim());
    }
  }, [searchParams]);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch vehicles from API
  const fetchVehicles = useCallback(async () => {
    try {
      setIsError(null);

      const filters: VehicleSearchFilters = {
        // Remove status filter to get vehicles with all statuses
      };

      // Add search filters
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      if (locationFilter !== "all") {
        // Use city filter for location-based filtering
        filters.city = locationFilter;
      }

      if (vehicleTypeFilter !== "all") {
        filters.type = vehicleTypeFilter;
      }

      // Add price range filters
      if (language === "vi") {
        // Convert VND to USD approximation for API
        filters.minPrice = priceRange[0] * 23000;
        filters.maxPrice = priceRange[1] * 23000;
      } else {
        filters.minPrice = 0;
        filters.maxPrice = 10000000;
      }

      // Map frontend sort to backend sort
      let sortOption = "";
      switch (sortBy) {
        case "price-low":
          sortOption = "pricePerHour";
          break;
        case "price-high":
          sortOption = "-pricePerHour";
          break;
        case "rating":
          sortOption = "-rating";
          break;
        case "range":
          sortOption = "-range";
          break;
        default:
          sortOption = "name";
      }

      // console.log("📡 Calling vehicleService.searchVehicles with:", {
      //   filters,
      //   options: { limit: 50, page: currentPage, sort: sortOption },
      // });

      const response = await vehicleService.searchVehicles(filters, {
        limit: 20, // Get more vehicles for better filtering
        page: currentPage,
        sort: sortOption,
      });

      setVehicles(response.vehicles);
      setTotalVehicles(response.meta?.total || response.vehicles.length);

      // Extract unique locations from vehicles for filter
      const uniqueLocations = [
        ...new Set(response.vehicles.map((v) => v.location)),
      ];
      setLocations(uniqueLocations);
    } catch (error) {
      // console.error("❌ Error fetching vehicles:", error);
      setIsError("Failed to load vehicles. Please try again.");
      setVehicles([]);
    }
  }, [
    searchTerm,
    locationFilter,
    vehicleTypeFilter,
    priceRange,
    sortBy,
    currentPage,
    language,
  ]);

  // Initial data fetch
  useEffect(() => {
    // Test connection first
    vehicleService
      .testConnection()
      .then(() => {
        fetchVehicles();
      })
      .catch((error) => {
        setIsError(
          `Backend connection failed: ${error.message || "Unknown error"}`
        );
      });
  }, [fetchVehicles]);

  // Fetch vehicles when filters change
  useEffect(() => {
    if (!isInitialLoading) {
      fetchVehicles();
    }
  }, [fetchVehicles, isInitialLoading]);

  // Update URL parameters when filters change
  const updateSearchParams = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    setSearchParams(newSearchParams);
  };

  // Handle search input with loading simulation
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsSearching(true);

    // Simulate search delay
    setTimeout(() => {
      updateSearchParams("search", value);
      setIsSearching(false);
    }, 300);
  };

  // Handle filter changes with loading simulation
  const handleFilterChange = (key: string, value: string) => {
    setIsFiltering(true);

    // Update local state immediately
    switch (key) {
      case "location":
        setLocationFilter(value);
        break;
      case "availability":
        setAvailabilityFilter(value);
        break;
      case "vehicleType":
        setVehicleTypeFilter(value);
        break;
      case "sortBy":
        setSortBy(value);
        break;
    }

    // Simulate filter delay
    setTimeout(() => {
      updateSearchParams(key, value);
      setIsFiltering(false);
    }, 200);
  };

  // Filter and sort vehicles (now mostly handled by API, but keep for client-side refinement)
  const filteredVehicles = useMemo(() => {
    let filtered = [...vehicles];

    // Additional client-side filtering if needed
    if (locationFilter !== "all") {
      filtered = filtered.filter(
        (vehicle) => vehicle.location === locationFilter
      );
    }

    if (availabilityFilter !== "all") {
      filtered = filtered.filter(
        (vehicle) => vehicle.availability === availabilityFilter
      );
    }

    // Additional vehicle type filtering (in case backend filtering didn't work)
    if (vehicleTypeFilter !== "all") {
      filtered = filtered.filter(
        (vehicle) => vehicle.type === vehicleTypeFilter
      );
    }

    // Note: Search and price filtering are now handled by API
    // but we keep this structure for any additional client-side refinement

    return filtered;
  }, [vehicles, locationFilter, availabilityFilter, vehicleTypeFilter]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
       <HeroCarousel
      heightClass="h-[420px] md:h-[520px]"
      autoplayMs={3000}
      slides={[
        {
          image:
            "https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw174b57d5/images/PDP/vf9/202406/hero.webp",
          title: "Khám phá các phương tiện của chúng tôi",
          subtitle: "Tìm phương tiện phù hợp với bạn",
          ctaText: "Xem tất cả phương tiện",
          ctaHref: "/vehicles",
          align: "center",
        },
        {
          image:
            "https://cdn.tienphong.vn/images/a6bf4f60924201126af6849ca45a3980b039b2e68480d2da6589e6ff9ba548c624bbdbb2416fe89d78f7f83417d8c92791c395aaa9493e5cdaf349cad3d4a15e/vf9-9117.jpg",
          title: "Ưu đãi xe điện",
          subtitle: "Đặt ngay hôm nay để nhận ưu đãi đặc biệt",
          ctaText: "Đặt ngay",
          ctaHref: "/deals",
          align: "left",
        },
        {
          image:
            "https://static.automotor.vn/images/upload/2024/05/08/vinfast-vf3-vneconomtautomotive3.jpg",
          title: "An toàn là trên hết",
          subtitle: "Tìm hiểu thêm về các tính năng an toàn của chúng tôi",
          ctaText: "Tìm hiểu thêm",
          ctaHref: "/safety",
          align: "right",
        },
      ]}
    />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Enhanced Search */}
              <div className="flex-1">
                <EnhancedSearch
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onSuggestionSelect={(suggestion: SearchSuggestion) => {
                    if (suggestion.type === "location") {
                      setLocationFilter(suggestion.value);
                    }
                  }}
                  placeholder="Tìm kiếm phương tiện"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2">
                <Select
                  value={locationFilter}
                  onValueChange={(value) => {
                    setLocationFilter(value);
                    updateSearchParams("location", value);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tất cả địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả địa điểm</SelectItem>
                    {locations.map((location) => (
                      <SelectItem
                        key={String(location)}
                        value={String(location)}
                      >
                        {String(location)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={availabilityFilter}
                  onValueChange={(value) => {
                    setAvailabilityFilter(value);
                    updateSearchParams("availability", value);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tình trạng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="available">Có sẵn</SelectItem>
                    <SelectItem value="rented">Đã thuê</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Bộ lọc
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            <ActiveFilters
              filters={[
                ...(searchTerm
                  ? [
                      {
                        key: "search",
                        label: `Tìm kiếm: ${searchTerm}`,
                        onRemove: () => handleSearchChange(""),
                      },
                    ]
                  : []),
                ...(locationFilter !== "all"
                  ? [
                      {
                        key: "location",
                        label: `Địa điểm: ${locationFilter}`,
                        onRemove: () => handleFilterChange("location", "all"),
                      },
                    ]
                  : []),
                ...(availabilityFilter !== "all"
                  ? [
                      {
                        key: "availability",
                        label: `Trạng thái: ${availabilityFilter}`,
                        onRemove: () =>
                          handleFilterChange("availability", "all"),
                      },
                    ]
                  : []),
                ...(vehicleTypeFilter !== "all"
                  ? [
                      {
                        key: "vehicleType",
                        label: `Loại: ${vehicleTypeFilter}`,
                        onRemove: () =>
                          handleFilterChange("vehicleType", "all"),
                      },
                    ]
                  : []),
                ...(sortBy !== "name"
                  ? [
                      {
                        key: "sortBy",
                        label: `Sắp xếp: ${sortBy}`,
                        onRemove: () => handleFilterChange("sortBy", "name"),
                      },
                    ]
                  : []),
              ]}
              onClearAll={() => {
                handleSearchChange("");
                handleFilterChange("location", "all");
                handleFilterChange("availability", "all");
                handleFilterChange("vehicleType", "all");
                handleFilterChange("sortBy", "name");
              }}
            />

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Khoảng giá: {language === "vi" ? "₫" : "$"}
                      {priceRange[0]}
                      {language === "vi" ? "k" : ""} -{" "}
                      {language === "vi" ? "₫" : "$"}
                      {priceRange[1]}
                      {language === "vi" ? "k" : ""}/giờ
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={language === "vi" ? 1000 : 50}
                      min={0}
                      step={language === "vi" ? 10 : 1}
                      className="w-full"
                    />
                  </div>

                  {/* Vehicle Type Filter */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Loại phương tiện
                    </label>
                    <Select
                      value={vehicleTypeFilter}
                      onValueChange={(value) => {
                        setVehicleTypeFilter(value);
                        updateSearchParams("vehicleType", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Sedan">Sedan</SelectItem>
                        <SelectItem value="Hatchback">Hatchback</SelectItem>
                        <SelectItem value="Crossover">Crossover</SelectItem>
                        <SelectItem value="Scooter">Xe tay ga</SelectItem>
                        <SelectItem value="Motorcycle">Xe máy</SelectItem>
                        <SelectItem value="Bike">Xe đạp</SelectItem>
                        <SelectItem value="Van">Xe van</SelectItem>
                        <SelectItem value="Bus">Xe buýt</SelectItem>
                        <SelectItem value="Truck">Xe tải</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Sắp xếp theo
                    </label>
                    <Select
                      value={sortBy}
                      onValueChange={(value) => {
                        setSortBy(value);
                        updateSearchParams("sortBy", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Tên (A-Z)</SelectItem>
                        <SelectItem value="price-low">
                          Giá thấp đến cao
                        </SelectItem>
                        <SelectItem value="price-high">
                          Giá cao đến thấp
                        </SelectItem>
                        <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                        <SelectItem value="range">Phạm vi xa nhất</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View Mode */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Chế độ xem
                    </label>
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        onClick={() => setViewMode("grid")}
                        className="rounded-none flex-1"
                        size="sm"
                      >
                        <Grid className="h-4 w-4 mr-2" />
                        Lưới
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        onClick={() => setViewMode("list")}
                        className="rounded-none flex-1"
                        size="sm"
                      >
                        <List className="h-4 w-4 mr-2" />
                        Danh sách
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Phương tiện có sẵn</h2>
              <p className="text-muted-foreground">
                {filteredVehicles.length} phương tiện được tìm thấy
                {totalVehicles > filteredVehicles.length && (
                  <span className="text-sm"> (trong tổng số {totalVehicles})</span>
                )}
              </p>
            </div>
          </div>

          {/* Error Display */}
          {isError && (
            <FadeIn>
              <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-4 mb-6">
                <p className="text-destructive">{isError}</p>
                <Button
                  onClick={() => fetchVehicles()}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Thử lại
                </Button>
              </div>
            </FadeIn>
          )}

          {/* Vehicle Grid/List */}
          <LoadingWrapper
            isLoading={isInitialLoading}
            fallback={
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <VehicleCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            {/* Search Loading Indicator */}
            {isSearching && <SearchLoader />}

            {/* Filter Loading Indicator */}
            {isFiltering && <FilterLoader />}

            {filteredVehicles.length > 0 ? (
              <SlideIn direction="bottom" delay={300}>
                <div
                  className={`grid gap-8 ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredVehicles.map((vehicle, index) => (
                    <FadeIn key={vehicle.id} delay={index * 100}>
                      <VehicleCard
                        vehicle={vehicle}
                        className={viewMode === "list" ? "flex-row" : ""}
                      />
                    </FadeIn>
                  ))}
                </div>
              </SlideIn>
            ) : !isInitialLoading && !isError ? (
              <FadeIn delay={400}>
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">
                    Không tìm thấy phương tiện nào
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setLocationFilter("all");
                      setAvailabilityFilter("all");
                      setPriceRange([0, 50]);
                      setVehicleTypeFilter("all");
                      setSortBy("name");
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </FadeIn>
            ) : null}
          </LoadingWrapper>
        </div>
      </div>
    </PageTransition>
  );
};

export default Vehicles;
