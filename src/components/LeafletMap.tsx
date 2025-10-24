// LeafletMap.tsx - Real interactive map using Leaflet
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  };
  height?: string;
  showControls?: boolean;
}

export const LeafletMap = ({
  station,
  height = "200px",
  showControls = true,
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapRef.current, {
      zoomControl: showControls,
      scrollWheelZoom: false, // Disable scroll zoom for better UX in a card
      doubleClickZoom: true,
      touchZoom: true,
    }).setView([station.coordinates.lat, station.coordinates.lng], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom station marker
    const stationIcon = L.divIcon({
      html: `
        <div style="
          background-color: #3b82f6; 
          width: 30px; 
          height: 30px; 
          border-radius: 50%; 
          border: 4px solid white; 
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div style="
          position: absolute;
          top: 35px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">
          ${station.name}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: 'custom-station-icon'
    });

    // Add marker for station
    const marker = L.marker([station.coordinates.lat, station.coordinates.lng], {
      icon: stationIcon
    }).addTo(map);

    // Add popup with station info
    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${station.name}</h3>
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
            Open in Google Maps
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
            Get Directions
          </a>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    });

    // Open popup by default
    marker.openPopup();

    // Add click handler to enable scroll zoom when clicked
    map.on('click', () => {
      map.scrollWheelZoom.enable();
    });

    // Disable scroll zoom when mouse leaves
    map.on('mouseout', () => {
      map.scrollWheelZoom.disable();
    });

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [station, showControls]);

  return (
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
  );
};