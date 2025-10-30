import {
  MapPinIcon,
  TruckIcon,
  UserGroupIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  CurrencyDollarIcon,
  BoltIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

import type { SidebarSection } from '../types/sidebar';
import { UserRole } from '../types/sidebar';

export const getMenuSections = (): SidebarSection[] => [
  // Section for Station Staff
  {
    id: 'station-management',
    title: 'Quản lý trạm thuê',
    roles: [UserRole.STATION_STAFF],
    items: [
      {
        id: 'staff-dashboard',
        title: 'Dashboard',
        icon: <ChartBarIcon className="w-5 h-5" />,
        path: '/staff/dashboard',
        roles: [UserRole.STATION_STAFF]
      },
      {
        id: 'vehicle-handover',
        title: 'Giao - nhận xe',
        icon: <TruckIcon className="w-5 h-5" />,
        path: '/staff/vehicle-handover',
        roles: [UserRole.STATION_STAFF],
        children: [
          {
            id: 'available-vehicles',
            title: 'Xe có sẵn',
            icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
            path: '/staff/vehicles/available',
            roles: [UserRole.STATION_STAFF]
          },
          {
            id: 'booked-vehicles',
            title: 'Xe đã đặt trước',
            icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
            path: '/staff/vehicles/booked',
            roles: [UserRole.STATION_STAFF]
          },
          {
            id: 'rented-vehicles',
            title: 'Xe đang cho thuê',
            icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
            path: '/staff/vehicles/rented',
            roles: [UserRole.STATION_STAFF]
          }
        ]
      },
      {
        id: 'delivery-procedures',
        title: 'Thủ tục bàn giao',
        icon: <DocumentTextIcon className="w-5 h-5" />,
        path: '/staff/delivery-procedures',
        roles: [UserRole.STATION_STAFF]
      },
      {
        id: 'customer-verification',
        title: 'Xác thực khách hàng',
        icon: <UserIcon className="w-5 h-5" />,
        path: '/staff/customer-verification',
        roles: [UserRole.STATION_STAFF],
      }
    ]
  },
  
  // Section for Payment and Station Management (Station Staff)
  {
    id: 'station-operations',
    title: 'Vận hành trạm',
    roles: [UserRole.STATION_STAFF],
    items: [
      {
        id: 'payment-processing',
        title: 'Thanh toán tại điểm',
        icon: <CreditCardIcon className="w-5 h-5" />,
        path: '/staff/payment',
        roles: [UserRole.STATION_STAFF],
        children: [
          {
            id: 'rental-payment',
            title: 'Thanh toán phí thuê xe',
            icon: <CurrencyDollarIcon className="w-4 h-4" />,
            path: '/staff/payment/rental',
            roles: [UserRole.STATION_STAFF]
          },
          {
            id: 'deposit-collection',
            title: 'Đặt cọc hoặc hoàn cọc',
            icon: <CurrencyDollarIcon className="w-4 h-4" />,
            path: '/staff/payment/deposit',
            roles: [UserRole.STATION_STAFF]
          }
        ]
      },
      {
        id: 'vehicle-management',
        title: 'Quản lý xe tại điểm',
        icon: <TruckIcon className="w-5 h-5" />,
        path: '/staff/vehicle-management',
        roles: [UserRole.STATION_STAFF],
        children: [
          {
            id: 'battery-status',
            title: 'Trạng thái pin',
            icon: <BoltIcon className="w-4 h-4" />,
            path: '/staff/station-management/battery-status',
            roles: [UserRole.STATION_STAFF]
          },
          {
            id: 'technical-status',
            title: 'Tình trạng kỹ thuật',
            icon: <WrenchScrewdriverIcon className="w-4 h-4" />,
            path: '/staff/station-management/technical-status',
            roles: [UserRole.STATION_STAFF]
          },
          {
            id: 'incident-report',
            title: 'Báo cáo sự cố',
            icon: <ExclamationTriangleIcon className="w-4 h-4" />,
            path: '/staff/station-management/incident-report',
            roles: [UserRole.STATION_STAFF]
          }
        ]
      }
    ]
  },

  // Section for Admin - Fleet and Station Management
  {
    id: 'admin-fleet-management',
    title: 'Quản lý đội xe & điểm thuê',
    roles: [UserRole.ADMIN],
    items: [
      {
        id: 'admin-dashboard',
        title: 'Dashboard',
        icon: <ChartBarIcon className="w-5 h-5" />,
        path: '/admin/dashboard',
        roles: [UserRole.ADMIN]
      },
      {
        id: 'fleet-monitoring',
        title: 'Giám sát số lượng xe',
        icon: <TruckIcon className="w-5 h-5" />,
        path: '/admin/fleet',
        roles: [UserRole.ADMIN],
        children: [
          {
            id: 'fleet-overview',
            title: 'Tổng quan đội xe',
            icon: <ChartBarIcon className="w-4 h-4" />,
            path: '/admin/fleet/overview',
            roles: [UserRole.ADMIN]
          },
          {
            id: 'vehicle-distribution',
            title: 'Phân bổ xe theo điểm',
            icon: <MapPinIcon className="w-4 h-4" />,
            path: '/admin/fleet/distribution',
            roles: [UserRole.ADMIN]
          }
        ]
      },
      {
        id: 'vehicle-management',
        title: 'Quản lý xe',
        icon: <Cog6ToothIcon className="w-5 h-5" />,
        path: '/admin/vehicles',
        roles: [UserRole.ADMIN]
      },
      {
        id: 'station-management',
        title: 'Quản lý trạm',
        icon: <BuildingStorefrontIcon className="w-5 h-5" />,
        path: '/admin/stations',
        roles: [UserRole.ADMIN]
      },
      {
        id: 'transaction-history',
        title: 'Theo dõi lịch sử giao/nhận',
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
        path: '/admin/transactions',
        roles: [UserRole.ADMIN],
        children: [
          {
            id: 'delivery-history',
            title: 'Lịch sử giao xe',
            icon: <DocumentTextIcon className="w-4 h-4" />,
            path: '/admin/transactions/delivery',
            roles: [UserRole.ADMIN]
          },
          {
            id: 'return-history',
            title: 'Lịch sử nhận xe',
            icon: <DocumentTextIcon className="w-4 h-4" />,
            path: '/admin/transactions/return',
            roles: [UserRole.ADMIN]
          }
        ]
      },
      {
        id: 'staff-allocation',
        title: 'Điều phối nhân viên & xe',
        icon: <UserGroupIcon className="w-5 h-5" />,
        path: '/admin/allocation',
        roles: [UserRole.ADMIN],
        children: [
          {
            id: 'staff-schedule',
            title: 'Lịch làm việc nhân viên',
            icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
            path: '/admin/allocation/schedule',
            roles: [UserRole.ADMIN]
          },
          {
            id: 'peak-hour-management',
            title: 'Quản lý giờ cao điểm',
            icon: <ChartBarIcon className="w-4 h-4" />,
            path: '/admin/allocation/peak-hours',
            roles: [UserRole.ADMIN]
          }
        ]
      }
    ]
  },

  // Section for Admin - Customer and Staff Management
  {
    id: 'admin-user-management',
    title: 'Quản lý khách hàng & nhân viên',
    roles: [UserRole.ADMIN],
    items: [
      {
        id: 'customer-management',
        title: 'Quản lý khách hàng',
        icon: <UserGroupIcon className="w-5 h-5" />,
        path: '/admin/customers',
        roles: [UserRole.ADMIN],
        children: [
          {
            id: 'customer-profiles',
            title: 'Quản Lý Khách Hàng',
            icon: <UserIcon className="w-4 h-4" />,
            path: '/admin/customers/customer_management',
            roles: [UserRole.ADMIN]
          },
          {
            id: 'rental-history',
            title: 'Lịch sử thuê',
            icon: <DocumentTextIcon className="w-4 h-4" />,
            path: '/admin/customers/history',
            roles: [UserRole.ADMIN]
          },
          
        ]
      },
      {
        id: 'staff-management',
        title: 'Quản lý nhân viên',
        icon: <UserGroupIcon className="w-5 h-5" />,
        path: '/admin/staff',
        roles: [UserRole.ADMIN],
        children: [
          {
            id: 'staff-list',
            title: 'Danh sách nhân viên',
            icon: <UserIcon className="w-4 h-4" />,
            path: '/admin/staff/list',
            roles: [UserRole.ADMIN]
          },
          
        ]
      }
    ]
  },
  
];