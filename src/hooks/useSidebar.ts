import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { UserRole, SidebarState } from '../types/sidebar';
import { getMenuSections } from '../config/menuConfig';

interface UseSidebarProps {
  currentRole: UserRole;
  initialCollapsed?: boolean;
}

interface UseSidebarReturn extends SidebarState {
  toggleCollapse: () => void;
  handleNavigation: (path: string) => void;
  menuSections: ReturnType<typeof getMenuSections>;
}

export const useSidebar = ({ 
  initialCollapsed = false 
}: UseSidebarProps): UseSidebarReturn => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    isCollapsed: initialCollapsed,
    openSections: [],
    activeItem: location.pathname
  });

  const menuSections = useMemo(() => getMenuSections(), []);

  // Update active item when location changes
  useEffect(() => {
    setSidebarState(prev => {
      if (prev.activeItem !== location.pathname) {
        return {
          ...prev,
          activeItem: location.pathname
        };
      }
      return prev;
    });
  }, [location.pathname]);

  // No auto-expand logic to avoid infinite re-renders
  // Let the Sidebar component handle its own section opening logic

  const toggleCollapse = () => {
    setSidebarState(prev => ({
      ...prev,
      isCollapsed: !prev.isCollapsed,
      // Close all sections when collapsing
      openSections: prev.isCollapsed ? prev.openSections : []
    }));
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return {
    ...sidebarState,
    toggleCollapse,
    handleNavigation,
    menuSections
  };
};

// Hook to get user role from context/storage
export const useUserRole = (): UserRole => {
  // This would typically come from your authentication context
  // For now, returning a default role
  const [userRole] = useState<UserRole>(() => {
    // Try to get from localStorage or context
    const savedRole = localStorage.getItem('userRole') as UserRole;
    return savedRole || 'station_staff'; // Default role
  });

  return userRole;
};

// Hook to manage user session
export const useUserSession = () => {
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const updateUserInfo = (info: any) => {
    setUserInfo(info);
    localStorage.setItem('userInfo', JSON.stringify(info));
  };

  const clearUserSession = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userRole');
  };

  return {
    userInfo,
    updateUserInfo,
    clearUserSession
  };
};