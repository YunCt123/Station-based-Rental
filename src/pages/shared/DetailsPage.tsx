import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRightIcon,
  CheckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../../components/LoadingSpinner";
import NotFound from "../../components/NotFound";
import { vehicleService } from "../../services/vehicleService";
import type { Vehicle } from "@/types/vehicle";

const DetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // const navigate = useNavigate();
  const [selectedRental, setSelectedRental] = useState<"hourly" | "daily">(
    "daily"
  );
  const [rentalDuration, setRentalDuration] = useState(1);
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicle from API
  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const vehicleData = await vehicleService.getVehicleById(id);
          setVehicle(vehicleData);
        } else {
          setVehicle(null);
        }
      } catch (err) {
        console.error("Error fetching vehicle:", err);
        setError("Failed to load vehicle details");
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">Error Loading Vehicle</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return <NotFound />;
  }

  const getBatteryColor = (level: number) => {
    if (level >= 80) return "text-green-600";
    if (level >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getBatteryBgColor = (level: number) => {
    if (level >= 80) return "bg-green-500";
    if (level >= 50) return "bg-yellow-400";
    return "bg-red-500";
  };

  const calculateTotal = () => {
    const rate =
      selectedRental === "hourly" ? vehicle.pricePerHour : vehicle.pricePerDay;
    return rate * rentalDuration;
  };

  const handleBookNow = () => {
    // Logic đặt xe
    console.log("Booking:", {
      vehicleId: vehicle.id,
      rentalType: selectedRental,
      duration: rentalDuration,
      total: calculateTotal(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header với nút Back và Breadcrumb */}
      <div className="bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Home
                </Link>
                <ChevronRightIcon className="w-4 h-4" />
                <Link
                  to="/vehicles"
                  className="hover:text-blue-600 transition-colors"
                >
                  Vehicles
                </Link>
                <ChevronRightIcon className="w-4 h-4 stroke-current" />
                <span className="text-gray-900 font-medium">
                  {vehicle.name}
                </span>
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
{/* Vehicle Card */}
<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
  {/* Main Image */}
  <div className="relative rounded-xl overflow-hidden aspect-video mb-6 bg-gray-100">
    <img
      src={vehicle.image}
      alt={vehicle.name}
      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
    />
  </div>

  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
        {vehicle.name}
      </h1>

      {/* Details */}
      <div className="mt-4 divide-y divide-gray-200 text-gray-700">
        {[
          { label: "Brand", value: vehicle.brand },
          { label: "Year", value: vehicle.year },
          { label: "Type", value: vehicle.type },
        ].map((item) => (
          <div
            key={item.label}
            className="flex justify-between items-center py-1"
          >
            <span className="text-sm font-medium text-gray-500">
              {item.label}
            </span>
            <span className="text-lg font-semibold text-gray-800">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Rating */}
    <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-[#F9FAFB] px-3 py-2 rounded-xl shadow-inner">
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <StarSolidIcon key={i} className="w-5 h-5" />
        ))}
      </div>
      <span className="text-gray-600 text-sm">
        ({vehicle.reviewCount} reviews)
      </span>
    </div>
  </div>

  {/* Quick Stats */}
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
    {[
      { label: "Battery", value: `${vehicle.batteryLevel}%`, color: getBatteryColor(vehicle.batteryLevel) },
      { label: "Range", value: `${vehicle.range} km`, color: "text-blue-700" },
      { label: "Seats", value: vehicle.seats, color: "text-gray-800" },
      { label: "Condition", value: vehicle.condition, color: "text-green-700" },
    ].map((stat) => (
      <div
        key={stat.label}
        className="text-center p-4 bg-[#F9FAFB] rounded-xl border border-gray-100"
      >
        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
        <div className="text-sm text-gray-500">{stat.label}</div>
      </div>
    ))}
  </div>

  {/* Description */}
  <div className="mb-8">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      Description
    </h3>
    <p className="text-gray-600 leading-relaxed">
      {vehicle.description}
    </p>
  </div>

  {/* Battery Indicator */}
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">
        Battery Level
      </span>
      <span
        className={`text-sm font-semibold ${getBatteryColor(
          vehicle.batteryLevel
        )}`}
      >
        {vehicle.batteryLevel}%
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className={`h-3 rounded-full ${getBatteryBgColor(
          vehicle.batteryLevel
        )} transition-all duration-500 ease-out`}
        style={{ width: `${vehicle.batteryLevel}%` }}
      />
    </div>
  </div>
</div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Features & Amenities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {vehicle.features.map((feature: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 stroke-current" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications - Not available in current Vehicle interface
            {vehicle.specs && Object.keys(vehicle.specs).length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(vehicle.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            */}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Book This Vehicle
              </h3>

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
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  Rental Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedRental("hourly")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedRental === "hourly"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-300 text-gray-800"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">
                      ${vehicle.pricePerHour}
                    </div>
                    <div className="text-sm text-gray-600">per hour</div>
                  </button>
                  <button
                    onClick={() => setSelectedRental("daily")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedRental === "daily"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-300 text-gray-800"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">
                      ${vehicle.pricePerDay}
                    </div>
                    <div className="text-sm text-gray-600">per day</div>
                  </button>
                </div>
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Duration ({selectedRental === "hourly" ? "hours" : "days"})
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
              <div className="mb-6 p-4 bg-[#1E3A8A] text-white rounded-xl shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-lg font-medium text-white">Total</span>
                  <span className="text-2xl font-bold text-white animate-fade-in">
                    ${calculateTotal()}
                  </span>
                </div>
                <div className="text-sm text-blue-100 mt-1 relative z-10">
                  {rentalDuration}{" "}
                  {selectedRental === "hourly" ? "hour(s)" : "day(s)"} × $
                  {selectedRental === "hourly"
                    ? vehicle.pricePerHour
                    : vehicle.pricePerDay}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookNow}
                disabled={vehicle.availability !== "available"}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
                  vehicle.availability === "available"
                    ? "bg-[#1E3A8A] hover:bg-[#1D4ED8] hover:shadow-lg hover:-translate-y-0.5 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {vehicle.availability === "available"
                  ? "Book Now"
                  : "Not Available"}
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
