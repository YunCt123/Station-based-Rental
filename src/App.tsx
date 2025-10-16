import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import DashboardLayout  from "./layout/DashboardLayout";
import { PageLoadingFallback } from "./components/lazyload/LazyLoadingFallback";
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
  LazyAdminDashboard,
  LazyFleetOverview,
  LazyVehicleDistribution,
  LazyRoleSwitcher
} from "./components/lazyload/LazyComponents";

// Keep these as regular imports as they might not exist as separate files yet
import NotFoundPage from "./pages/shared/NotFoundPage";
import OnlineVerification from "./pages/dashboard/staff/customer_verification/OnlineVerification";
import OfflineVerification from "./pages/dashboard/staff/customer_verification/OfflineVerification";
import CustomerManagement from "./pages/dashboard/admin/CustomerManagement";

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Public routes with Header/Footer */}
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <main className="min-h-screen">
                    <LazyHomePage />
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
                  <LazyVehiclesPage />
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
                  <LazyDetailsPage />
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
                  <LazyLogin />
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
                  <LazyStations />
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
                  <LazyStationDetailPage />
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
                  <LazyHowItWorks />
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
                  <LazyRegister />
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
                  <LazyBookingPage />
                </main>
                <Footer />
              </>
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
                <LazyStaffDashboard />
              </DashboardLayout>
            }
          />

          <Route path="/staff/vehicles/available" element={
            <DashboardLayout>
              <LazyVehicleAvailable />
            </DashboardLayout>
          } />

          <Route path="/staff/vehicles/booked" element={
            <DashboardLayout>
              <LazyVehicleReserved />
            </DashboardLayout>
          } />

          <Route path="/staff/vehicles/rented" element={
            <DashboardLayout>
              <LazyVehicleRented />
            </DashboardLayout>
          } />

          {/* Staff Delivery Procedures Routes */}
          <Route path="/staff/delivery-procedures" element={
            <DashboardLayout>
              <LazyDeliveryProcedures />
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
              <LazyIdentityVerification />
            </DashboardLayout>
          } />

          <Route path="/staff/vehicle-inspection" element={
            <DashboardLayout>
              <LazyVehicleInspection />
            </DashboardLayout>
          } />

          {/* Station Management Routes */}
          <Route path="/staff/station-management/battery-status" element={
            <DashboardLayout>
              <LazyBatteryStatus />
            </DashboardLayout>
          } />

          <Route path="/staff/station-management/technical-status" element={
            <DashboardLayout>
              <LazyTechnicalStatus />
            </DashboardLayout>
          } />

          <Route path="/staff/station-management/incident-report" element={
            <DashboardLayout>
              <LazyIncidentReport />
            </DashboardLayout>
          } />

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
