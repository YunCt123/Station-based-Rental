import React, { memo } from 'react';

// Performance optimization utilities
export const withMemo = <T extends Record<string, any>>(Component: React.ComponentType<T>) => {
  return memo(Component);
};

// Image lazy loading component
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}> = ({ src, alt, className = '', placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRhbmcgdOG6oWkuLi48L3RleHQ+PC9zdmc+' }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).src = placeholder;
      }}
    />
  );
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  { 
    threshold = 0,
    root = null,
    rootMargin = '0%'
  }: IntersectionObserverInit = {}
): IntersectionObserverEntry | undefined => {
  const [entry, setEntry] = React.useState<IntersectionObserverEntry>();

  React.useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, [elementRef, threshold, root, rootMargin]);

  return entry;
};