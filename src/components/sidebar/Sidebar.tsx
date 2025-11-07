import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { clearAuthData } from '../../utils/auth';
import type { SidebarProps, MenuItem, SidebarSection } from '../../types/sidebar';

interface Sidebar extends SidebarProps {
  sections: SidebarSection[];
  logo?: React.ReactNode;
  userInfo?: {
    name: string;
    role: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export const Sidebar: React.FC<Sidebar> = ({
  currentRole,
  currentPath,
  isCollapsed = false,
  onToggleCollapse,
  onNavigate,
  onLogout,
  sections,
  logo,
  userInfo
}) => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [openMenuItems, setOpenMenuItems] = useState<string[]>([]);
  const navigate = useNavigate();

  // Filter sections and menu items based on current role
  const filteredSections = sections.filter(section => 
    section.roles.includes(currentRole)
  ).map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(currentRole))
  }));

  const toggleSection = (sectionId: string) => {
    if (isCollapsed) return;
    
    setOpenSections(prev => {
      // Accordion behavior: chỉ mở một section tại một thời điểm
      if (prev.includes(sectionId)) {
        // Nếu section đang mở thì đóng nó
        return prev.filter(id => id !== sectionId);
      } else {
        // Nếu section đang đóng thì mở nó và đóng tất cả sections khác
        return [sectionId];
      }
    });
  };

  const toggleMenuItem = (itemId: string) => {
    if (isCollapsed) return;
    
    setOpenMenuItems(prev => {
      // Accordion behavior: chỉ mở một menu item tại một thời điểm trong cùng section
      if (prev.includes(itemId)) {
        // Nếu menu đang mở thì đóng nó
        return prev.filter(id => id !== itemId);
      } else {
        // Nếu menu đang đóng thì mở nó và đóng tất cả menus khác
        return [itemId];
      }
    });
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      toggleMenuItem(item.id);
    } else {
      onNavigate?.(item.path);
    }
  };

  const isItemActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  // Tự động mở section chứa trang hiện tại khi component mount
  useEffect(() => {
    // Tìm section chứa trang hiện tại
    const activeSection = filteredSections.find(section => 
      section.items.some(item => {
        if (currentPath === item.path || currentPath.startsWith(item.path + '/')) {
          return true;
        }
        if (item.children) {
          return item.children.some(child => 
            currentPath === child.path || currentPath.startsWith(child.path + '/')
          );
        }
        return false;
      })
    );
    
    // Chỉ mở section chứa trang hiện tại nếu chưa có section nào được mở
    if (activeSection) {
      setOpenSections(prev => prev.length === 0 ? [activeSection.id] : prev);
    }
  }, [currentPath, filteredSections]);

  const handleLogout = () => {
    // Sử dụng custom logout handler nếu có
    if (onLogout) {
      onLogout();
    } else {
      // Fallback to default logout logic
      try {
        clearAuthData();
      } catch {
        // ignore
      }
      onNavigate?.('/login');
      navigate('/login', { replace: true });
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenuItems.includes(item.id);
    const isActive = isItemActive(item.path);
    
    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => handleItemClick(item)}
          className={`
            w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${level > 0 ? 'ml-4' : ''}
            ${isActive 
              ? 'bg-blue-600 text-white shadow-md border-l-4 border-blue-800' 
              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-800'
            }
            ${isCollapsed ? 'justify-center' : 'justify-start'}
          `}
          title={isCollapsed ? item.title : undefined}
        >
          <span className={`flex-shrink-0 w-5 h-5 ${isActive ? 'text-white' : 'text-blue-600'}`}>
            {item.icon}
          </span>
          
          {!isCollapsed && (
            <>
              <span className="ml-3 flex-1 text-left">{item.title}</span>
              
              {item.badge && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
              
              {hasChildren && (
                <span className={`ml-2 ${isActive ? 'text-white' : 'text-blue-500'}`}>
                  {isOpen ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </span>
              )}
            </>
          )}
        </button>
        
        {hasChildren && !isCollapsed && isOpen && (
          <div className="mt-1 space-y-1 pl-2 border-l-2 border-blue-200 ml-3">
            {item.children!.map(childItem => renderMenuItem(childItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: SidebarSection) => {
    const isOpen = openSections.includes(section.id);
    
    return (
      <div key={section.id} className="mb-6">
        {!isCollapsed && (
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-blue-600 uppercase tracking-wider hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200"
          >
            <span>{section.title}</span>
            {isOpen ? (
              <ChevronUpIcon className="w-4 h-4 text-blue-700" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-blue-700" />
            )}
          </button>
        )}
        
        {(isCollapsed || isOpen) && (
          <div className="space-y-1 mt-2">
            {section.items.map(item => renderMenuItem(item))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`
      bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'}
      min-h-screen flex flex-col
    `}>
      {/* Header with Logo and Toggle */}
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between">
          {!isCollapsed && logo && (
            <div className="flex-1">
              <button onClick={() => onNavigate?.('/')} className="focus:outline-none">
              {logo}
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200"
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronLeftIcon className="w-5 h-5 text-blue-600" />
                )}
              </button>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* User Info */}
      {userInfo && !isCollapsed && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            {userInfo.avatar ? (
              <img
                src={userInfo.avatar}
                alt={userInfo.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-medium text-white">
                  {userInfo.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userInfo.name}
              </p>
              <p className="text-xs text-blue-600 truncate">
                {userInfo.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSections.map(section => renderSection(section))}
      </div>
    </div>
  );
};