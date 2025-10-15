// Preloading utilities for better performance
export const preloadRoute = (routeImport: () => Promise<any>) => {
  // Preload the route component
  const modulePromise = routeImport();
  return modulePromise;
};

// Preload critical routes
export const preloadCriticalRoutes = () => {
  // Preload homepage and dashboard routes as they're most likely to be visited
  import('../pages/shared/HomePage');
  import('../pages/dashboard/staff/StaffDashboard');
  import('../pages/dashboard/admin/AdminDashboard');
};

// Resource hints for better loading
export const addResourceHints = () => {
  const addLink = (rel: string, href: string, as?: string) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (as) link.setAttribute('as', as);
    document.head.appendChild(link);
  };

  // Preconnect to any external domains you use
  // addLink('preconnect', 'https://fonts.googleapis.com');
  // addLink('dns-prefetch', 'https://api.example.com');
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  if (typeof window !== 'undefined') {
    // Preload critical routes after initial load
    setTimeout(preloadCriticalRoutes, 2000);
    
    // Add resource hints
    addResourceHints();
  }
};