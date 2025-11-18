/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import VehicleCard from "@/components/VehicleCard";
import { LeafletMap } from "@/components/LeafletMap";
import {
  LoadingWrapper,
  FadeIn,
  PageTransition,
} from "@/components/LoadingComponents";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";
import { stationService, type Station } from "@/services/stationService";
import type { Vehicle } from "@/types/vehicle";
import {
  MapPin,
  Clock,
  Star,
  Zap,
  Phone,
  Car,
  Navigation,
  RefreshCw,
} from "lucide-react";

// Helper: hiển thị giờ hoạt động
const getOperatingHoursDisplay = (operatingHours: any): string => {
  if (!operatingHours) return "24/7";
  if (typeof operatingHours === "string") return operatingHours;
  if (operatingHours.is24h) return "24/7";
  if (operatingHours.open && operatingHours.close) {
    return `${operatingHours.open} - ${operatingHours.close}`;
  }
  return "24/7";
};

const StationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { toast } = useToast();

  // State
  const [station, setStation] = useState<Station | null>(null);
  const [stationVehicles, setStationVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Station ID not found.");
      setIsLoading(false);
      setIsLoadingVehicles(false);
      setStation(null);
      setStationVehicles([]);
      return;
    }

    const fetchStationData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("🏢 Fetching station data for ID:", id);

        // Test connection (nếu BE có route test)
        try {
          await stationService.testConnection();
        } catch (testErr) {
          console.warn("⚠️ Station testConnection failed:", testErr);
        }

        // Lấy thông tin station
        const stationData = await stationService.getStationById(id);
        console.log("📊 Raw station data from API:", stationData);

        // Thử lấy lại số lượng xe thật từ API
        try {
          console.log("🔍 Fetching real vehicle counts...");
          const allVehiclesData = await stationService.getStationVehicles(id);
          const realTotalVehicles = allVehiclesData.count;

          const availableVehiclesData = await stationService.getStationVehicles(
            id,
            "AVAILABLE"
          );
          const realAvailableVehicles = availableVehiclesData.count;

          const updatedStationData: Station = {
            ...stationData,
            totalVehicles: realTotalVehicles,
            availableVehicles: realAvailableVehicles,
          };

          console.log("✅ Updated station data with real counts:", updatedStationData);
          setStation(updatedStationData);
        } catch (vehicleError) {
          console.warn(
            "⚠️ Could not fetch real vehicle counts, using backend data:",
            vehicleError
          );
          setStation(stationData);
        }
      } catch (err: unknown) {
        console.error("❌ Error fetching station:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to load station details: ${errorMessage}`);
        toast({
          title: "Error",
          description: "Failed to load station details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStationVehicles = async () => {
      setIsLoadingVehicles(true);
      setStationVehicles([]);

      try {
        console.log("🚗 Fetching vehicles for station:", id);
        const vehiclesData = await stationService.getStationVehicles(
          id,
          "AVAILABLE"
        );
        setStationVehicles(vehiclesData.vehicles);
        console.log("✅ Station vehicles loaded:", vehiclesData.vehicles);
      } catch (err: unknown) {
        console.error("❌ Error fetching station vehicles:", err);
        toast({
          title: "Warning",
          description: "Failed to load vehicles at this station",
          variant: "destructive",
        });
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchStationData();
    fetchStationVehicles();
  }, [id, toast]);

  // === Loading skeleton ===
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column (Image + Map) */}
          <div className="md:col-span-1 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          {/* Right Column (Info) */}
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
        <Skeleton className="h-10 w-1/4 mt-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden shadow-lg">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // === Error state ===
  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-red-600">
        <p>{error}</p>
        <Link
          to="/stations"
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          Back to station list
        </Link>
      </div>
    );
  }

  // === No station ===
  if (!station) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-gray-500">
        Station information not found.
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              {/* Station Image */}
              <Card>
                <img
                  src={
                    (station as any).image ||
                    "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop&crop=center"
                  }
                  alt={station.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop&crop=center";
                  }}
                />
              </Card>

              {/* Station Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t("common.location")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">
                          {station.address}
                          {station.city ? `, ${station.city}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Rating (nếu có) */}
                    {(station as any).rating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{t("common.rating")}</p>
                          <p className="text-sm text-muted-foreground">
                            {(station as any).rating.toFixed(1)} ★ (
                            {(station as any).reviewCount || 0}{" "}
                            {t("common.reviews")})
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {t("common.availableVehicles")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {station.availableVehicles}/{station.totalVehicles}{" "}
                          vehicles
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Operating Hours */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Operating Hours
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getOperatingHoursDisplay(
                        (station as any).operatingHours
                      )}
                    </p>
                  </div>

                  {(station as any).fastCharging && (
                    <div className="flex items-center gap-1 text-blue-600 font-medium">
                      <Zap className="w-5 h-5 fill-blue-600" />
                      <span>Fast Charging Available</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Vehicles */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("common.availableVehicles")}</CardTitle>
                    {isLoadingVehicles && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Loading vehicles...
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <LoadingWrapper
                    isLoading={isLoadingVehicles}
                    fallback={
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-64 bg-muted rounded-lg animate-pulse"
                          />
                        ))}
                      </div>
                    }
                  >
                    {stationVehicles.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stationVehicles.map((vehicle) => (
                          <FadeIn key={vehicle.id} delay={100}>
                            <VehicleCard vehicle={vehicle} />
                          </FadeIn>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {t("common.noVehiclesFound")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Check back later or try another station
                        </p>
                      </div>
                    )}
                  </LoadingWrapper>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN (Sidebar) */}
            <div className="space-y-6">
              {/* Station Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Station Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Available Now
                      </span>
                      <Badge variant="default" className="bg-green-600">
                        {station.availableVehicles} Vehicles
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      {station.totalVehicles} total vehicles at this station
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Operating Hours</span>
                    </div>
                    <Badge
                      variant={
                        getOperatingHoursDisplay(
                          (station as any).operatingHours
                        ).includes("24/7")
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {getOperatingHoursDisplay(
                        (station as any).operatingHours
                      ).includes("24/7")
                        ? "24/7"
                        : "Limited Hours"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Charging</span>
                    </div>
                    <Badge
                      variant={(station as any).fastCharging ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {(station as any).fastCharging ? "Fast Charging" : "Standard"}
                    </Badge>
                  </div>

                  {(station as any).rating && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {(station as any).rating.toFixed(1)}
                        </span>
                        <span className="text-yellow-500">★</span>
                        <span className="text-xs text-gray-500">
                          ({(station as any).reviewCount || 0})
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("dashboard.quickActions")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {station.availableVehicles > 0 ? (
                    <Button className="w-full" size="lg" asChild>
                      <Link to={`/book?station=${station.id}`}>
                        <Car className="h-4 w-4 mr-2" />
                        Book Vehicle Now
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      <Car className="h-4 w-4 mr-2" />
                      No Vehicles Available
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const coords = (station as any).coordinates;
                        if (coords?.lat && coords?.lng) {
                          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
                          window.open(directionsUrl, "_blank");
                        }
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Directions
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/contact">
                        <Phone className="h-4 w-4 mr-1" />
                        Contact
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Map Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden">
                    {(station as any).coordinates && (
                      <LeafletMap
                        station={{
                          id: station.id,
                          name: station.name,
                          address: station.address,
                          city: (station as any).city,
                          coordinates: (station as any).coordinates,
                          availableVehicles: station.availableVehicles,
                        }}
                        height="280px"
                        showControls={true}
                        showNearbyStations={true}
                      />
                    )}
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">
                      {station.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {station.address}
                      {(station as any).city ? `, ${(station as any).city}` : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default StationDetailPage;