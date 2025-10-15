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
<<<<<<< HEAD
import { CustomerVerification } from "./pages/dashboard/staff/CustomerVerification";
import { LicenseVerification } from "./pages/dashboard/staff/LicenseVerification";
import { IdentityVerification } from "./pages/dashboard/staff/IdentityVerification";
import { VehicleAvailable, VehicleRented } from "./pages/dashboard/staff";
import {CustomerManagement} from "./pages/dashboard/admin/CustomerManagement";
import NewCustomer from "./pages/dashboard/admin/NewCustomer";
import CustomerDetails from "./pages/dashboard/admin/CustomerDetails";
import RentalHistory from "./pages/dashboard/admin/RentalHistory";
import ComplaintHandling from "./pages/dashboard/admin/ComplaintHandling";
import RiskList from "./pages/dashboard/admin/RiskList";
=======
import { DeliveryProcedures } from "./pages/dashboard/staff/DeliveryProcedures";
import { CustomerVerification, VehicleAvailable, VehicleRented, IdentityVerification, VehicleInspection } from "./pages/dashboard/staff";

>>>>>>> cafa803 (justify delivery procedures)

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
            path="/admin/customers/profiles"
            element={
              <DashboardLayout>
                <CustomerManagement />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/customers/profiles/new"
            element={
              <DashboardLayout>
                <NewCustomer />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/customers/profiles/:id"
            element={
              <DashboardLayout>
                <CustomerDetails />
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
            path="/admin/customers/complaints"
            element={
              <DashboardLayout>
                <ComplaintHandling />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/customers/blacklist"
            element={
              <DashboardLayout>
                <RiskList />
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
