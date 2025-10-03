import React from 'react';

interface ComingSoonPageProps {
  title?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ 
  title = "Coming Soon" 
}) => {
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
        <p className="text-gray-500 mb-8">
          We're working hard to bring you this feature.
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

export default ComingSoonPage;