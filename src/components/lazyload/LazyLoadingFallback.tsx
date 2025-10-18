import React from 'react';

interface LazyLoadingFallbackProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LazyLoadingFallback: React.FC<LazyLoadingFallbackProps> = ({
  message = 'Đang tải...',
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4`}></div>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
};

// Specific fallbacks for different page types
export const PageLoadingFallback: React.FC = () => (
  <LazyLoadingFallback 
    message="Đang tải trang..." 
    size="large" 
    className="min-h-screen" 
  />
);

export const ComponentLoadingFallback: React.FC = () => (
  <LazyLoadingFallback 
    message="Đang tải nội dung..." 
    size="medium" 
    className="min-h-[300px]" 
  />
);

export const ModalLoadingFallback: React.FC = () => (
  <LazyLoadingFallback 
    message="Đang tải..." 
    size="small" 
    className="min-h-[100px]" 
  />
);

export default LazyLoadingFallback;