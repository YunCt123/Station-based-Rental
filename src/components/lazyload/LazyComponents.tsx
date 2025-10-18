import { lazy } from 'react';

// Lazy load shared pages
export const LazyHomePage = lazy(() => import('../../pages/shared/HomePage'));
export const LazyVehiclesPage = lazy(() => import('../../pages/shared/VehiclesPage'));
export const LazyBookingPage = lazy(() => import('../../pages/shared/BookingPage'));
export const LazyDetailsPage = lazy(() => import('../../pages/shared/DetailsPage'));
export const LazyHowItWorks = lazy(() => import('../../pages/shared/HowItWorks'));
export const LazyStations = lazy(() => import('../../pages/shared/Stations'));
export const LazyStationDetailPage = lazy(() => import('../../pages/shared/StationDetailPage'));

// Auth pages
export const LazyLogin = lazy(() => import('../../pages/auth/Login'));
export const LazyRegister = lazy(() => import('../../pages/auth/Register'));

// Staff Dashboard
export const LazyStaffDashboard = lazy(() => import('../../pages/dashboard/staff/StaffDashboard'));

// Staff pages - manage vehicles
export const LazyBatteryStatus = lazy(() => import('../../pages/dashboard/staff/manage_vehicles/BatteryStatus'));
export const LazyTechnicalStatus = lazy(() => import('../../pages/dashboard/staff/manage_vehicles/TechnicalStatus'));
export const LazyIncidentReport = lazy(() => import('../../pages/dashboard/staff/manage_vehicles/IncidentReport'));

// Staff pages - delivery procedures
export const LazyDeliveryProcedures = lazy(() => import('../../pages/dashboard/staff/delivery_procedures/DeliveryProcedures'));
export const LazyVehicleInspection = lazy(() => import('../../pages/dashboard/staff/delivery_procedures/VehicleInspection'));
export const LazyIdentityVerification = lazy(() => import('../../pages/dashboard/staff/delivery_procedures/IdentityVerification'));

// Staff pages - vehicle management
export const LazyVehicleReserved = lazy(() => import('../../pages/dashboard/staff/vehicle/VehicleReserved'));
export const LazyVehicleRented = lazy(() => import('../../pages/dashboard/staff/vehicle/VehicleRented'));
export const LazyVehicleAvailable = lazy(() => import('../../pages/dashboard/staff/vehicle/VehicleAvailable'));

// Staff pages - payment
export const LazyRentalPayment = lazy(() => import('../../pages/dashboard/staff/payment/RentalPayment'));
export const LazyDepositPayment = lazy(() => import('../../pages/dashboard/staff/payment/DepositPayment'));

// Admin pages
export const LazyAdminDashboard = lazy(() => import('../../pages/dashboard/admin/AdminDashboard'));
export const LazyFleetOverview = lazy(() => import('../../pages/dashboard/admin/FleetOverview'));
export const LazyVehicleDistribution = lazy(() => import('../../pages/dashboard/admin/VehicleDistribution'));

// Role Switcher
export const LazyRoleSwitcher = lazy(() => import('../../pages/dashboard/RoleSwitcher'));