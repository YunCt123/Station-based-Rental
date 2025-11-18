/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Badge } from "flowbite-react";
import { FaMapMarkerAlt, FaClock, FaCar } from "react-icons/fa";
import { Link } from "react-router-dom";
import type { Station } from "../data/stations";

import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/Progress';
import { LocateIcon, MapPin, Star, Zap } from 'lucide-react'; // THÊM MỚI: Star, Zap

// Định nghĩa props cho component
interface StationCardProps {
  station: Station;
}

const StationCard = ({ station }: StationCardProps) => {
  const isInactive = station.status === "inactive";
  const isFull = station.availableVehicles === 0;

  const statusText = isInactive ? "Không hoạt động" : "Đang hoạt động";
  const statusColor: any = isInactive ? "failure" : "success";

  const buttonBaseClasses =
    "w-full text-center font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-4";
  const activeButtonClasses =
    "text-white bg-gradient-to-br from-blue-600 to-green-500 hover:bg-gradient-to-bl focus:ring-blue-300 dark:focus:ring-blue-800";
  const disabledButtonClasses =
    "text-gray-900 bg-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400";

  return (
    <Card
      className="w-full h-full shadow-md hover:shadow-lg transition-shadow duration-300"
      imgAlt={`Hình ảnh của ${station.name}`}
      imgSrc={station.image}
    >
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          {/* Header: Title + Badge */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {station.name}
            </h5>

            <Badge
              color={statusColor}
              className="
                flex-shrink-0 inline-flex items-center justify-center
                whitespace-nowrap
                px-3 py-1 text-xs sm:text-sm font-semibold
                min-w-[120px]   /* đảm bảo đủ chỗ cho 'Không hoạt động' */
            "
            >
              {statusText}
            </Badge>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <FaMapMarkerAlt className="mr-2 flex-shrink-0" /> {station.address}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <FaClock className="mr-2 flex-shrink-0" /> {station.operatingHours}
          </div>

          <div className="grid grid-cols-1 gap-4 text-center border-t dark:border-gray-700 pt-4 mb-4">
            <div>
              <div
                className={`flex items-center justify-center font-bold text-lg ${
                  isFull ? "text-red-500" : "text-cyan-600"
                }`}
              >
                <FaCar className="mr-2" />
                <span>
                  {station.availableVehicles}/{station.totalSlots}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Phương tiện khả dụng
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/stations/${station.id}`}
          className={`${buttonBaseClasses} ${
            isInactive ? disabledButtonClasses : activeButtonClasses
          }`}
          onClick={(e) => {
            if (isInactive) e.preventDefault();
          }}
          aria-disabled={isInactive}
        >
          {isInactive ? "Trạm không khả dụng" : "Xem chi tiết"}
        </Link>
      </div>
    </Card>
  );
};

export default StationCard;