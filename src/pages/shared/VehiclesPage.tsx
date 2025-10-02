import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import VehicleCard from '../../components/VehicleCard';
import { SAMPLE_VEHICLES, type VehicleData } from '../../data/vehicles';

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // Load vehicle data
  useEffect(() => {
    setVehicles(SAMPLE_VEHICLES);
    setFilteredVehicles(SAMPLE_VEHICLES);
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
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400 stroke-current" />
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredVehicles.length} of {vehicles.length} vehicles
              </p>
              <p className="text-sm text-gray-500 hidden sm:block">
                💡 Click on any vehicle to view details
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="animate-fade-in">
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <ComputerDesktopIcon className="w-16 h-16 text-gray-400 mx-auto mb-4 stroke-current" />
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
