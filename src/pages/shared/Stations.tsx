// src/pages/shared/Stations.tsx

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { stations, type Station } from '../../data/stations';
import StationCard from '../../components/StationCard';

const StationsPage: React.FC = () => {
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  
  // State cho các bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // Load dữ liệu ban đầu
  useEffect(() => {
    setAllStations(stations);
  }, []);

  // Áp dụng bộ lọc và sắp xếp
  useEffect(() => {
    let result = allStations.filter(station => {
      const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            station.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity === 'All' || station.city === selectedCity;
      const matchesStatus = selectedStatus === 'All' || station.status === selectedStatus;
      
      return matchesSearch && matchesCity && matchesStatus;
    });

    // Sắp xếp
    result.sort((a, b) => {
      switch (sortBy) {
        case 'availability':
          return b.availableVehicles - a.availableVehicles;
        case 'rating':
          return b.rating - a.rating;
        default: // 'name'
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredStations(result);
  }, [allStations, searchTerm, selectedCity, selectedStatus, sortBy]);

  const cities = ['All', ...Array.from(new Set(allStations.map(s => s.city)))];
  const statuses = ['All', 'active', 'inactive'];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Station Network
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Find a convenient rental station near you.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Stations</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="availability">Availability: High to Low</option>
                <option value="rating">Rating: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600 mb-6">
          Showing {filteredStations.length} of {allStations.length} stations
        </p>

        {/* Station Grid */}
        {filteredStations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ComputerDesktopIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stations found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationsPage;