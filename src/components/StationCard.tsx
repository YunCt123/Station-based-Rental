import { Card, Badge } from "flowbite-react";
import { FaMapMarkerAlt, FaClock, FaCar } from "react-icons/fa";
import { Link } from "react-router-dom";
import type { Station } from "../data/stations";

interface StationCardProps {
    station: Station;
}

const StationCard = ({ station }: StationCardProps) => {
    const isInactive = station.status === 'inactive';
    const isFull = station.availableVehicles === 0;

    const buttonBaseClasses = "w-full text-center font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-4";
    const activeButtonClasses = "text-white bg-gradient-to-br from-blue-600 to-green-500 hover:bg-gradient-to-bl focus:ring-blue-300 dark:focus:ring-blue-800";
    const disabledButtonClasses = "text-gray-900 bg-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400";

    return (
        <Card
            className="w-full h-full shadow-md hover:shadow-lg transition-shadow duration-300"
            imgAlt={`Image of ${station.name}`}
            imgSrc={station.image}
        >
            <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {station.name}
                        </h5>
                        <Badge color={isInactive ? "failure" : "success"} className="ml-2 whitespace-nowrap">
                            {isInactive ? "Inactive" : "Active"}
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
                            <div className={`flex items-center justify-center font-bold text-lg ${isFull ? 'text-red-500' : 'text-cyan-600'}`}>
                                <FaCar className="mr-2" />
                                <span>{station.availableVehicles}/{station.totalSlots}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Available Vehicles</p>
                        </div>
                        {/* <div>
                            <div className={`flex items-center justify-center font-bold text-lg ${station.fastCharging ? 'text-yellow-400' : 'text-gray-400'}`}>
                                <FaBolt className="mr-1" />
                                <span>{station.fastCharging ? "Fast" : "Standard"}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Charging</p>
                        </div> */}
                    </div>
                </div>
                <Link
                    to={`/stations/${station.id}`}
                    className={`${buttonBaseClasses} ${isInactive ? disabledButtonClasses : activeButtonClasses}`}
                    // Ngăn click nếu nút bị vô hiệu hóa
                    onClick={(e) => { if (isInactive) e.preventDefault(); }}
                    aria-disabled={isInactive}
                >
                    {isInactive ? 'Station Unavailable' : 'View Details'}
                </Link>
            </div>
        </Card>
    );
};

export default StationCard;