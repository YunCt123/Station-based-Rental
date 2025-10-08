import React from 'react';
import { SidebarWrapper } from '../components/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Logo component
const AppLogo: React.FC = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-sm">EV</span>
    </div>
    <span className="font-semibold text-gray-900">Station Rental</span>
  </div>
);

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarWrapper 
        logo={<AppLogo />}
        className="flex-shrink-0"
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;