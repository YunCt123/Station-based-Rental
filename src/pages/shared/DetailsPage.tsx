import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        setError("Không thể tải thông tin chi tiết của xe");
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
          <h3 className="text-xl font-semibold mb-2">Lỗi khi tải thông tin xe</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thử lại
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

  const handleBookNow = () => {
    navigate(`/booking/${vehicle.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Trang chủ
                </Link>
                <ChevronRightIcon className="w-4 h-4" />
                <Link
                  to="/vehicles"
                  className="hover:text-blue-600 transition-colors"
                >
                  Danh sách xe
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
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="relative rounded-xl overflow-hidden aspect-video mb-6 bg-gray-100">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {vehicle.name}
                  </h1>

                  <div className="mt-4 divide-y divide-gray-200 text-gray-700">
                    {[
                      { label: "Hãng", value: vehicle.brand },
                      { label: "Năm sản xuất", value: vehicle.year },
                      { label: "Loại xe", value: vehicle.type },
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

                <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-[#F9FAFB] px-3 py-2 rounded-xl shadow-inner">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <StarSolidIcon key={i} className="w-5 h-5" />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">
                    ({vehicle.reviewCount} đánh giá)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Pin", value: `${vehicle.batteryLevel}%`, color: getBatteryColor(vehicle.batteryLevel) },
                  { label: "Quãng đường", value: `${vehicle.range} km`, color: "text-blue-700" },
                  { label: "Số ghế", value: vehicle.seats, color: "text-gray-800" },
                  { label: "Tình trạng", value: vehicle.condition, color: "text-green-700" },
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

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Mô tả
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {vehicle.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Mức pin
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

            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Tính năng & Tiện ích
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
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Đặt xe này
              </h3>

              <div className="mb-4">
                <div className="flex items-center text-gray-700 mb-2">
                  <MapPinIcon className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="text-gray-700 font-medium">Địa điểm</span>
                </div>
                <p className="text-gray-900 font-medium">{vehicle.location}</p>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Giá thuê</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Theo giờ:</span>
                    <span className="font-semibold text-gray-900">{vehicle.pricePerHour.toLocaleString("vn-VN")}đ/giờ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Theo ngày:</span>
                    <span className="font-semibold text-gray-900">{vehicle.pricePerDay.toLocaleString("vn-VN")}đ/ngày</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-center">
                  <h4 className="font-medium text-blue-900 mb-1">Đặt ngay để chọn thời gian</h4>
                  <p className="text-sm text-blue-700">Bạn sẽ có thể chọn thời gian và loại thuê ở trang tiếp theo</p>
                </div>
              </div>

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
                  ? "Đặt ngay"
                  : "Không khả dụng"}
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Cần hỗ trợ?</h4>
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
