// src/components/StationCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/Progress';
import { MapPin, BatteryCharging, Star, Zap } from 'lucide-react'; // THÊM MỚI: Star, Zap

// Định nghĩa props cho component
interface StationCardProps {
  station: {
    id: string;
    name: string;
    address: string;
    imageUrl: string;
    availableCount: number;
    totalCount: number;
    rating?: number; // THÊM MỚI: Prop cho rating
    fastCharging?: boolean; // THÊM MỚI: Prop cho sạc nhanh
  };
}

/**
 * Component hiển thị thông tin tóm tắt của một trạm.
 * Được sử dụng trong trang danh sách trạm (StationsPage).
 */
const StationCard: React.FC<StationCardProps> = ({ station }) => {
  // Tính toán phần trăm số xe có sẵn
  const availablePercentage =
    station.totalCount > 0
      ? (station.availableCount / station.totalCount) * 100
      : 0;

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ease-in-out hover:scale-[1.03] hover:shadow-xl flex flex-col h-full">
      <Link to={`/stations/${station.id}`} className="block h-full flex flex-col">
        {/* Phần hình ảnh */}
        <div className="relative w-full h-48">
          <img
            src={station.imageUrl}
            alt={station.name}
            className="w-full h-full object-cover"
            // Thêm fallback nếu ảnh lỗi
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Ngăn lặp vô hạn
              target.src = 'https://via.placeholder.com/400x300?text=EV+Station';
            }}
          />
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md text-xs font-semibold shadow">
            {station.availableCount} / {station.totalCount} xe
          </div>
        </div>

        {/* Phần nội dung text */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Tên trạm */}
          <h3 className="text-lg font-semibold text-gray-800 truncate mb-2" title={station.name}>
            {station.name}
          </h3>

          {/* === KHU VỰC MỚI: RATING VÀ SẠC NHANH === */}
          <div className="flex justify-between items-center mb-2 text-sm">
            {/* Rating */}
            {station.rating && station.rating > 0 ? (
              <div className="flex items-center gap-1 text-gray-700">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{station.rating.toFixed(1)}</span>
              </div>
            ) : (
              // Hiển thị nếu chưa có rating
              <div className="flex items-center gap-1 text-gray-400">
                <Star className="w-4 h-4" />
                <span className="text-xs">Chưa có</span>
              </div>
            )}
            
            {/* Sạc nhanh: Chỉ hiển thị nếu fastCharging = true */}
            {station.fastCharging && (
              <div className="flex items-center gap-1 text-blue-600 font-medium">
                <Zap className="w-4 h-4 fill-blue-600" />
                <span className="text-sm">Sạc nhanh</span>
              </div>
            )}
          </div>
          {/* === KẾT THÚC KHU VỰC MỚI === */}

          {/* Địa chỉ */}
          <div className="flex items-start gap-2 text-gray-500 mb-4 h-10">
            <MapPin className="w-4 h-4 mt-1 shrink-0" />
            <p className="text-sm leading-relaxed line-clamp-2" title={station.address}>
              {station.address}
            </p>
          </div>

          {/* Thanh tiến trình (Availability) - đẩy xuống dưới cùng */}
          <div className="mt-auto">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
              <span>Số xe có sẵn</span>
              <span className="font-semibold">
                {station.availableCount} / {station.totalCount}
              </span>
            </div>
            <Progress value={availablePercentage} className="h-2" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default StationCard;