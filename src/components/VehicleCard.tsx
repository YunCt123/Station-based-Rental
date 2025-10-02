import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, BoltIcon, UserGroupIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { TruckIcon } from '@heroicons/react/24/solid';
import { type VehicleData } from '../data/vehicles';

interface VehicleCardProps {
  vehicle: VehicleData;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const navigate = useNavigate();
  const {
    id,
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    navigate(`/vehicle/${id}`);
  };

  const getBatteryColor = (level: number) => {
    if (level >= 80) return 'text-battery-high';
    if (level >= 50) return 'text-battery-medium';
    return 'text-battery-low';
  };

  const getConditionColor = (condition: string) => {
    return condition === 'Excellent' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50';
  };

  const getMaintenanceColor = (status: string) => {
    return status === 'Available' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50';
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 group"
      onClick={handleCardClick}
    >
      {/* Status badges */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {status}
          </span>
        </div>
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-1">
          <span className="text-yellow-400">★</span>
          <span className="text-sm font-medium text-white">
            {rating} ({reviewCount})
          </span>
        </div>
        
        {/* Click indicator */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:to-success-500/10 transition-all duration-300"></div>
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <EyeIcon className="w-4 h-4 text-blue-600 stroke-current" />
          </div>
        </div>
        
        {/* Vehicle image */}
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400">
              <TruckIcon className="w-16 h-16" />
            </div>
          )}
        </div>
      </div>

      {/* Vehicle info */}
      <div className="p-6">
        {/* Vehicle name and details */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{name}</h3>
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
                className={`h-full ${batteryLevel >= 80 ? 'bg-green-500' : batteryLevel >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                style={{ width: `${batteryLevel}%` }}
              />
            </div>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <BoltIcon className="w-4 h-4 mr-1 stroke-current" />
            {range} km range
          </div>
        </div>

        {/* Seats and location */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <UserGroupIcon className="w-4 h-4 mr-1 stroke-current" />
            {seats} Seats
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPinIcon className="w-4 h-4 mr-1 stroke-current" />
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
              ${hourlyRate} <span className="text-sm font-normal text-muted-foreground">/hour</span>
            </div>
            <div className="text-sm text-muted-foreground">
              ${dailyRate}/day
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link 
            to={`/vehicle/${vehicle.id}`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
          >
            View Details
          </Link>
          <button 
            className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
            disabled={status !== 'Available'}
          >
            <ClockIcon className="w-4 h-4 mr-2 stroke-current" />
            {status === 'Available' ? 'Book Now' : 'Not Available'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
