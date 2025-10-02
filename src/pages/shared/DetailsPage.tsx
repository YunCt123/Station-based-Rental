import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CheckIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../../components/LoadingSpinner';
import NotFound from '../../components/NotFound';
import { getVehicleById, type VehicleData } from '../../data/vehicles';

const DetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRental, setSelectedRental] = useState<'hourly' | 'daily'>('daily');
  const [rentalDuration, setRentalDuration] = useState(1);
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);

  // Simulate API call
  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get vehicle by ID from data source
        if (id) {
          const foundVehicle = getVehicleById(id);
          setVehicle(foundVehicle);
        } else {
          setVehicle(null);
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vehicle) {
    return <NotFound />;
  }

  const getBatteryColor = (level: number) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBatteryBgColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 50) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  const calculateTotal = () => {
    const rate = selectedRental === 'hourly' ? vehicle.hourlyRate : vehicle.dailyRate;
    return rate * rentalDuration;
  };

  const handleBookNow = () => {
    // Logic đặt xe
    console.log('Booking:', {
      vehicleId: vehicle.id,
      rentalType: selectedRental,
      duration: rentalDuration,
      total: calculateTotal()
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header với nút Back và Breadcrumb */}
      <div className="bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-2 stroke-current" />
                Back
              </button>
              
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
                <ChevronRightIcon className="w-4 h-4" />
                <a href="/vehicles" className="hover:text-blue-600 transition-colors">Vehicles</a>
                <ChevronRightIcon className="w-4 h-4 stroke-current" />
                <span className="text-gray-900 font-medium">{vehicle.name}</span>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video">
                  <img
                    src={vehicle.images?.[selectedImage] || vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Thumbnail Images */}
                {vehicle.images && vehicle.images.length > 1 && (
                  <div className="flex space-x-3">
                    {vehicle.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-blue-500 shadow-electric'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${vehicle.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{vehicle.name}</h1>
                  <p className="text-lg text-gray-600">{vehicle.brand} • {vehicle.year} • {vehicle.type}</p>
                </div>
                
                <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <StarSolidIcon key={i} className="w-5 h-5" />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">({vehicle.reviewCount} reviews)</span>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vehicle.status === 'Available'
                      ? 'bg-success-100 text-success-700'
                      : 'bg-warning-100 text-warning-700'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className={`text-2xl font-bold ${getBatteryColor(vehicle.batteryLevel)}`}>
                    {vehicle.batteryLevel}%
                  </div>
                  <div className="text-sm text-gray-600">Battery</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{vehicle.range}km</div>
                  <div className="text-sm text-gray-600">Range</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{vehicle.seats}</div>
                  <div className="text-sm text-gray-600">Seats</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{vehicle.condition}</div>
                  <div className="text-sm text-gray-600">Condition</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
              </div>

              {/* Battery Level Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Battery Level</span>
                  <span className={`text-sm font-medium ${getBatteryColor(vehicle.batteryLevel)}`}>
                    {vehicle.batteryLevel}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${getBatteryBgColor(vehicle.batteryLevel)} transition-all duration-500 ease-out animate-fade-in`}
                    style={{ width: `${vehicle.batteryLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {vehicle.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                      <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 stroke-current" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            {vehicle.specs && Object.keys(vehicle.specs).length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(vehicle.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Book This Vehicle</h3>
              
              {/* Location */}
              <div className="mb-4">
                <div className="flex items-center text-gray-700 mb-2">
                  <MapPinIcon className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="text-gray-700 font-medium">Location</span>
                </div>
                <p className="text-gray-900 font-medium">{vehicle.location}</p>
              </div>

              {/* Rental Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-800 mb-3">Rental Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedRental('hourly')}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedRental === 'hourly'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 text-gray-800'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">${vehicle.hourlyRate}</div>
                    <div className="text-sm text-gray-600">per hour</div>
                  </button>
                  <button
                    onClick={() => setSelectedRental('daily')}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedRental === 'daily'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 text-gray-800'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">${vehicle.dailyRate}</div>
                    <div className="text-sm text-gray-600">per day</div>
                  </button>
                </div>
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Duration ({selectedRental === 'hourly' ? 'hours' : 'days'})
                </label>
                <input
                  type="number"
                  min="1"
                  value={rentalDuration}
                  onChange={(e) => setRentalDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              {/* Total Price */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-lg font-medium text-white">Total</span>
                  <span className="text-2xl font-bold text-white animate-fade-in">${calculateTotal()}</span>
                </div>
                <div className="text-sm text-blue-100 mt-1 relative z-10">
                  {rentalDuration} {selectedRental === 'hourly' ? 'hour(s)' : 'day(s)'} × ${selectedRental === 'hourly' ? vehicle.hourlyRate : vehicle.dailyRate}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookNow}
                disabled={vehicle.status !== 'Available'}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
                  vehicle.status === 'Available'
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 hover:shadow-lg hover:-translate-y-0.5 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {vehicle.status === 'Available' ? 'Book Now' : 'Not Available'}
              </button>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2 stroke-current" />
                    +84 123 456 789
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-2 stroke-current" />
                    support@evstation.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
