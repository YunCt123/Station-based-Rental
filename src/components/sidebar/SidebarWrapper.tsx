import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { useUserRole, useUserSession } from '../../hooks/useSidebar';
import { getMenuSections } from '../../config/menuConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { getCurrentUser } from '../../utils/auth';

interface SidebarWrapperProps {
  logo?: React.ReactNode;
  className?: string;
}

interface UserDisplayInfo {
  name: string;
  email?: string;
  role: string;
  avatar?: string | null;
}

export const SidebarWrapper: React.FC<SidebarWrapperProps> = ({ 
  logo, 
  className 
}) => {
  const currentRole = useUserRole();
  const { userInfo, updateUserInfo } = useUserSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [realUserInfo, setRealUserInfo] = useState<UserDisplayInfo | null>(null);
  const hasLoadedUserInfo = useRef(false);

  // Load real user info from API - only once
  useEffect(() => {
    const loadUserInfo = async () => {
      // Prevent multiple calls
      if (hasLoadedUserInfo.current) return;
      hasLoadedUserInfo.current = true;

      try {
        // First check localStorage for basic auth data
        const authUser = getCurrentUser();
        if (authUser) {
          console.log('Loading user info from API...');
          // Try to get detailed user info from API
          const userProfile = await userService.getCurrentUser();
          const realUserData: UserDisplayInfo = {
            name: userProfile.name || authUser.name || 'Người dùng',
            email: userProfile.email || authUser.email,
            role: userProfile.role || authUser.role || currentRole,
            avatar: null // Will be added later when backend supports it
          };
          
          console.log('User info loaded successfully:', realUserData);
          setRealUserInfo(realUserData);
          // Update localStorage with fresh data
          updateUserInfo(realUserData);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
        // Fallback to auth data if API fails
        const authUser = getCurrentUser();
        if (authUser) {
          const fallbackUserData: UserDisplayInfo = {
            name: authUser.name || 'Người dùng',
            email: authUser.email,
            role: authUser.role || currentRole,
            avatar: null
          };
          setRealUserInfo(fallbackUserData);
        }
      }
    };

    loadUserInfo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get menu sections dynamically based on current role
  const menuSections = React.useMemo(() => getMenuSections(), []);

  // Map role to display text
  const getRoleDisplayText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'station_staff':
        return 'Nhân viên trạm';
      case 'staff':
        return 'Nhân viên trạm';
      case 'customer':
        return 'Khách hàng';
      default:
        return role;
    }
  };

  // Get user info - prioritize real API data over localStorage
  const userDisplayInfo = React.useMemo(() => {
    // Use real user info if available
    if (realUserInfo) {
      return {
        name: realUserInfo.name,
        role: getRoleDisplayText(currentRole),
        avatar: realUserInfo.avatar
      };
    }

    // Fallback to localStorage data
    const storedUserInfo = userInfo || (() => {
      try {
        const stored = localStorage.getItem('userInfo');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();
    
    if (storedUserInfo) {
      return {
        name: storedUserInfo.name || 'Người dùng',
        role: getRoleDisplayText(currentRole),
        avatar: storedUserInfo.avatar
      };
    }
    
    // Final fallback based on current role
    return {
      name: currentRole === 'admin' ? 'Admin User' : 'Staff User',
      role: getRoleDisplayText(currentRole),
      avatar: null
    };
  }, [realUserInfo, userInfo, currentRole]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={className}>
      <Sidebar
        currentRole={currentRole}
        currentPath={location.pathname}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onNavigate={handleNavigation}
        sections={menuSections}
        logo={logo}
        userInfo={userDisplayInfo}
      />
    </div>
  );
};