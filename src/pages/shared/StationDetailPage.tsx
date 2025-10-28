// src/pages/shared/StationDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStationById, getStationVehicles } from '@/services/stationService'; // API services
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import VehicleCard from '@/components/VehicleCard'; // Import VehicleCard
import type { Station } from '@/types/station'; // Station data type (frontend)
import type { Vehicle } from '@/types/vehicle'; // Vehicle data type (frontend)
import { MapPin, Zap, Star, Clock, Info, Car, Users, CalendarDays, Tag as TagIcon, Sun, Moon } from 'lucide-react';

// Helper function to format status
const formatStatus = (status: Station['status']) => {
  switch (status) {
    case 'active':
      // TRANSLATED:
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    case 'inactive':
      // TRANSLATED:
      return { text: 'Inactive', color: 'bg-red-100 text-red-800' };
    case 'maintenance':
      // TRANSLATED:
      return { text: 'Under Maintenance', color: 'bg-yellow-100 text-yellow-800' };
    default:
      return { text: status, color: 'bg-gray-100 text-gray-800' };
  }
};

const StationDetailPage: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>(); // Get ID from URL
  const [stationData, setStationData] = useState<Station | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingStation, setLoadingStation] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) {
      // TRANSLATED:
      setError('Station ID not found.');
      setLoadingStation(false);
      setLoadingVehicles(false);
      setStationData(null);
      setVehicles([]);
      return;
    }

    const fetchStationData = async () => {
      setLoadingStation(true);
      setStationData(null);
      setError(null);
      try {
        const data = await getStationById(stationId);
        setStationData(data);
      } catch (err) {
        console.error('Error loading station data:', err);
        // TRANSLATED:
        setError('Could not load station information. Please try again.');
      } finally {
        setLoadingStation(false);
      }
    };

    const fetchStationVehicles = async () => {
      setLoadingVehicles(true);
      setVehicles([]);
      try {
        // Fetch AVAILABLE vehicles at the station
        const vehicleData = await getStationVehicles(stationId, 'available'); // Filter by status 'available'
        setVehicles(vehicleData.vehicles || []); // Get vehicles array from response
      } catch (err) {
        console.error('Error loading vehicle list:', err);
        // Do not set error here to still show station info if only vehicles fail
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchStationData();
    fetchStationVehicles();
  }, [stationId]); // Rerun when stationId changes

  // === Render Loading ===
  if (loadingStation) {
    // Skeleton structure remains the same
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

  // === Render Error ===
  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-red-600">
        <p>{error}</p>
        <Link to="/stations" className="text-blue-500 hover:underline mt-4 inline-block">
          {/* TRANSLATED: */}
          Back to station list
        </Link>
      </div>
    );
  }

  // === Render Content ===
  if (!stationData) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-gray-500">
        {/* TRANSLATED: */}
        Station information not found.
      </div>
    );
  }

  const statusInfo = formatStatus(stationData.status);

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{stationData.name}</h1>
        <div className="flex items-center gap-2 text-gray-500 mt-2">
          <MapPin className="w-4 h-4" />
          <span>{stationData.address}</span>
          {stationData.city && <span>, {stationData.city}</span>}
        </div>
        <Badge className={`mt-2 ${statusInfo.color} font-medium`}>{statusInfo.text}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === Left Column: Image & Map === */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image */}
          <Card>
            <CardContent className="p-0">
               {stationData.image ? (
                 <img
                   src={stationData.image}
                   alt={stationData.name}
                   className="w-full h-64 object-cover rounded-t-lg"
                   onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.onerror = null;
                       target.src = 'https://via.placeholder.com/600x400?text=EV+Station';
                    }}
                 />
               ) : (
                 <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-t-lg">
                   {/* TRANSLATED: */}
                   <span className="text-gray-500">No image available</span>
                 </div>
               )}
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              {/* TRANSLATED: */}
              <CardTitle className="text-lg">Location on map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">
                  {/* TRANSLATED: */}
                  [Map display area]
                </span>
                {/* <GoogleMaps lat={stationData.coordinates.lat} lng={stationData.coordinates.lng} /> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === Right Column: Detailed Info === */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              {/* TRANSLATED: */}
              <CardTitle className="text-lg">Station Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {/* Rating & Fast Charging */}
              <div className="flex justify-between items-center text-sm border-b pb-3 mb-3">
                <div className="flex items-center gap-1 text-gray-700">
                  <Star className={`w-5 h-5 ${stationData.rating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                  <span className="font-medium">
                    {/* TRANSLATED: */}
                    {stationData.rating > 0 ? `${stationData.rating.toFixed(1)} (${stationData.reviewCount} reviews)` : 'No reviews yet'}
                  </span>
                </div>
                 {stationData.fastCharging && (
                  <div className="flex items-center gap-1 text-blue-600 font-medium">
                    <Zap className="w-5 h-5 fill-blue-600" />
                    {/* TRANSLATED: */}
                    <span>Fast Charging Available</span>
                  </div>
                 )}
              </div>

               {/* Slots & Vehicles */}
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                {/* TRANSLATED: */}
                <span className="font-medium">Capacity:</span>
                {/* TRANSLATED: */}
                <span>{stationData.totalSlots} slots</span>
              </div>
               <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-gray-500" />
                {/* TRANSLATED: */}
                <span className="font-medium">Total Vehicles at Station:</span>
                {/* TRANSLATED: */}
                <span>{stationData.totalVehicles} vehicles</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-green-500" />
                {/* TRANSLATED: */}
                <span className="font-medium">Available Vehicles:</span>
                {/* TRANSLATED: */}
                <span className="font-bold text-green-600">{stationData.availableVehicles} vehicles</span>
              </div>
               <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-500" />
                {/* TRANSLATED: */}
                <span className="font-medium">Utilization Rate:</span>
                <span>{(stationData.utilizationRate * 100).toFixed(0)}%</span>
              </div>

               {/* Operating Hours */}
               {(stationData.operatingHours?.weekday || stationData.operatingHours?.weekend || stationData.operatingHours?.holiday) && (
                 <div className="pt-3 border-t">
                    {/* TRANSLATED: */}
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Clock className="w-5 h-5 text-gray-500" /> Operating Hours</h4>
                    {/* TRANSLATED: */}
                    {stationData.operatingHours.weekday && <p className="text-sm ml-7"><Sun className="w-4 h-4 inline mr-1 text-yellow-500"/> Weekdays: {stationData.operatingHours.weekday}</p>}
                    {/* TRANSLATED: */}
                    {stationData.operatingHours.weekend && <p className="text-sm ml-7"><Moon className="w-4 h-4 inline mr-1 text-indigo-500"/> Weekends: {stationData.operatingHours.weekend}</p>}
                    {/* TRANSLATED: */}
                    {stationData.operatingHours.holiday && <p className="text-sm ml-7"><CalendarDays className="w-4 h-4 inline mr-1 text-red-500"/> Holidays: {stationData.operatingHours.holiday}</p>}
                 </div>
               )}

               {/* Amenities */}
               {stationData.amenities && stationData.amenities.length > 0 && (
                 <div className="pt-3 border-t">
                    {/* TRANSLATED: */}
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><TagIcon className="w-5 h-5 text-gray-500" /> Amenities</h4>
                    <div className="flex flex-wrap gap-2 ml-7">
                       {stationData.amenities.map(amenity => (
                         <Badge key={amenity} variant="secondary">{amenity}</Badge>
                       ))}
                    </div>
                 </div>
               )}

            </CardContent>
          </Card>
        </div>
      </div>

      {/* === Vehicle List Section === */}
      <div className="mt-8">
        {/* TRANSLATED: */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Available Vehicles at Station</h2>
        {loadingVehicles ? (
          // Skeleton for vehicle list
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map((i) => (
               <div key={i} className="border rounded-lg overflow-hidden shadow-lg">
                 <Skeleton className="h-48 w-full" />
                 <div className="p-4 space-y-3">
                   <Skeleton className="h-6 w-3/4" /> <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-1/2" /> <Skeleton className="h-10 w-full" />
                 </div>
               </div>
             ))}
          </div>
        ) : vehicles.length > 0 ? (
          // Display vehicle list
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          // Message if no vehicles
          <Card className="text-center py-8">
            <CardContent>
              <Car className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              {/* TRANSLATED: */}
              <p className="text-gray-500">No vehicles currently available at this station.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StationDetailPage;