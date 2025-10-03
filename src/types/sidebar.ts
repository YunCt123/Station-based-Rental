import type { ReactNode } from 'react';

export const UserRole = {
  ADMIN: 'admin',
  STATION_STAFF: 'station_staff',
  CUSTOMER: 'customer'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface MenuItem {
  id: string;
  title: string;
  icon: ReactNode;
  path: string;
  roles: UserRole[];
  children?: MenuItem[];
  badge?: string | number;
  isCollapsible?: boolean;
}

export interface SidebarSection {
  id: string;
  title: string;
  items: MenuItem[];
  roles: UserRole[];
}

export interface SidebarProps {
  currentRole: UserRole;
  currentPath: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: (path: string) => void;
}

export interface SidebarState {
  isCollapsed: boolean;
  openSections: string[];
  activeItem: string;
}