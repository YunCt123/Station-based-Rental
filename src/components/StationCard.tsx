// src/components/StationCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/Progress';
import { LocateIcon, MapPin, Star, Zap } from 'lucide-react'; // THÊM MỚI: Star, Zap

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
    distance?: number;
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
    <div className="border rounded-2xl overflow-hidden shadow-xl transition-transform duration-300 ease-in-out hover:scale-[1.04] hover:shadow-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 flex flex-col h-full">
      <Link to={`/stations/${station.id}`} className="h-full flex flex-col">
        {/* Phần hình ảnh */}
        <div className="relative w-full h-48">
          <img
            src={station.imageUrl}
            alt={station.name}
            className="w-full h-full object-cover rounded-t-2xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('via.placeholder.com')) {
                target.src = 'https://via.placeholder.com/400x300?text=EV+Station';
              }
            }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
          {/* Badge số xe nổi bật */}
          <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-slate-200 text-slate-700">
            <span className="text-primary">{station.availableCount}</span>
            <span className="mx-1 text-slate-400">/</span>
            <span>{station.totalCount} xe</span>
          </div>
          {station.distance !== undefined && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-semibold shadow flex items-center gap-1">
              <LocateIcon className="w-3 h-3" />
              ~ {station.distance.toFixed(1)} km
            </div>
          )}
        </div>


        {/* Phần nội dung text */}
        <div className="p-5 flex flex-col flex-grow gap-2">
          {/* Tên trạm */}
          <h3 className="text-xl font-bold text-gray-900 truncate mb-2" title={station.name}>
            {station.name}
          </h3>

          {/* === KHU VỰC MỚI: RATING VÀ SẠC NHANH === */}
          <div className="flex justify-between items-center mb-2 text-base">
            {/* Rating */}
            {station.rating && station.rating > 0 ? (
              <div className="flex items-center gap-1 text-yellow-600">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{station.rating.toFixed(1)}</span>
              </div>
            ) : (
              // Hiển thị nếu chưa có rating
              <div className="flex items-center gap-1 text-gray-400">
                <Star className="w-5 h-5" />
                <span className="text-xs">Chưa có</span>
              </div>
            )}

            {/* Sạc nhanh: Chỉ hiển thị nếu fastCharging = true */}
            {station.fastCharging && (
              <div className="flex items-center gap-1 text-blue-600 font-semibold">
                <Zap className="w-5 h-5 fill-blue-600" />
                <span className="text-sm">Sạc nhanh</span>
              </div>
            )}
          </div>
          {/* === KẾT THÚC KHU VỰC MỚI === */}

          {/* Địa chỉ */}
          <div className="flex items-start gap-2 text-gray-500 mb-4 h-12">
            <MapPin className="w-5 h-5 mt-1 shrink-0 text-primary" />
            <p className="text-base leading-relaxed line-clamp-2" title={station.address}>
              {station.address}
            </p>
          </div>

          {/* Thanh tiến trình (Availability) - đẩy xuống dưới cùng */}
          <div className="mt-auto">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <span>Số xe có sẵn</span>
              <span className="font-bold text-primary">
                {station.availableCount} / {station.totalCount}
              </span>
            </div>
            <Progress value={availablePercentage} className="h-2 rounded-full bg-slate-200" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default StationCard;