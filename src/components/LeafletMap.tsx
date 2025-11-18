// LeafletMap.tsx - Real interactive map using Leaflet
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { stationService, type Station } from '@/services/stationService';

// Fix for default markers in webpack
const DefaultIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  className: 'custom-div-icon'
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
  station: {
    id: string;
    name: string;
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    availableVehicles?: number;
  };
  height?: string;
  showControls?: boolean;
  showNearbyStations?: boolean;
}

export const LeafletMap = ({
  station,
  height = "200px",
  showControls = true,
  showNearbyStations = true,
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);

  // Helper function to create station icons
  const createStationIcon = (isMain: boolean, availableVehicles: number) => {
    const color = isMain ? '#3b82f6' : (availableVehicles > 0 ? '#10b981' : '#ef4444');
    const size = isMain ? 35 : 25;
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color}; 
          width: ${size}px; 
          height: ${size}px; 
          border-radius: 50%; 
          border: 4px solid white; 
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          ${isMain ? 'border-width: 5px;' : ''}
        ">
          <svg width="${size - 10}" height="${size - 10}" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          ${availableVehicles > 0 ? `
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              background: #10b981;
              color: white;
              border-radius: 50%;
              width: 18px;
              height: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              border: 2px solid white;
            ">${availableVehicles}</div>
          ` : ''}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      className: 'custom-station-icon'
    });
  };

  // Fetch nearby stations with real vehicle counts
  useEffect(() => {
    const fetchNearbyStations = async () => {
      if (!showNearbyStations) return;
      
      try {
        const response = await stationService.findNearbyStations({
          lat: station.coordinates.lat,
          lng: station.coordinates.lng,
          radiusKm: 10 // 10km radius
        });
        
        // Filter out current station and get max 5 nearby stations
        const filtered = response
          .filter(s => s.id !== station.id)
          .slice(0, 5);
        
        console.log('🗺️ Found nearby stations (before vehicle count update):', filtered);
        
        // Fetch real vehicle counts for each nearby station
        const stationsWithRealCounts = await Promise.all(
          filtered.map(async (nearbyStation) => {
            try {
              // Get available vehicle count for this station
              const availableVehiclesData = await stationService.getStationVehicles(
                nearbyStation.id, 
                'AVAILABLE'
              );
              
              const realAvailableVehicles = availableVehiclesData.count;
              console.log(`� Station ${nearbyStation.name}: ${realAvailableVehicles} available vehicles`);
              
              return {
                ...nearbyStation,
                availableVehicles: realAvailableVehicles
              };
            } catch (error) {
              console.warn(`⚠️ Could not fetch vehicle count for station ${nearbyStation.name}:`, error);
              // Return original station data if vehicle count fetch fails
              return nearbyStation;
            }
          })
        );
          
        setNearbyStations(stationsWithRealCounts);
        console.log('✅ Nearby stations with real vehicle counts:', stationsWithRealCounts);
      } catch (error) {
        console.warn('⚠️ Could not fetch nearby stations:', error);
      }
    };

    fetchNearbyStations();
  }, [station.id, station.coordinates, showNearbyStations]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Helper function to create station icons
    const createStationIcon = (isMain: boolean, availableVehicles: number) => {
      const color = isMain ? '#3b82f6' : (availableVehicles > 0 ? '#10b981' : '#ef4444');
      const size = isMain ? 35 : 25;
      
      return L.divIcon({
        html: `
          <div style="
            background-color: ${color}; 
            width: ${size}px; 
            height: ${size}px; 
            border-radius: 50%; 
            border: 4px solid white; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            ${isMain ? 'border-width: 5px;' : ''}
          ">
            <svg width="${size - 10}" height="${size - 10}" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            ${availableVehicles > 0 ? `
              <div style="
                position: absolute;
                top: -8px;
                right: -8px;
                background: #10b981;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: bold;
                border: 2px solid white;
              ">${availableVehicles}</div>
            ` : ''}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
        className: 'custom-station-icon'
      });
    };

    // Create map
    const map = L.map(mapRef.current, {
      zoomControl: showControls,
      scrollWheelZoom: false, // Disable scroll zoom for better UX in a card
      doubleClickZoom: true,
      touchZoom: true,
    }).setView([station.coordinates.lat, station.coordinates.lng], 14);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Removed duplicate declaration of createStationIcon

    // Add main station marker
    const mainStationIcon = createStationIcon(true, station.availableVehicles || 0);
    const mainMarker = L.marker([station.coordinates.lat, station.coordinates.lng], {
      icon: mainStationIcon
    }).addTo(map);

    // Main station popup
    const mainPopupContent = `
      <div style="min-width: 220px;">
        <div style="background: #3b82f6; color: white; padding: 8px; margin: -9px -9px 8px -9px; border-radius: 4px 4px 0 0;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">📍 ${station.name}</h3>
          <span style="font-size: 12px; opacity: 0.9;">Current Station</span>
        </div>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${station.address}</p>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #666;">${station.city}</p>
        <div style="display: flex; gap: 8px;">
          <a 
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.name + ', ' + station.address + ', ' + station.city)}" 
            target="_blank" 
            style="
              background: #3b82f6; 
              color: white; 
              padding: 6px 12px; 
              border-radius: 4px; 
              text-decoration: none; 
              font-size: 12px;
              font-weight: 500;
            "
          >
            📍 Google Maps
          </a>
          <a 
            href="https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}" 
            target="_blank" 
            style="
              background: #10b981; 
              color: white; 
              padding: 6px 12px; 
              border-radius: 4px; 
              text-decoration: none; 
              font-size: 12px;
              font-weight: 500;
            "
          >
            🧭 Directions
          </a>
        </div>
      </div>
    `;

    mainMarker.bindPopup(mainPopupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    });

    // Open main popup by default
    mainMarker.openPopup();

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [station, showControls]);

  // Add nearby stations when data is loaded
  useEffect(() => {
    if (!mapInstanceRef.current || nearbyStations.length === 0) return;

    const map = mapInstanceRef.current;

    // Add nearby station markers
    nearbyStations.forEach((nearbyStation) => {
      const nearbyIcon = createStationIcon(false, nearbyStation.availableVehicles || 0);
      
      const nearbyMarker = L.marker(
        [nearbyStation.coordinates.lat, nearbyStation.coordinates.lng], 
        { icon: nearbyIcon }
      ).addTo(map);

      // Nearby station popup
      const nearbyPopupContent = `
        <div style="min-width: 200px;">
          <div style="background: #10b981; color: white; padding: 8px; margin: -9px -9px 8px -9px; border-radius: 4px 4px 0 0;">
            <h3 style="margin: 0; font-size: 14px; font-weight: 600;">${nearbyStation.name}</h3>
            <span style="font-size: 11px; opacity: 0.9;">
              ${nearbyStation.distance ? `${nearbyStation.distance.toFixed(1)}km away` : 'Nearby Station'}
            </span>
          </div>
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #666;">${nearbyStation.address}</p>
          <div style="margin: 8px 0; font-size: 12px;">
            <span style="color: #10b981; font-weight: 600;">
              🚗 ${nearbyStation.availableVehicles || 0} vehicles available
            </span>
          </div>
          <div style="display: flex; gap: 6px;">
            <a 
              href="/stations/${nearbyStation.id}" 
              style="
                background: #3b82f6; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 3px; 
                text-decoration: none; 
                font-size: 11px;
                font-weight: 500;
              "
            >
              View Details
            </a>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${nearbyStation.coordinates.lat},${nearbyStation.coordinates.lng}" 
              target="_blank" 
              style="
                background: #10b981; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 3px; 
                text-decoration: none; 
                font-size: 11px;
                font-weight: 500;
              "
            >
              🧭 Go
            </a>
          </div>
        </div>
      `;

      nearbyMarker.bindPopup(nearbyPopupContent, {
        maxWidth: 250,
        className: 'custom-popup'
      });
    });

    // Adjust map view to include all markers
    if (nearbyStations.length > 0) {
      const allCoordinates: [number, number][] = [
        [station.coordinates.lat, station.coordinates.lng],
        ...nearbyStations.map(s => [s.coordinates.lat, s.coordinates.lng] as [number, number])
      ];
      
      const group = new L.FeatureGroup(
        allCoordinates.map(coord => L.marker(coord))
      );
      
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Add click handler to enable scroll zoom when clicked
    map.on('click', () => {
      map.scrollWheelZoom.enable();
    });

    // Disable scroll zoom when mouse leaves
    map.on('mouseout', () => {
      map.scrollWheelZoom.disable();
    });

  }, [nearbyStations, station]);

  return (
    <div style={{ position: 'relative' }}>
      <div 
        ref={mapRef} 
        style={{ 
          height, 
          width: '100%', 
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb'
        }} 
      />
      
      {/* Map Legend */}
      {showNearbyStations && nearbyStations.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'white',
          borderRadius: '6px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '11px',
          lineHeight: '1.4',
          minWidth: '160px',
          zIndex: 1000
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
            Stations Map
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              border: '2px solid white',
              marginRight: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}></div>
            <span style={{ color: '#6b7280' }}>Current Station</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid white',
              marginRight: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}></div>
            <span style={{ color: '#6b7280' }}>Available Nearby</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '2px solid white',
              marginRight: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}></div>
            <span style={{ color: '#6b7280' }}>No Vehicles</span>
          </div>
        </div>
      )}
    </div>
  );
};