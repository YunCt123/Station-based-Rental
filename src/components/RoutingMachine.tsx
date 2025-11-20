// src/components/RoutingMachine.tsx

import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";
import React, { useEffect } from "react";

interface RoutingProps {
    userPosition: L.LatLng;
    stationPosition: L.LatLng;
}

const RoutingMachine = ({ userPosition, stationPosition }: RoutingProps) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userPosition.lat, userPosition.lng),
                L.latLng(stationPosition.lat, stationPosition.lng),
            ],
            routeWhileDragging: false,
            lineOptions: {
                styles: [{ color: "#0284c7", weight: 6, opacity: 0.9 }],
            },
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            createMarker: () => null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any).addTo(map);

        // --- BỔ SUNG QUAN TRỌNG: Bắt lỗi từ dịch vụ chỉ đường ---
        routingControl.on('routeserror', function(e) {
            // Hiển thị lỗi ra console để debug
            console.error("Routing Service Error:", e.error);
            // Bạn có thể hiển thị một thông báo cho người dùng ở đây nếu muốn
        });

        return () => {
            map.removeControl(routingControl);
        };
    }, [map, userPosition, stationPosition]);

    // Component này không render ra giao diện, chỉ thực hiện logic
    return null;
};

export default React.memo(RoutingMachine);