import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import DashboardLayout  from "./layout/DashboardLayout";
import LoginPage from "./pages/auth/Login";
import VehiclesPage from "./pages/shared/VehiclesPage";
import HomePage from "./pages/shared/HomePage";
import DetailsPage from "./pages/shared/DetailsPage";
import HowItWorks from "./pages/shared/HowItWorks";
import BookingPage from "./pages/shared/BookingPage";
import Register from "./pages/auth/Register";
import RoleSwitcher from "./pages/dashboard/RoleSwitcher";
import AdminDashboard  from "./pages/dashboard/admin/AdminDashboard";
import StaffDashboard from "./pages/dashboard/staff/StaffDashboard";
import FleetOverview  from "./pages/dashboard/admin/FleetOverview";
import VehicleDistribution  from "./pages/dashboard/admin/VehicleDistribution";
import Stations from "./pages/shared/Stations";
import NotFoundPage from "./pages/shared/NotFoundPage";
import StationDetailPage from "./pages/shared/StationDetailPage";
import { TranslationProvider } from "./contexts/TranslationContext";
import DeliveryProcedures from "./pages/dashboard/staff/delivery_procedures/DeliveryProcedures";
import CustomerManagement from "./pages/dashboard/admin/CustomerManagement";
import VehicleReserved from "./pages/dashboard/staff/vehicle/VehicleReserved";
import OnlineVerification from "./pages/dashboard/staff/customer_verification/OnlineVerification";
import OfflineVerification from "./pages/dashboard/staff/customer_verification/OfflineVerification";
import BatteryStatus from "./pages/dashboard/staff/manage_vehicles/BatteryStatus";
import TechnicalStatus from "./pages/dashboard/staff/manage_vehicles/TechnicalStatus";
import IncidentReport from "./pages/dashboard/staff/manage_vehicles/IncidentReport";
import VehicleAvailable from "./pages/dashboard/staff/vehicle/VehicleAvailable";
import VehicleRented from "./pages/dashboard/staff/vehicle/VehicleRented";
import IdentityVerification from "./pages/dashboard/staff/delivery_procedures/IdentityVerification";
import VehicleInspection from "./pages/dashboard/staff/delivery_procedures/VehicleInspection";
import { useState } from "react";
import Settings from "./pages/dashboard/Settings";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";

// User interface for type safety
interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  phoneNumber?: string;
  dateOfBirth?: string;
  isVerified?: boolean;
}


function App() {
   const [user, setUser] = useState<User | null>(() => {
    // Try to load user from localStorage on app start
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    // Remove user from localStorage
    localStorage.removeItem("user");
  };

  return (
    <Router>
      <TranslationProvider>
        <TooltipProvider>
          <Toaster/>
          <Sonner/>
      <div className="App">
        <Routes>
          {/* Public routes with Header/Footer */}
          <Route path="/" element={
            <>
              <Header user={user} onLogout={handleLogout} />
              <main className="min-h-screen">
                <HomePage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/vehicles" element={
            <>
              <Header user={user} onLogout={handleLogout} />
              <main className="min-h-screen">
                <VehiclesPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/vehicle/:id" element={
            <>
              <Header user={user} onLogout={handleLogout} />
              <main className="min-h-screen">
                <DetailsPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/login" element={
            <>
              <Header user={user} onLogout={handleLogout} />
              <main className="min-h-screen">
                <LoginPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/stations" element={
            <>
              <Header user={user} onLogout={handleLogout} />
              <main className="min-h-screen">
                <Stations />
              </main>
              <Footer />
            </>
          } />
          <Route path="/stations/:stationId" element={
            <>
              <Header user={user} onLogout={handleLogout} />
              <main className="min-h-screen">
                <StationDetailPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/how-it-works" element={
            <>
              <Header user={user} onLogout={handleLogout} />
              <main className="min-h-screen">
                <HowItWorks />
              </main>
              <Footer />
            </>
          } />
          <Route path="/register" element={
            <>
              <Header user={user} onLogout={handleLogout} />
              <main className="min-h-screen">
                <Register />
              </main>
              <Footer />
            </>
          } />
          <Route path="/booking/:vehicleId?" element={
            <>
              <Header user={user} onLogout={handleLogout} />
              <main className="min-h-screen">
                <BookingPage />
              </main>
              <Footer />
            </>
          } />

          {/* Dashboard routes without Header/Footer */}
          <Route path="/dashboard" element={<RoleSwitcher />} />
          <Route
            path="/admin/dashboard"
            element={
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/fleet/overview"
            element={
              <DashboardLayout>
                <FleetOverview />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/fleet/distribution"
            element={
              <DashboardLayout>
                <VehicleDistribution />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/customers/customer_management"
            element={
              <DashboardLayout>
                <CustomerManagement />
              </DashboardLayout>
            }
          />
          <Route
            path="/staff/dashboard"
            element={
              <DashboardLayout>
                <StaffDashboard />
              </DashboardLayout>
            }
          />

          <Route path="/staff/vehicles/available" element={
            <DashboardLayout>
              <VehicleAvailable />
            </DashboardLayout>
          } />

          <Route path="/staff/vehicles/booked" element={
            <DashboardLayout>
              <VehicleReserved />
            </DashboardLayout>
          } />

          <Route path="/staff/vehicles/rented" element={
            <DashboardLayout>
              <VehicleRented />
            </DashboardLayout>
          } />

          {/* Staff Delivery Procedures Routes */}
          <Route path="/staff/delivery-procedures" element={
            <DashboardLayout>
              <DeliveryProcedures />
            </DashboardLayout>
          } />

          {/* Staff Verification Routes */}
          <Route path="/staff/verification/online" element={
            <DashboardLayout>
              <OnlineVerification />
            </DashboardLayout>
          } />

          <Route path="/staff/verification/offline" element={
            <DashboardLayout>
              <OfflineVerification />
            </DashboardLayout>
          } />

          <Route path="/staff/identity-verification" element={
            <DashboardLayout>
              <IdentityVerification />
            </DashboardLayout>
          } />

          <Route path="/staff/vehicle-inspection" element={
            <DashboardLayout>
              <VehicleInspection />
            </DashboardLayout>
          } />

          {/* Station Management Routes */}
          <Route path="/staff/station-management/battery-status" element={
            <DashboardLayout>
              <BatteryStatus />
            </DashboardLayout>
          } />

          <Route path="/staff/station-management/technical-status" element={
            <DashboardLayout>
              <TechnicalStatus />
            </DashboardLayout>
          } />

          <Route path="/staff/station-management/incident-report" element={
            <DashboardLayout>
              <IncidentReport />
            </DashboardLayout>
          } />

          {/* 404 route */}
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>   
      </TooltipProvider>
      </TranslationProvider>
    </Router>
  );
}



export default App;