// src/pages/shared/StationDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    StarIcon,
    MapPinIcon,
    ClockIcon,
    BoltIcon,
    CheckCircleIcon,
    ChevronRightIcon,
    PhoneIcon,
    ShareIcon
} from '@heroicons/react/24/solid';
import { stations, type Station } from '../../data/stations';
import { SAMPLE_VEHICLES, type VehicleData } from '../../data/vehicles';
import VehicleCard from '../../components/VehicleCard';
import { NotFoundPage } from '.';
import { ArrowLeftIcon, BuildingStorefrontIcon, CreditCardIcon, InboxIcon, InformationCircleIcon, SparklesIcon, UsersIcon, WifiIcon } from '@heroicons/react/24/outline';
import StationMap from '../../components/StationMap';

const AmenityIcon: React.FC<{ amenity: string }> = ({ amenity }) => {
    const iconClass = "w-5 h-5 mr-3 text-gray-500";
    switch (amenity.toLowerCase()) {
        case '24/7 access': return <ClockIcon className={iconClass} />;
        case 'fast charging': return <BoltIcon className={iconClass} />;
        case 'restroom': return <UsersIcon className={iconClass} />;
        case 'cafe': return <SparklesIcon className={iconClass} />;
        case 'parking': return <InformationCircleIcon className={iconClass} />;
        case 'shopping mall': return <BuildingStorefrontIcon className={iconClass} />;
        case 'restaurant': return <SparklesIcon className={iconClass} />;
        case 'atm': return <CreditCardIcon className={iconClass} />;
        case 'wifi': return <WifiIcon className={iconClass} />;
        default: return <InboxIcon className={iconClass} />;
    }
};

const StationDetailPage: React.FC = () => {
    const { stationId } = useParams<{ stationId: string }>();
    const [station, setStation] = useState<Station | null>(null);
    const [availableVehicles, setAvailableVehicles] = useState<VehicleData[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        const currentStation = stations.find(s => s.id === stationId);
        if (currentStation) {
            setStation(currentStation);
            const vehiclesAtStation = SAMPLE_VEHICLES.filter(v => v.location === currentStation.name);
            setAvailableVehicles(vehiclesAtStation);
        } else {
            setStation(null);
        }
    }, [stationId]);

    if (!station) {
        return <NotFoundPage />;
    }

    const isInactive = station.status === 'inactive';

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* === Header & Breadcrumb (MỚI) === */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)} // Dùng navigate(-1) để quay lại trang trước đó
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Stations
                    </button>
                    <nav className="flex items-center text-sm text-gray-500">
                        <Link to="/stations" className="hover:underline">Stations</Link>
                        <ChevronRightIcon className="w-4 h-4 mx-2" />
                        <span className="font-medium text-gray-700">{station.name}</span>
                    </nav>
                    <h1 className="text-4xl font-bold text-gray-900 mt-2">{station.name}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* === Cột trái - Thông tin chi tiết === */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Overview Card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <img src={station.image} alt={station.name} className="w-full h-64 object-cover" />
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Station Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                                    <div className="flex items-center"><MapPinIcon className="w-5 h-5 mr-3 text-gray-400" /> {station.address}</div>
                                    <div className="flex items-center"><ClockIcon className="w-5 h-5 mr-3 text-gray-400" /> {station.operatingHours}</div>
                                    <div className="flex items-center"><StarIcon className="w-5 h-5 mr-3 text-yellow-400" /> {station.rating} stars rating</div>
                                    {/* <div className="flex items-center">
                    {station.fastCharging ? <BoltIcon className="w-5 h-5 mr-3 text-yellow-500" /> : <BoltIcon className="w-5 h-5 mr-3 text-gray-300" />}
                    {station.fastCharging ? 'Fast Charging Available' : 'Standard Charging'}
                  </div> */}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">What's Included</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {station.amenities.map((amenity) => (
                                    <div key={amenity} className="flex items-center">
                                        <AmenityIcon amenity={amenity} />
                                        <span className="text-gray-700">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Card (MỚI) */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Location</h2>
                            {/* Thay thế div placeholder bằng component bản đồ */}
                            <StationMap station={station} />
                        </div>

                        {/* Available Vehicles */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Vehicles</h2>
                            {availableVehicles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {availableVehicles.map(vehicle => (
                                        <VehicleCard key={vehicle.id} vehicle={vehicle} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicles Available</h3>
                                    <p className="text-gray-600">Please check back later or browse other stations.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* === Cột phải - Tóm tắt & Hành động === */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-8">

                            {/* Thẻ tóm tắt */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <ul className="space-y-4 text-gray-700">
                                    <li className="flex justify-between items-center">
                                        <span className="font-medium flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />Status</span>
                                        <span className={`font-bold ${isInactive ? 'text-red-600' : 'text-green-600'}`}>{isInactive ? 'Inactive' : 'Active'}</span>
                                    </li>
                                    <li className="flex justify-between items-center border-t pt-4">
                                        <span className="font-medium text-lg">Vehicles</span>
                                        <span className="font-bold text-lg text-blue-600">{station.availableVehicles} / {station.totalSlots}</span>
                                    </li>
                                </ul>
                                <div className="mt-6">
                                    <Link to="/vehicles" className="w-full">
                                        <button
                                            className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                                            disabled={isInactive || station.availableVehicles === 0}
                                        >
                                            {isInactive ? 'Station Closed' : (station.availableVehicles === 0 ? 'No Vehicles Available' : 'Book a Vehicle Now')}
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Actions (MỚI) */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                                        <MapPinIcon className="w-5 h-5 mr-2" /> Get Directions
                                    </button>
                                    <button className="w-full flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                                        <PhoneIcon className="w-5 h-5 mr-2" /> Contact Station
                                    </button>
                                    <button className="w-full flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                                        <ShareIcon className="w-5 h-5 mr-2" /> Share
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StationDetailPage;