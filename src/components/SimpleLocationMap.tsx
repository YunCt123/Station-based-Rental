// SimpleLocationMap.tsx - A simple map for showing single station location
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleLocationMapProps {
  station: {
    id: string;
    name: string;
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  height?: string;
  showControls?: boolean;
}

export const SimpleLocationMap = ({
  station,
  height = "256px",
  showControls = true,
}: SimpleLocationMapProps) => {
  // Generate Google Maps URL for this location
  const getGoogleMapsUrl = () => {
    const query = encodeURIComponent(`${station.name}, ${station.address}, ${station.city}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // Generate directions URL
  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}`;
  };

  return (
    <div
      className="relative w-full bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 rounded-lg overflow-hidden border cursor-pointer group"
      style={{ height }}
      onClick={() => window.open(getGoogleMapsUrl(), '_blank')}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          {/* Grid pattern */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#666"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Station marker in center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* Pulse animation */}
          <div className="absolute -inset-2 bg-blue-400 rounded-full animate-ping opacity-30" />
          <div className="absolute -inset-1 bg-blue-500 rounded-full animate-pulse opacity-50" />
          
          {/* Main marker */}
          <div className="relative bg-blue-600 text-white p-3 rounded-full shadow-lg group-hover:bg-blue-700 transition-colors">
            <MapPin className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Station info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4">
        <div className="text-white">
          <h4 className="font-semibold text-sm mb-1">{station.name}</h4>
          <p className="text-xs opacity-90 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {station.address}
          </p>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 text-center">
          <ExternalLink className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Open in Google Maps</p>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 hover:bg-white shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              window.open(getDirectionsUrl(), '_blank');
            }}
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Coordinates display (for dev) */}
      <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {station.coordinates.lat.toFixed(4)}, {station.coordinates.lng.toFixed(4)}
      </div>
    </div>
  );
};