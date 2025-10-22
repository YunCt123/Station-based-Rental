// GoogleMaps.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  MapPin,
  Navigation,
  Star,
  Clock,
  Zap,
  Car,
  Plus,
  Minus,
  Eye,
} from "lucide-react";

import type { Station } from "@/services/stationService";
import { stationService } from "@/services/stationService";
import type { Vehicle } from "@/types/vehicle";

import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/lib/currency";

interface GoogleMapsProps {
  selectedStation?: string;
  onStationSelect: (stationId: string) => void;
  height?: string;
  showControls?: boolean;
  showLegend?: boolean;
  showInfo?: boolean;
}

export const GoogleMaps = ({
  selectedStation,
  onStationSelect,
  height = "500px",
  showControls = true,
  showLegend = true,
  showInfo = true,
}: GoogleMapsProps) => {
  const [zoom, setZoom] = useState(12);
  const [selectedMarker, setSelectedMarker] = useState<Station | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [stationVehicles, setStationVehicles] = useState<
    Record<string, Vehicle[]>
  >({});
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  // Load stations data
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const response = await stationService.getActiveStations();
        setStations(response.stations);
      } catch (error) {
        console.error("Error loading stations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  const handleStationClick = async (station: Station) => {
    setSelectedMarker(station);
    onStationSelect(station.id);

    // Load vehicles for this station if not already loaded
    if (!stationVehicles[station.id]) {
      try {
        const vehicleData = await stationService.getStationVehicles(
          station.id,
          "AVAILABLE"
        );
        setStationVehicles((prev) => ({
          ...prev,
          [station.id]: vehicleData.vehicles,
        }));
      } catch (error) {
        console.error("Error loading station vehicles:", error);
      }
    }
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDetails(true);
  };

  const getStationVehicles = (stationId: string): Vehicle[] =>
    stationVehicles[stationId] || [];

  return (
    <div
      className="relative w-full bg-gray-100 rounded-lg overflow-hidden border"
      style={{ height }}
    >
      {/* Loading state */}
      {loading ? (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading stations...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Mock Google Maps Container */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
            {/* Map Controls */}
            {showControls && (
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white shadow-md"
                  onClick={() => setZoom((z) => Math.min(z + 1, 18))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white shadow-md"
                  onClick={() => setZoom((z) => Math.max(z - 1, 8))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Mock Street Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
              {/* Horizontal streets */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={`${i * 80}px`}
                  x2="100%"
                  y2={`${i * 80}px`}
                  stroke="#666"
                  strokeWidth="1"
                />
              ))}
              {/* Vertical streets */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <line
                  key={`v-${i}`}
                  x1={`${i * 120}px`}
                  y1="0"
                  x2={`${i * 120}px`}
                  y2="100%"
                  stroke="#666"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Station Markers */}
            {stations.map((station) => {
              const isSelected =
                selectedStation === station.id ||
                selectedMarker?.id === station.id;
              const currentStationVehicles = getStationVehicles(station.id);

              // Mock positioning based on coordinates (simplified for demo)
              const x = (station.coordinates.lng - 106.6) * 2000 + 100;
              const y = (10.85 - station.coordinates.lat) * 3000 + 50;

              return (
                <div
                  key={station.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}px`, top: `${y}px` }}
                  onClick={() => handleStationClick(station)}
                >
                  {/* Station Marker */}
                  <div className={`relative ${isSelected ? "z-20" : "z-10"}`}>
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-lg ${
                        station.availableVehicles > 0
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      } ${
                        isSelected
                          ? "ring-4 ring-blue-300 scale-110"
                          : "hover:scale-105"
                      } transition-all duration-200`}
                    >
                      <Car className="h-6 w-6 text-white" />
                    </div>

                    {/* Available vehicles count */}
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                      {station.availableVehicles}
                    </div>

                    {/* Station Info Popup */}
                    {selectedMarker?.id === station.id && (
                      <Card className="absolute top-14 left-1/2 transform -translate-x-1/2 w-80 p-4 shadow-xl z-30 bg-white">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {station.name}
                              </h3>
                              <p className="text-gray-600 text-sm flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {station.address}
                              </p>
                            </div>
                            <Badge
                              variant={
                                station.fastCharging ? "default" : "secondary"
                              }
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              {station.fastCharging
                                ? "Fast Charging"
                                : "Standard"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              {Number(station.rating).toFixed(1)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {station.operatingHours?.weekday || "24/7"}
                            </div>
                            <div className="flex items-center gap-1">
                              <Car className="h-4 w-4 text-green-600" />
                              {station.availableVehicles}/{station.totalSlots}
                            </div>
                          </div>

                          {currentStationVehicles.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                {t("common.availableVehicles")}
                              </h4>
                              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                {currentStationVehicles
                                  .slice(0, 4)
                                  .map((vehicle) => (
                                    <div
                                      key={vehicle.id}
                                      className="text-xs p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                                      onClick={() => handleVehicleClick(vehicle)}
                                    >
                                      <div className="font-medium">
                                        {vehicle.name}
                                      </div>
                                      <div className="text-gray-600">
                                        {formatPrice(vehicle.pricePerHour)}/
                                        {t("common.hour")}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              {currentStationVehicles.length > 4 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  +
                                  {currentStationVehicles.length - 4}{" "}
                                  {t("common.moreVehicles")}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1">
                              <Navigation className="h-4 w-4 mr-1" />
                              {t("common.directions")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              asChild
                            >
                              <Link to={`/stations/${station.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                {t("common.viewDetails")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Mock Current Location */}
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg pulse-animation">
                <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Map Legend */}
            {showLegend && (
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
                <h4 className="font-medium text-sm mb-2">
                  {t("common.directions")}
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                    <span>{t("common.availableVehicles")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full" />
                    <span>{t("common.noVehiclesFound")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full" />
                    <span>{t("common.location")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Map Info */}
            {showInfo && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3">
                <h4 className="font-medium text-sm mb-1">Ho Chi Minh City</h4>
                <p className="text-xs text-gray-600">
                  {stations.reduce(
                    (acc, station) => acc + station.availableVehicles,
                    0
                  )}{" "}
                  Available Vehicles
                </p>
                <p className="text-xs text-gray-600">
                  {stations.length} Stations
                </p>
              </div>
            )}
          </div>

          {/* Vehicle Details Popup */}
          {showVehicleDetails && selectedVehicle && (
            <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 p-4 shadow-xl z-40 bg-white">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedVehicle.name}
                    </h3>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedVehicle.location}
                    </p>
                  </div>
                  <Badge
                    variant={
                      selectedVehicle.availability === "available"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {t(`common.${selectedVehicle.availability}`)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    {selectedVehicle.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedVehicle.trips} {t("common.trips")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-green-600" />
                    {selectedVehicle.range}km
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(selectedVehicle.pricePerHour)}
                    <span className="text-sm font-normal text-gray-500">
                      /{t("common.hour")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPrice(selectedVehicle.pricePerDay)}/
                    {t("common.day")}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link to={`/vehicles/${selectedVehicle.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      {t("common.viewDetails")}
                    </Link>
                  </Button>

                  {selectedVehicle.availability === "available" && (
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link to={`/book/${selectedVehicle.id}`}>
                        <Clock className="h-4 w-4 mr-1" />
                        {t("common.bookNow")}
                      </Link>
                    </Button>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowVehicleDetails(false)}
                >
                  {t("common.close")}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};