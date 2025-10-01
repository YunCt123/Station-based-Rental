import React from 'react';
import VehicleCard, { type VehicleData } from '../components/VehicleCard';

const Content: React.FC = () => {
  // Sample vehicle data based on the images provided
  const vehicles: VehicleData[] = [
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
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpSQ8KpTVl9htCScZSyM2DFaRNT6xJa-ztcw&s'
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
      image: 'https://hips.hearstapps.com/hmg-prod/images/2025-tesla-model-s-1-672d42e172407.jpg?crop=0.465xw:0.466xh;0.285xw,0.361xh&resize=1200:*'
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
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNyrp3zcrC6guFk7dOha9hw1pv__nylrwM3Q&s'
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
      image: '/api/placeholder/400/300'
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
      image: '/api/placeholder/400/300'
    }
  ];

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
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Types</option>
              <option>SUV</option>
              <option>Sedan</option>
              <option>Crossover</option>
              <option>Hatchback</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Brands</option>
              <option>Tesla</option>
              <option>VinFast</option>
              <option>BMW</option>
              <option>Audi</option>
              <option>Hyundai</option>
              <option>Nissan</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Locations</option>
              <option>District 1 Station</option>
              <option>District 7 Station</option>
              <option>District 3 Station</option>
              <option>Airport Station</option>
              <option>Binh Thanh Station</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
              <option>Battery Level</option>
              <option>Range</option>
            </select>
          </div>
        </div>

        {/* Vehicle grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>

        {/* Load more button */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
            Load More Vehicles
          </button>
        </div>

        {/* Quick stats */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Electric Vehicles</div>
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
              <div className="text-3xl font-bold text-orange-600 mb-2">4.9</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
