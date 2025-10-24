import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Zap, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { stationService, type Station } from "@/services/stationService";
import {
  PageTransition,
  FadeIn,
  SlideIn,
  LoadingWrapper,
} from "@/components/LoadingComponents";
import { VehicleCardSkeleton } from "@/components/ui/skeleton";

const Stations = () => {
  const { t } = useTranslation();
  
  // State for stations data
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stations from API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setError(null);
        setIsLoading(true);
        
        console.log('🏢 Fetching stations from API...');
        
        // Test connection first
        await stationService.testConnection();
        console.log('🔗 Station API connection OK');
        
        // Get active stations
        const response = await stationService.getActiveStations({}, {
          limit: 50,
          sort: 'name'
        });
        
        console.log('✅ Fetched stations:', response.stations);
        
        // Fetch real vehicle counts for each station
        const stationsWithRealCounts = await Promise.all(
          response.stations.map(async (station) => {
            try {
              // Get total vehicle count for station
              const allVehiclesData = await stationService.getStationVehicles(station.id);
              const totalVehicles = allVehiclesData.count;
              
              // Get available vehicle count for station
              const availableVehiclesData = await stationService.getStationVehicles(station.id, 'AVAILABLE');
              const availableVehicles = availableVehiclesData.count;
              
              console.log(`📊 Station ${station.name}: ${availableVehicles}/${totalVehicles} vehicles`);
              
              return {
                ...station,
                totalVehicles,
                availableVehicles
              };
            } catch (vehicleError) {
              console.warn(`⚠️ Could not fetch vehicles for station ${station.name}:`, vehicleError);
              // Fallback to backend metrics or default values
              return {
                ...station,
                totalVehicles: station.totalVehicles || 0,
                availableVehicles: station.availableVehicles || 0
              };
            }
          })
        );
        
        setStations(stationsWithRealCounts);
        
      } catch (error: any) {
        console.error('❌ Error fetching stations:', error);
        setError(`Failed to load stations: ${error.message || 'Unknown error'}`);
        setStations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  const getStatusBadge = (status: Station['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="badge-available">{t("common.active")}</Badge>;
      case 'maintenance':
        return <Badge variant="destructive">Maintenance</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        {/* <FadeIn> */}
          <div className="bg-gradient-hero py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <SlideIn direction="top" delay={100}>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Our Station Locations
                </h1>
              </SlideIn>
              <SlideIn direction="top" delay={200}>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Find convenient pickup and drop-off locations throughout the
                  city
                </p>
              </SlideIn>
            </div>
          </div>
        {/* </FadeIn> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Error Display */}
          {error && (
            <FadeIn>
              <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-destructive">{error}</p>
                </div>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </FadeIn>
          )}

          <LoadingWrapper
            isLoading={isLoading}
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <VehicleCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            {stations.length > 0 ? (
              <SlideIn direction="bottom" delay={200}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {stations.map((station, index) => (
                    <FadeIn key={station.id} delay={300 + index * 100}>
                      <Card className="card-premium h-full">
                        <CardContent className="p-6 h-full flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold">
                              {station.name}
                            </h3>
                            {getStatusBadge(station.status)}
                          </div>

                          <div className="space-y-3 mb-6 flex-1">
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {station.address}
                                </p>
                                {station.city && (
                                  <p className="text-xs text-muted-foreground">
                                    {station.city}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-primary" />
                              <p className="text-sm">
                                {station.operatingHours.weekday || 
                                 station.operatingHours.weekend || 
                                 "24/7"}
                              </p>
                            </div>

                            {station.fastCharging && (
                              <div className="flex items-center space-x-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                <p className="text-sm">Fast Charging Available</p>
                              </div>
                            )}

                            {/* Amenities - Always show section with minimum height */}
                            <div className="mb-4 min-h-[60px]">
                              <p className="text-sm font-medium mb-2">Amenities:</p>
                              {station.amenities.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {station.amenities.slice(0, 3).map((amenity, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                  {station.amenities.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{station.amenities.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  Basic facilities available
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                  {station.availableVehicles}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Available
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                  {station.totalVehicles}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Total
                                </div>
                              </div>
                            </div>

                            {/* Rating - Always show section with minimum height */}
                            <div className="pt-4 border-t min-h-[50px] flex items-center">
                              {station.rating > 0 ? (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-sm">Rating:</span>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium">
                                      {station.rating.toFixed(1)}
                                    </span>
                                    <span className="text-yellow-500">★</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({station.reviewCount} reviews)
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-sm">Rating:</span>
                                  <span className="text-xs text-muted-foreground">
                                    No reviews yet
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="pt-4">
                              <Button asChild className="w-full">
                                <Link to={`/stations/${station.id}`}>
                                  {t("common.viewDetails")}
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  ))}
                </div>
              </SlideIn>
            ) : !isLoading && !error ? (
              <FadeIn delay={400}>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-xl font-semibold mb-2">
                    No stations found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    No stations are currently available. Please check back later.
                  </p>
                </div>
              </FadeIn>
            ) : null}
          </LoadingWrapper>

          {/* {stations.length > 0 && (
            <FadeIn delay={500}>
              <div className="mt-12 text-center">
                <Card className="inline-block">
                  <CardContent className="p-6">
                    <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t("common.moreVehicles")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("common.moreVehicles")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          )} */}
        </div>
      </div>
    </PageTransition>
  );
};

export default Stations;
