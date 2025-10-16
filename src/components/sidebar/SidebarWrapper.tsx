import React from 'react';
import { Sidebar } from './Sidebar';
import { useUserRole, useUserSession } from '../../hooks/useSidebar';
import { getMenuSections } from '../../config/menuConfig';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarWrapperProps {
  logo?: React.ReactNode;
  className?: string;
}

export const SidebarWrapper: React.FC<SidebarWrapperProps> = ({ 
  logo, 
  className 
}) => {
  const currentRole = useUserRole();
  const { userInfo } = useUserSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Get menu sections dynamically based on current role
  const menuSections = React.useMemo(() => getMenuSections(), [currentRole]);

  // Map role to display text
  const getRoleDisplayText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'station_staff':
        return 'Nhân viên trạm';
      case 'customer':
        return 'Khách hàng';
      default:
        return role;
    }
  };

  // Get user info based on current role from URL, fallback to localStorage
  const userDisplayInfo = React.useMemo(() => {
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
    
    // Default user info based on current role
    return {
      name: currentRole === 'admin' ? 'Admin User' : 'Staff User',
      role: getRoleDisplayText(currentRole),
      avatar: null
    };
  }, [userInfo, currentRole]);

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