// src/components/StationMap.tsx

import React, { useState, useEffect, useMemo } from 'react'; // <-- Thêm useMemo
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Station } from '../data/stations';
import RoutingMachine from './RoutingMachine';

interface StationMapProps {
  station: Station;
}

// Custom icon (giữ nguyên)
const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const StationMap: React.FC<StationMapProps> = ({ station }) => {
  const [userPosition, setUserPosition] = useState<L.LatLng | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- SỬA LỖI Ở ĐÂY: Dùng useMemo để ổn định đối tượng stationPosition ---
  const stationPosition = useMemo(() => 
    new L.LatLng(station.coordinates.lat, station.coordinates.lng), 
    [station.coordinates.lat, station.coordinates.lng]
  );
  // --- KẾT THÚC SỬA LỖI ---

  useEffect(() => {
    // Chỉ chạy một lần để lấy vị trí
    if (!userPosition && !error) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentUserPosition = new L.LatLng(position.coords.latitude, position.coords.longitude);
          setUserPosition(currentUserPosition);
          setError(null);
          
          const distanceInMeters = currentUserPosition.distanceTo(stationPosition);
          setDistance((distanceInMeters / 1000).toFixed(2));
        },
        (err) => {
          setError("Location access denied. Showing station location only.");
          console.error(err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [stationPosition, userPosition, error]); // Thêm userPosition và error vào dependency

  return (
    <div className="h-80 w-full rounded-lg relative overflow-hidden">
      {error && <div className="absolute top-2 left-2 z-[1000] bg-yellow-400 text-black text-xs font-semibold px-3 py-1.5 rounded">{error}</div>}
      <MapContainer center={[station.coordinates.lat, station.coordinates.lng]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[station.coordinates.lat, station.coordinates.lng]}>
          <Popup>
            <b>{station.name}</b><br />
            {station.address}
          </Popup>
        </Marker>
        
        {userPosition && (
          <>
            <Marker position={userPosition} icon={userIcon}>
              <Popup>
                You are here. <br />
                Distance: <b>{distance} km</b>
              </Popup>
            </Marker>
            <RoutingMachine userPosition={userPosition} stationPosition={stationPosition} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default StationMap;