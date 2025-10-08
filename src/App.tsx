import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import { DashboardLayout } from "./layout/DashboardLayout";
import LoginPage from "./pages/auth/Login";
import VehiclesPage from "./pages/shared/VehiclesPage";
import HomePage from "./pages/shared/HomePage";
import DetailsPage from "./pages/shared/DetailsPage";
import HowItWorks from "./pages/shared/HowItWorks";
import BookingPage from "./pages/shared/BookingPage";
import Register from "./pages/auth/Register";
import { RoleSwitcher } from "./pages/dashboard/RoleSwitcher";
import { AdminDashboard } from "./pages/dashboard/admin/AdminDashboard";
import { StaffDashboard } from "./pages/dashboard/staff/StaffDashboard";
import { FleetOverview } from "./pages/dashboard/admin/FleetOverview";
import { VehicleDistribution } from "./pages/dashboard/admin/VehicleDistribution";
import Stations from "./pages/shared/Stations";
import NotFoundPage from "./pages/shared/NotFoundPage";
import StationDetailPage from "./pages/shared/StationDetailPage";
import { DeliveryProcedures } from "./pages/dashboard/staff/DeliveryProcedures";
import { CustomerVerification, VehicleAvailable, VehicleRented, IdentityVerification, VehicleInspection } from "./pages/dashboard/staff";
import { OnlineVerification } from "./pages/dashboard/staff/OnlineVerification";
import { OfflineVerification } from "./pages/dashboard/staff/OfflineVerification";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes with Header/Footer */}
          <Route
            path="/"
            element={
              <>
                <Header />
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
                <Header />
                <main className="min-h-screen">
                  <VehiclesPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/vehicle/:id"
            element={
              <>
                <Header />
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
                <Header />
                <main className="min-h-screen">
                  <LoginPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/stations"
            element={
              <>
                <Header />
                <main className="min-h-screen">
                  <Stations />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/stations/:stationId"
            element={
              <>
                <Header />
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
                <Header />
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
                <Header />
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
              <>
                <Header />
                <main className="min-h-screen">
                  <BookingPage />
                </main>
                <Footer />
              </>
            }
          />

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

          <Route path="/staff/verification/license" element={
            <DashboardLayout>
              <CustomerVerification />
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

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
