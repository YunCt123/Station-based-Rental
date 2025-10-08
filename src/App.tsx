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
import Stations from "./pages/shared/Stations";
import NotFoundPage from "./pages/shared/NotFoundPage";
import { CustomerManagement } from "./pages/dashboard/admin/CustomerManagement";
import RentalHistory from "./pages/dashboard/admin/RentalHistory";
import ComplaintHandling from "./pages/dashboard/admin/ComplaintHandling";
import RiskList from "./pages/dashboard/admin/RiskList";
import NewCustomer from "./pages/dashboard/admin/NewCustomer";
import CustomerDetails from "./pages/dashboard/admin/CustomerDetails";


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes with Header/Footer */}
          <Route path="/" element={
            <>
              <Header />
              <main className="min-h-screen">
                <HomePage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/vehicles" element={
            <>
              <Header />
              <main className="min-h-screen">
                <VehiclesPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/vehicle/:id" element={
            <>
              <Header />
              <main className="min-h-screen">
                <DetailsPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/login" element={
            <>
              <Header />
              <main className="min-h-screen">
                <LoginPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/stations" element={
            <>
              <Header />
              <main className="min-h-screen">
                <Stations />
              </main>
              <Footer />
            </>
          } />
          <Route path="/how-it-works" element={
            <>
              <Header />
              <main className="min-h-screen">
                <HowItWorks />
              </main>
              <Footer />
            </>
          } />
          <Route path="/register" element={
            <>
              <Header />
              <main className="min-h-screen">
                <Register />
              </main>
              <Footer />
            </>
          } />
          <Route path="/booking/:vehicleId?" element={
            <>
              <Header />
              <main className="min-h-screen">
                <BookingPage />
              </main>
              <Footer />
            </>
          } />

          {/* Dashboard routes without Header/Footer */}
          <Route path="/dashboard" element={<RoleSwitcher />} />
          <Route path="/admin/dashboard" element={
            <DashboardLayout>
              <AdminDashboard />
              
            </DashboardLayout>
          } />
          <Route path="/admin/customers/*" element={
            <DashboardLayout>
              <CustomerManagement />
            </DashboardLayout>
          }>
            <Route path="history" element={<RentalHistory />} />
            <Route path="complaints" element={<ComplaintHandling />} />
            <Route path="blacklist" element={<RiskList />} />
            <Route path="new" element={<NewCustomer />} />
            <Route path=":id" element={<CustomerDetails />} />
          </Route>
          <Route path="/staff/dashboard" element={
            <DashboardLayout>
              <StaffDashboard />
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
