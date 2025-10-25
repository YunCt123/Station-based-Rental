import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import DashboardLayout from "./layout/DashboardLayout";
import LoginPage from "./pages/auth/Login";
import VehiclesPage from "./pages/shared/VehiclesPage";
import HomePage from "./pages/shared/HomePage";
import DetailsPage from "./pages/shared/DetailsPage";
import HowItWorks from "./pages/shared/HowItWorks";
import BookingPage from "./pages/shared/BookingPage";
import { PaymentPage, PaymentSuccessPage, PaymentCancelPage } from "./pages/shared";
import Register from "./pages/auth/Register";
import RoleSwitcher from "./pages/dashboard/RoleSwitcher";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";
import StaffDashboard from "./pages/dashboard/staff/StaffDashboard";
import FleetOverview from "./pages/dashboard/admin/FleetOverview";
import VehicleDistribution from "./pages/dashboard/admin/VehicleDistribution";
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
import Settings from "./pages/dashboard/Settings";
import BookingsPage from "./pages/dashboard/BookingsPage";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AccessDenied from "./components/auth/AccessDenied";
import { PageLoadingFallback } from "./components/lazyload/LazyLoadingFallback";
import { clearAuthData, getCurrentUser, type User } from "./utils/auth";
import {
  LazyHomePage,
  LazyVehiclesPage,
  LazyBookingPage,
  LazyDetailsPage,
  LazyHowItWorks,
  LazyStations,
  LazyStationDetailPage,
  LazyLogin,
  LazyRegister,
  LazyStaffDashboard,
  LazyBatteryStatus,
  LazyTechnicalStatus,
  LazyIncidentReport,
  LazyDeliveryProcedures,
  LazyVehicleInspection,
  LazyIdentityVerification,
  LazyVehicleReserved,
  LazyVehicleRented,
  LazyVehicleAvailable,
  LazyRentalPayment,
  LazyDepositPayment,
  LazyAdminDashboard,
  LazyFleetOverview,
  LazyVehicleDistribution,
  LazyDeliveryHistory,
  LazyReturnHistory,
  LazyStaffSchedule,
  LazyPeakHourManagement,
  LazyRoleSwitcher,
  LazySettings,
} from "./components/lazyload/LazyComponents";

// Keep these as regular imports as they might not exist as separate files yet
import NotFoundPage from "./pages/shared/NotFoundPage";
import Verification from "./pages/dashboard/staff/customer_verification/Verification";
import CustomerManagement from "./pages/dashboard/admin/CustomerManagement/CustomerManagement";
import RentalHistory from "./pages/dashboard/admin/RentalHistory/RentalHistory";
import EmployeeManagement from "./pages/dashboard/admin/EmployeeManagement/EmployeeList/EmployeeManagement";

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
    // Use utility function to clear all auth data
    clearAuthData();
  };

  // Check token validity on app start
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("access_token");
      const savedUser = getCurrentUser();
      
      if (!token && savedUser) {
        // Token không tồn tại nhưng user có -> clear user
        handleLogout();
      } else if (token && !savedUser) {
        // Token tồn tại nhưng user không có -> clear token
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } else if (token && savedUser) {
        // Both exist, sync state with localStorage
        setUser(savedUser);
      }
    };

    checkAuthStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router>
      <TranslationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="App">
            <Routes>
              {/* Public routes with Header/Footer */}
              <Route
                path="/"
                element={
                  <>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <HomePage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/vehicles"
                element={
                  <>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <VehiclesPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/vehicles/:id"
                element={
                  <>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <DetailsPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/login"
                element={
                  <>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <LoginPage onLogin={handleLogin} />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/stations"
                element={
                  <>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <Stations />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/stations/:id"
                element={
                  <>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <StationDetailPage />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/how-it-works"
                element={
                  <>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <HowItWorks />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/register"
                element={
                  <>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <Register />
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route
                path="/booking/:vehicleId?"
                element={
                  <ProtectedRoute user={user} requireAuth={true}>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <BookingPage />
                    </main>
                    <Footer />
                  </ProtectedRoute>
                }
              />

              {/* Payment routes */}
              <Route
                path="/payment"
                element={
                  <ProtectedRoute user={user} requireAuth={true}>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <PaymentPage />
                    </main>
                    <Footer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/success"
                element={
                  <ProtectedRoute user={user} requireAuth={true}>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <PaymentSuccessPage />
                    </main>
                    <Footer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/cancel"
                element={
                  <ProtectedRoute user={user} requireAuth={true}>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <PaymentCancelPage />
                    </main>
                    <Footer />
                  </ProtectedRoute>
                }
              />

              {/* User Bookings Route */}
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute user={user} requireAuth={true}>
                    <Header user={user} onLogout={handleLogout} />
                    <main className="min-h-screen">
                      <BookingsPage />
                    </main>
                    <Footer />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard routes without Header/Footer */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute user={user} requireAuth={true}>
                    <RoleSwitcher />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Only Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <AdminDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/fleet/overview"
                element={
                  <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <FleetOverview />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/fleet/distribution"
                element={
                  <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <VehicleDistribution />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers/customer_management"
                element={
                  <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                    <DashboardLayout>
                      <CustomerManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              {/* Staff Only Routes */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                    <DashboardLayout>
                      <StaffDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

            {/* Dashboard routes without Header/Footer */}
            <Route path="/dashboard" element={<LazyRoleSwitcher />} />
            <Route
              path="/admin/dashboard"
              element={
                <DashboardLayout>
                  <LazyAdminDashboard />
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
              path="/admin/customers/history"
              element={
                <DashboardLayout>
                  <RentalHistory />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/staff/list"
              element={
                <DashboardLayout>
                  <EmployeeManagement />
                </DashboardLayout>
              }
            />
            
            <Route
              path="/admin/fleet/overview"
              element={
                <DashboardLayout>
                  <LazyFleetOverview />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/fleet/distribution"
              element={
                <DashboardLayout>
                  <LazyVehicleDistribution />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/transactions/delivery"
              element={
                <DashboardLayout>
                  <LazyDeliveryHistory />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/transactions/return"
              element={
                <DashboardLayout>
                  <LazyReturnHistory />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/allocation/schedule"
              element={
                <DashboardLayout>
                  <LazyStaffSchedule />
                </DashboardLayout>
              }
            />
            <Route
              path="/admin/allocation/peak-hours"
              element={
                <DashboardLayout>
                  <LazyPeakHourManagement />
                </DashboardLayout>
              }
            />
            <Route
              path="/staff/dashboard"
              element={
                <DashboardLayout>
                  <LazyStaffDashboard />
                </DashboardLayout>
              }
            />

            <Route
              path="/staff/vehicles/available"
              element={
                <DashboardLayout>
                  <LazyVehicleAvailable />
                </DashboardLayout>
              }
            />

            <Route
              path="/staff/vehicles/booked"
              element={
                <DashboardLayout>
                  <LazyVehicleReserved />
                </DashboardLayout>
              }
            />

            <Route
              path="/staff/vehicles/rented"
              element={
                <DashboardLayout>
                  <LazyVehicleRented />
                </DashboardLayout>
              }
            />

            {/* Staff Delivery Procedures Routes */}
            <Route
              path="/staff/delivery-procedures"
              element={
                <DashboardLayout>
                  <LazyDeliveryProcedures />
                </DashboardLayout>
              }
            />

            {/* Staff Verification Routes */}
            <Route
              path="/staff/customer-verification"
              element={
                <DashboardLayout>
                  <Verification />
                </DashboardLayout>
              }
            />

            <Route
              path="/staff/identity-verification"
              element={
                <DashboardLayout>
                  <LazyIdentityVerification />
                </DashboardLayout>
              }
            />

            <Route
              path="/staff/vehicle-inspection"
              element={
                <DashboardLayout>
                  <LazyVehicleInspection />
                </DashboardLayout>
              }
            />

            {/* Station Management Routes */}
            <Route
              path="/staff/station-management/battery-status"
              element={
                <DashboardLayout>
                  <LazyBatteryStatus />
                </DashboardLayout>
              }
            />
          {/* Staff Payment Routes */}
          <Route path="/staff/payment/rental" element={
            <DashboardLayout>
              <LazyRentalPayment />
            </DashboardLayout>
          } />

          <Route path="/staff/payment/deposit" element={
            <DashboardLayout>
              <LazyDepositPayment />
            </DashboardLayout>
          } />

          {/* Station Management Routes */}
          <Route path="/staff/station-management/battery-status" element={
            <DashboardLayout>
              <LazyBatteryStatus />
            </DashboardLayout>
          } />

              {/* Settings Route - Available to all authenticated users */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute user={user} requireAuth={true}>
                    <Header user={user} onLogout={handleLogout} />
                    <Settings />
                  </ProtectedRoute>
                } 
              />
            <Route
              path="/staff/station-management/technical-status"
              element={
                <DashboardLayout>
                  <LazyTechnicalStatus />
                </DashboardLayout>
              }
            />

            <Route
              path="/staff/station-management/incident-report"
              element={
                <DashboardLayout>
                  <LazyIncidentReport />
                </DashboardLayout>
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
