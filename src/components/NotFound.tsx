import React from 'react';
import { ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <ComputerDesktopIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Not Found</h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the vehicle you're looking for. It may have been removed or the link is incorrect.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-electric transition-all duration-200"
          >
            Browse Available Vehicles
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
