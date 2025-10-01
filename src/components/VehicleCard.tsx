import React from 'react';

export interface VehicleData {
  id: string;
  name: string;
  brand: string;
  year: number;
  type: string;
  rating: number;
  reviewCount: number;
  batteryLevel: number;
  range: number;
  seats: number;
  location: string;
  hourlyRate: number;
  dailyRate: number;
  status: 'Available' | 'Maintenance Due';
  condition: 'Excellent' | 'Good';
  image: string;
}

interface VehicleCardProps {
  vehicle: VehicleData;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const {
    name,
    brand,
    year,
    type,
    rating,
    reviewCount,
    batteryLevel,
    range,
    seats,
    location,
    hourlyRate,
    dailyRate,
    status,
    condition,
    image
  } = vehicle;

  const getBatteryColor = (level: number) => {
    if (level >= 80) return 'text-green-500';
    if (level >= 50) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getConditionColor = (condition: string) => {
    return condition === 'Excellent' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50';
  };

  const getMaintenanceColor = (status: string) => {
    return status === 'Available' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Status badges */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {status}
          </span>
        </div>
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-1">
          <span className="text-yellow-400">★</span>
          <span className="text-sm font-medium text-gray-700">
            {rating} ({reviewCount})
          </span>
        </div>
        
        {/* Vehicle image */}6
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle info */}
      <div className="p-6">
        {/* Vehicle name and details */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
            <p className="text-gray-600 text-sm">
              {year} • {brand} • {type}
            </p>
          </div>
        </div>

        {/* Battery and range */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <span className={`font-medium ${getBatteryColor(batteryLevel)}`}>
              {batteryLevel}%
            </span>
            <div className="w-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${batteryLevel >= 80 ? 'bg-green-500' : batteryLevel >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                style={{ width: `${batteryLevel}%` }}
              />
            </div>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {range} km range
          </div>
        </div>

        {/* Seats and location */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {seats} Seats
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(condition)}`}>
            ✓ {condition}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceColor(status)}`}>
            🔧 {status}
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              ${hourlyRate} <span className="text-sm font-normal text-gray-500">/hour</span>
            </div>
            <div className="text-sm text-gray-500">
              ${dailyRate}/day
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200">
            View Details
          </button>
          <button 
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            disabled={status !== 'Available'}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;