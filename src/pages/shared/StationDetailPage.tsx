import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import VehicleCard from "@/components/VehicleCard";
import { LeafletMap } from "@/components/LeafletMap";
import { LoadingWrapper, FadeIn, PageTransition } from "@/components/LoadingComponents";
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
  Wifi,
  Coffee,
  Car,
  Navigation,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const StationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // State for API data
  const [station, setStation] = useState<Station | null>(null);
  const [stationVehicles, setStationVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch station data from API
  useEffect(() => {
    const fetchStationData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🏢 Fetching station data for ID:', id);
        
        // Test connection first
        await stationService.testConnection();
        
        // Fetch station details
        const stationData = await stationService.getStationById(id);
        console.log('📊 Raw station data from API:', stationData);
        console.log('🚗 Initial available vehicles:', stationData.availableVehicles);
        console.log('🚗 Initial total vehicles:', stationData.totalVehicles);
        
        // Fetch real vehicle counts like in Stations.tsx
        try {
          console.log('🔍 Fetching real vehicle counts...');
          
          // Get total vehicle count for station
          const allVehiclesData = await stationService.getStationVehicles(id);
          const realTotalVehicles = allVehiclesData.count;
          console.log('📊 Real total vehicles from API:', realTotalVehicles);
          
          // Get available vehicle count for station
          const availableVehiclesData = await stationService.getStationVehicles(id, 'AVAILABLE');
          const realAvailableVehicles = availableVehiclesData.count;
          console.log('📊 Real available vehicles from API:', realAvailableVehicles);
          
          // Update station data with real counts
          const updatedStationData = {
            ...stationData,
            totalVehicles: realTotalVehicles,
            availableVehicles: realAvailableVehicles
          };
          
          console.log('✅ Updated station data with real counts:', updatedStationData);
          setStation(updatedStationData);
          
        } catch (vehicleError) {
          console.warn('⚠️ Could not fetch real vehicle counts, using backend data:', vehicleError);
          setStation(stationData);
        }
        
      } catch (err: unknown) {
        console.error('❌ Error fetching station:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
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

    fetchStationData();
  }, [id, toast]);

  // Fetch vehicles at this station
  useEffect(() => {
    const fetchStationVehicles = async () => {
      if (!id || !station) return;
      
      try {
        setIsLoadingVehicles(true);
        
        console.log('🚗 Fetching vehicles for station:', id);
        
        // Get available vehicles at this station
        const vehiclesData = await stationService.getStationVehicles(id, 'AVAILABLE');
        setStationVehicles(vehiclesData.vehicles);
        
        console.log('✅ Station vehicles loaded:', vehiclesData.vehicles);
        
      } catch (err: unknown) {
        console.error('❌ Error fetching station vehicles:', err);
        toast({
          title: "Warning",
          description: "Failed to load vehicles at this station",
          variant: "destructive",
        });
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchStationVehicles();
  }, [id, station, toast]);

  // Function to retry loading station data
  const handleRetry = () => {
    window.location.reload();
  };

  // Function to get formatted operating hours
  const getOperatingHoursDisplay = (operatingHours: Station['operatingHours']) => {
    if (!operatingHours) return "Contact station for hours";
    
    if (operatingHours.weekday && operatingHours.weekday === operatingHours.weekend) {
      return operatingHours.weekday;
    }
    
    const parts = [];
    if (operatingHours.weekday) parts.push(`Weekdays: ${operatingHours.weekday}`);
    if (operatingHours.weekend) parts.push(`Weekends: ${operatingHours.weekend}`);
    if (operatingHours.holiday) parts.push(`Holidays: ${operatingHours.holiday}`);
    
    return parts.length > 0 ? parts.join(', ') : "24/7";
  };

  // Loading state
  if (isLoading) {
    return (
      <LoadingWrapper isLoading={true}>
        <div className="min-h-screen bg-background" />
      </LoadingWrapper>
    );
  }

  // Error state
  if (error || !station) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">
            {error ? "Error Loading Station" : t("common.vehicleNotFound")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || "Station not found or may have been removed"}
          </p>
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/stations">{t("nav.stations")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "fast charging":
        return <Zap className="h-4 w-4" />;
      case "cafe":
      case "restaurant":
        return <Coffee className="h-4 w-4" />;
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        {/* <FadeIn>
          <div className="bg-gradient-hero py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-white hover:bg-white/20"
                >
                  <Link to="/stations">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("nav.stations")}
                  </Link>
                </Button>
              </div>
              <SlideIn direction="top" delay={200}>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {station.name}
                </h1>
                <p className="text-xl text-white/90 mb-6 max-w-2xl">
                  {station.address}, {station.city}
                </p>
              </SlideIn>
              <SlideIn direction="top" delay={300}>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <span>Fast Charging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>Premium Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>24/7 Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    <span>{station.availableVehicles} Vehicles Available</span>
                  </div>
                </div>
              </SlideIn>
            </div>
          </div>
        </FadeIn> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Station Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Station Image */}
            <Card>
              <img
                src={station.image || "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop&crop=center"}
                alt={station.name}
                className="w-full h-64 object-cover rounded-t-lg"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop&crop=center";
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
                        {station.address}, {station.city}
                      </p>
                    </div>
                  </div>
{/* 
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">{t("common.rating")}</p>
                      <p className="text-sm text-muted-foreground">
                        {station.rating.toFixed(1)} ★ ({station.reviewCount} {t("common.reviews")})
                      </p>
                    </div>
                  </div> */}

                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {t("common.availableVehicles")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {station.availableVehicles}/{station.totalVehicles} vehicles
                      </p>
                    </div>
                  </div>

                  {/* <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Charging Type</p>
                      <p className="text-sm text-muted-foreground">
                        {station.fastCharging
                          ? "Fast Charging Available"
                          : "Standard Charging"}
                      </p>
                    </div>
                  </div> */}
                </div>

                <Separator />

                {/* Operating Hours */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Operating Hours
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getOperatingHoursDisplay(station.operatingHours)}
                  </p>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h3 className="font-medium mb-3">
                    {t("common.whatsIncluded")}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {station.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
                        <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
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

          {/* Sidebar */}
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
                {/* Availability Status */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Available Now</span>
                    <Badge variant="default" className="bg-green-600">
                      {station.availableVehicles} Vehicles
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    {station.totalVehicles} total vehicles at this station
                  </div>
                </div>

                {/* Operating Status */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Operating Hours</span>
                  </div>
                  <Badge
                    variant={
                      getOperatingHoursDisplay(station.operatingHours).includes("24/7")
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {getOperatingHoursDisplay(station.operatingHours).includes("24/7") 
                      ? "24/7" 
                      : "Limited Hours"}
                  </Badge>
                </div>

                {/* Charging Type */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Charging</span>
                  </div>
                  <Badge variant={station.fastCharging ? "default" : "secondary"} className="text-xs">
                    {station.fastCharging ? "Fast Charging" : "Standard"}
                  </Badge>
                </div>

                {/* Rating */}
                {station.rating > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{station.rating.toFixed(1)}</span>
                      <span className="text-yellow-500">★</span>
                      <span className="text-xs text-gray-500">({station.reviewCount})</span>
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
                {/* Primary Action - Book Now */}
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

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}`;
                      window.open(directionsUrl, '_blank');
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
                  <LeafletMap
                    station={{
                      id: station.id,
                      name: station.name,
                      address: station.address,
                      city: station.city,
                      coordinates: station.coordinates,
                      availableVehicles: station.availableVehicles
                    }}
                    height="280px"
                    showControls={true}
                    showNearbyStations={true}
                  />
                </div>
                {/* Address below map */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{station.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {station.address}, {station.city}
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

export default StationDetails;
