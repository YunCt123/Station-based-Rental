import React, { Suspense } from 'react';
import LoadingSpinner from '../LoadingSpinner';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <LoadingSpinner /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Simple lazy loading wrapper function
export const withLazyLoading = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) => {
  const WrappedComponent: React.FC<T> = (props) => (
    <LazyWrapper fallback={fallback}>
      <Component {...props} />
    </LazyWrapper>
  );
  
  WrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};