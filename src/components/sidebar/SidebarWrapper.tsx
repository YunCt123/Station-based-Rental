import React from 'react';
import { SimpleSidebar } from './SimpleSidebar';
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

  const menuSections = getMenuSections();

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

  const userDisplayInfo = userInfo ? {
    name: userInfo.name || 'Người dùng',
    role: getRoleDisplayText(currentRole),
    avatar: userInfo.avatar
  } : undefined;

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={className}>
      <SimpleSidebar
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