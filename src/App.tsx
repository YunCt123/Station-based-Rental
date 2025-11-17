import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layouts
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import DashboardLayout from "./layout/DashboardLayout";

// Public pages (non-lazy)
import LoginPage from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import HomePage from "./pages/shared/HomePage";
import VehiclesPage from "./pages/shared/VehiclesPage";
import DetailsPage from "./pages/shared/DetailsPage";
import Stations from "./pages/shared/Stations";
import StationDetailPage from "./pages/shared/StationDetailPage";
import HowItWorks from "./pages/shared/HowItWorks";
import BookingPage from "./pages/shared/BookingPage";
import BookingsPage from "./pages/dashboard/BookingsPage";
import BookingDetailsPage from "./pages/dashboard/BookingDetailsPage";
import NotFoundPage from "./pages/shared/NotFoundPage";
import { PaymentPage, PaymentSuccessPage, PaymentCancelPage, PolicyPage } from "./pages/shared";
import PaymentResultPage from "./pages/shared/PaymentResultPage";
import PaymentPayOsPage from "./pages/shared/PaymentPayOsPage";

// Contexts & UI
import { TranslationProvider } from "./contexts/TranslationContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";

// Auth utils & guards
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { clearAuthData, getCurrentUser, type User } from "./utils/auth";

// Fallback
import { PageLoadingFallback } from "./components/lazyload/LazyLoadingFallback";

// Lazy chunks (dashboard & heavy pages)
import {
  LazyStaffDashboard,
  LazyBatteryStatus,
  LazyTechnicalStatus,
  LazyIncidentReport,
  LazyDeliveryProcedures,
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
import Verification from "./pages/dashboard/staff/customer_verification/Verification";
import CustomerManagement from "./pages/dashboard/admin/CustomerManagement/CustomerManagement";
import RentalHistory from "./pages/dashboard/admin/RentalHistory/RentalHistory";
import EmployeeManagement from "./pages/dashboard/admin/EmployeeManagement/EmployeeList/EmployeeManagement";
import VehicleManagement from "./pages/dashboard/admin/VehicleManagement/VehicleManagement";
import StationManagement from "./pages/dashboard/admin/StationManagement/StationManagement";

// Customer imports
import CustomerRentalApp from "./pages/customer/rentals/CustomerRentalApp";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import RentalPaymentResultPage from "./pages/customer/rentals/RentalPaymentResultPage";

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    clearAuthData();
  };

  // Sync token & user on start
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("access_token");
      const savedUser = getCurrentUser();

      if (!token && savedUser) {
        // No token but user exists -> clear user
        handleLogout();
      } else if (token && !savedUser) {
        // Token exists but no user -> clear token
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } else if (token && savedUser) {
        // Both exist -> sync state
        setUser(savedUser);
      }
    };
    checkAuthStatus();
  }, []);

  return (
    <Router>
      <TranslationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="App">
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* ===================== PUBLIC ROUTES (Header/Footer) ===================== */}
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
                  path="/policy"
                  element={
                    <>
                      <Header user={user} onLogout={handleLogout} />
                      <main className="min-h-screen">
                        <PolicyPage />
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
                  path="/register"
                  element={
                    <>
                      <Header user={user} onLogout={handleLogout} />
                        <main className="min-h-screen">
                        <Register onRegister={handleLogin} />
                        </main>
                      <Footer />
                    </>
                  }
                />

                <Route
                  path="/verify-email"
                  element={
                    <>
                      <Header user={user} onLogout={handleLogout} />
                      <main className="min-h-screen">
                        <VerifyEmail />
                      </main>
                      <Footer />
                    </>
                  }
                />

                {/* Booking (protected) */}
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

                {/* Payment (protected) */}
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

                {/* User bookings (protected) */}
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

                {/* Customer Rentals (protected) */}
                <Route
                  path="/my-rentals"
                  element={
                    <ProtectedRoute user={user} requireAuth={true}>
                      <Header user={user} onLogout={handleLogout} />
                      <main className="min-h-screen">
                        <CustomerRentalApp />
                      </main>
                      <Footer />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/rental/:id/payment-result"
                  element={
                    <ProtectedRoute user={user} requireAuth={true}>
                      <Header user={user} onLogout={handleLogout} />
                      <main className="min-h-screen">
                        <RentalPaymentResultPage />
                      </main>
                      <Footer />
                    </ProtectedRoute>
                  }
                />
                
                {/* Booking details (protected) */}
                <Route
                  path="/bookings/:id"
                  element={
                    <ProtectedRoute user={user} requireAuth={true}>
                      <Header user={user} onLogout={handleLogout} />
                      <main className="min-h-screen">
                        <BookingDetailsPage />
                      </main>
                      <Footer />
                    </ProtectedRoute>
                  }
                />

                {/* ===================== ROLE SWITCHER & CUSTOMER DASHBOARD (protected) ===================== */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute user={user} requireAuth={true}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/role-switcher"
                  element={
                    <ProtectedRoute user={user} requireAuth={true}>
                      <LazyRoleSwitcher />
                    </ProtectedRoute>
                  }
                />

                {/* ===================== ADMIN ROUTES (protected) ===================== */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                      <DashboardLayout>
                        <LazyAdminDashboard />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/fleet/overview"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                      <DashboardLayout>
                        <LazyFleetOverview />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/fleet/distribution"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                      <DashboardLayout>
                        <LazyVehicleDistribution />
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

                <Route
                  path="/admin/customers/history"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                      <DashboardLayout>
                        <RentalHistory />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/staff/list"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                      <DashboardLayout>
                        <EmployeeManagement />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/vehicles"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                      <DashboardLayout>
                        <VehicleManagement />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/stations"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                      <DashboardLayout>
                        <StationManagement />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/transactions/delivery"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                      <DashboardLayout>
                        <LazyDeliveryHistory />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/transactions/return"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                      <DashboardLayout>
                        <LazyReturnHistory />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/allocation/schedule"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                      <DashboardLayout>
                        <LazyStaffSchedule />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/allocation/peak-hours"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["admin"]}>
                      <DashboardLayout>
                        <LazyPeakHourManagement />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* ===================== STAFF ROUTES (protected) ===================== */}
                <Route
                  path="/staff/dashboard"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <LazyStaffDashboard />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/vehicles/available"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <LazyVehicleAvailable />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/vehicles/booked"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <LazyVehicleReserved />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/vehicles/rented"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <LazyVehicleRented />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Staff Delivery Procedures */}
                <Route
                  path="/staff/delivery-procedures"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <LazyDeliveryProcedures />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Vehicle Checkin Route */}
                <Route
                  path="/dashboard/staff/checkin/:rentalId"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                           < ></>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Vehicle Return Route */}
                <Route
                  path="/dashboard/staff/return/:rentalId"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                         < ></>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Staff Verification */}
                <Route
                  path="/staff/customer-verification"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <Verification />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/identity-verification"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <LazyIdentityVerification />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/vehicle-inspection"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        < ></>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Station Management */}
                <Route
                  path="/staff/station-management/battery-status"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <LazyBatteryStatus />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/station-management/technical-status"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <LazyTechnicalStatus />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/station-management/incident-report"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <LazyIncidentReport />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Staff Payment */}
                <Route
                  path="/staff/payment/rental"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <LazyRentalPayment />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/staff/payment/deposit"
                  element={
                    <ProtectedRoute user={user} requireAuth={true} allowedRoles={["staff", "admin"]}>
                      <DashboardLayout>
                        <LazyDepositPayment />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* ===================== SETTINGS (protected, with Header) ===================== */}
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute user={user} requireAuth={true}>
                      <Header user={user} onLogout={handleLogout} />
                      <main className="min-h-screen">
                        <LazySettings />
                      </main>
                      <Footer />
                    </ProtectedRoute>
                  }
                />
                <Route path="/api/v1/payments/vnpay/callback" element={<PaymentResultPage />} />
                <Route path="/payments/payos/callback" element={<PaymentPayOsPage />} />
                {/* ===================== 404 ===================== */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        </TooltipProvider>
      </TranslationProvider>
    </Router>
  );
}

export default App;