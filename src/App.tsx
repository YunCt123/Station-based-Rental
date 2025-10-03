import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import LoginPage from "./pages/auth/LoginPage";
import VehiclesPage from "./pages/shared/VehiclesPage";
import HomePage from "./pages/shared/HomePage";
import DetailsPage from "./pages/shared/DetailsPage";
import HowItWorks from "./pages/HowItWorks";
import Stations from "./pages/Stations";
import BookingPage from "./pages/shared/BookingPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicle/:id" element={<DetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/stations" element={<Stations />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route
              path="/register"
              element={<ComingSoonPage title="Register" />}
            />
            <Route path="/booking/:vehicleId?" element={<BookingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// Temporary Coming Soon component
const ComingSoonPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 mb-8">This page is coming soon!</p>
        <p className="text-gray-500">
          We're working hard to bring you this feature.
        </p>
      </div>
    </div>
  );
};

// 404 Not Found component
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.636 0L3.178 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export default App;
