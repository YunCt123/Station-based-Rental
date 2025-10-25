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
  const [filters, setFilters] = useState<VehicleSearchFilters>({});
  const [sortBy, setSortBy] = useState<string>('');
  const { toast } = useToast();

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🚗 Fetching vehicles from API...');
        
        // Test connection first
        await vehicleService.testConnection();
        
        // Get available vehicles (limit to 6 for homepage display)
        const { vehicles: fetchedVehicles } = await vehicleService.getAvailableVehicles(
          filters,
          { limit: 6, sort: sortBy || undefined }
        );
        
        console.log('✅ Vehicles loaded:', fetchedVehicles.length);
        setVehicles(fetchedVehicles);
        
      } catch (err: unknown) {
        console.error('❌ Error fetching vehicles:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load vehicles';
        setError(errorMessage);
        toast({
          title: "Error",
          description: "Failed to load vehicles. Using fallback data.",
          variant: "destructive",
        });
        
        // Keep vehicles empty on error - we'll show error state
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [filters, sortBy, toast]);

  // Handle filter changes
  const handleFilterChange = (filterKey: keyof VehicleSearchFilters, value: string) => {
    if (value === '' || value === 'all') {
      // Remove filter if empty or "all"
      const newFilters = { ...filters };
      delete newFilters[filterKey];
      setFilters(newFilters);
    } else {
      setFilters(prev => ({ ...prev, [filterKey]: value }));
    }
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value === 'default' ? '' : value);
  };

  return (  
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Available Electric Vehicles
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our premium fleet of electric vehicles. All vehicles are regularly maintained and charged for your convenience.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center space-x-4 mb-4 md:mb-0">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleFilterChange('type', e.target.value)}
              defaultValue=""
            >
              <option value="">All Types</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Crossover">Crossover</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Scooter">Scooter</option>
            </select>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              defaultValue=""
            >
              <option value="">All Brands</option>
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
              <option value="">All Locations</option>
              <option value="District 1">District 1 Station</option>
              <option value="District 7">District 7 Station</option>
              <option value="District 3">District 3 Station</option>
              <option value="Airport">Airport Station</option>
              <option value="Binh Thanh">Binh Thanh Station</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleSortChange(e.target.value)}
              defaultValue="default"
            >
              <option value="default">Default</option>
              <option value="pricePerHour">Price: Low to High</option>
              <option value="-pricePerHour">Price: High to Low</option>
              <option value="-rating">Rating</option>
              <option value="-batteryLevel">Battery Level</option>
              <option value="-range">Range</option>
            </select>
          </div>
        </div>

        {/* Vehicle grid with loading and error states */}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Vehicles</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vehicles Found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </LoadingWrapper>

        {/* Load more button - only show if we have vehicles and not in error state */}
        {!error && vehicles.length > 0 && (
          <div className="text-center mt-12">
            <button 
              onClick={() => {
                // Navigate to vehicles page for more options
                window.location.href = '/vehicles';
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              View All Vehicles
            </button>
          </div>
        )}

        {/* Quick stats */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {isLoading ? '...' : `${vehicles.length}+`}
              </div>
              <div className="text-gray-600">Available Now</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">8</div>
              <div className="text-gray-600">Charging Stations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 mb-2">95%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
