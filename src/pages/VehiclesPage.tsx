import React, { useState, useEffect } from 'react';
import VehicleCard, { type VehicleData } from '../components/VehicleCard';

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // Sample vehicle data
  useEffect(() => {
    const sampleVehicles: VehicleData[] = [
      {
        id: '1',
        name: 'VinFast VF8',
        brand: 'VinFast',
        year: 2023,
        type: 'SUV',
        rating: 4.8,
        reviewCount: 124,
        batteryLevel: 90,
        range: 420,
        seats: 5,
        location: 'District 1 Station',
        hourlyRate: 15,
        dailyRate: 120,
        status: 'Available',
        condition: 'Excellent',
        image: 'https://icar.vn/wp-content/uploads/2024/01/top-5-xe-o-to-dien-co-muc-gia-tot-nhat-2023-800x417.jpg'
      },
      {
        id: '2',
        name: 'Tesla Model 3',
        brand: 'Tesla',
        year: 2022,
        type: 'Sedan',
        rating: 4.9,
        reviewCount: 256,
        batteryLevel: 85,
        range: 358,
        seats: 5,
        location: 'District 7 Station',
        hourlyRate: 18,
        dailyRate: 150,
        status: 'Available',
        condition: 'Good',
        image: 'https://image.cnbcfm.com/api/v1/image/107078949-1657894537349-tesla_model_3_2022_02.jpg?v=1657894579&w=1920&h=1080'
      },
      {
        id: '3',
        name: 'Hyundai Kona Electric',
        brand: 'Hyundai',
        year: 2023,
        type: 'Crossover',
        rating: 4.6,
        reviewCount: 89,
        batteryLevel: 78,
        range: 305,
        seats: 5,
        location: 'Binh Thanh Station',
        hourlyRate: 12,
        dailyRate: 90,
        status: 'Available',
        condition: 'Good',
        image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?ixlib=rb-4.0.3&w=800'
      },
      {
        id: '4',
        name: 'BMW iX3',
        brand: 'BMW',
        year: 2023,
        type: 'SUV',
        rating: 4.7,
        reviewCount: 156,
        batteryLevel: 92,
        range: 460,
        seats: 5,
        location: 'District 3 Station',
        hourlyRate: 22,
        dailyRate: 180,
        status: 'Available',
        condition: 'Excellent',
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&w=800'
      },
      {
        id: '5',
        name: 'Audi e-tron GT',
        brand: 'Audi',
        year: 2023,
        type: 'Sedan',
        rating: 4.9,
        reviewCount: 203,
        batteryLevel: 65,
        range: 488,
        seats: 4,
        location: 'Airport Station',
        hourlyRate: 35,
        dailyRate: 280,
        status: 'Maintenance Due',
        condition: 'Excellent',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&w=800'
      },
      {
        id: '6',
        name: 'Nissan Leaf',
        brand: 'Nissan',
        year: 2022,
        type: 'Hatchback',
        rating: 4.4,
        reviewCount: 97,
        batteryLevel: 88,
        range: 270,
        seats: 5,
        location: 'District 1 Station',
        hourlyRate: 10,
        dailyRate: 75,
        status: 'Available',
        condition: 'Good',
        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&w=800'
      },
      {
        id: '7',
        name: 'Mercedes EQS',
        brand: 'Mercedes',
        year: 2023,
        type: 'Sedan',
        rating: 4.8,
        reviewCount: 189,
        batteryLevel: 94,
        range: 516,
        seats: 5,
        location: 'District 7 Station',
        hourlyRate: 30,
        dailyRate: 240,
        status: 'Available',
        condition: 'Excellent',
        image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&w=800'
      },
      {
        id: '8',
        name: 'Polestar 2',
        brand: 'Polestar',
        year: 2023,
        type: 'Sedan',
        rating: 4.5,
        reviewCount: 132,
        batteryLevel: 81,
        range: 402,
        seats: 5,
        location: 'Airport Station',
        hourlyRate: 20,
        dailyRate: 160,
        status: 'Available',
        condition: 'Good',
        image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-4.0.3&w=800'
      }
    ];
    
    setVehicles(sampleVehicles);
    setFilteredVehicles(sampleVehicles);
  }, []);

  // Filter and sort vehicles
  useEffect(() => {
    let filtered = vehicles.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'All' || vehicle.type === selectedType;
      const matchesBrand = selectedBrand === 'All' || vehicle.brand === selectedBrand;
      const matchesLocation = selectedLocation === 'All' || vehicle.location === selectedLocation;
      
      return matchesSearch && matchesType && matchesBrand && matchesLocation;
    });

    // Sort vehicles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.hourlyRate - b.hourlyRate;
        case 'price-high':
          return b.hourlyRate - a.hourlyRate;
        case 'rating':
          return b.rating - a.rating;
        case 'battery':
          return b.batteryLevel - a.batteryLevel;
        case 'range':
          return b.range - a.range;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, selectedType, selectedBrand, selectedLocation, sortBy]);

  const brands = ['All', ...Array.from(new Set(vehicles.map(v => v.brand)))];
  const types = ['All', ...Array.from(new Set(vehicles.map(v => v.type)))];
  const locations = ['All', ...Array.from(new Set(vehicles.map(v => v.location)))];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Electric Vehicle Fleet
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Discover our premium collection of electric vehicles. From compact city cars to luxury SUVs, 
              find the perfect EV for your journey.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Vehicles
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="battery">Battery Level</option>
                <option value="range">Range</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredVehicles.length} of {vehicles.length} vehicles
            </p>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>

        {/* No Results */}
        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75V7.242a6.75 6.75 0 00-6.75-6.75h-2.5A2.25 2.25 0 003.5 2.742v6.75M15 9.75h4.5a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25h-6.75A2.25 2.25 0 0110.5 18.5v-2.25a2.25 2.25 0 012.25-2.25h2.25V15" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}

        {/* Load More Button */}
        {filteredVehicles.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
              Load More Vehicles
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclesPage;