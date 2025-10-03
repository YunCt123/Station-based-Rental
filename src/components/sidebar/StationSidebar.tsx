// src/components/sidebar/StationSidebar.tsx

import { Sidebar, TextInput, Label, ToggleSwitch } from "flowbite-react";
import { FaSearch } from "react-icons/fa";

// Định nghĩa kiểu cho các bộ lọc
interface StationFilters {
  showAvailable: boolean;
  fastChargingOnly: boolean;
}

// Định nghĩa props cho component
interface StationSidebarProps {
  searchTerm: string;
  filters: StationFilters;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterChange: (filterName: keyof StationFilters, value: boolean) => void;
}

const StationSidebar = ({ searchTerm, filters, onSearchChange, onFilterChange }: StationSidebarProps) => {
  return (
    // Sử dụng Sidebar chỉ như một thẻ container
    <Sidebar aria-label="Station filter sidebar" className="w-full">
      {/* Cấu trúc nội dung bằng các thẻ div đơn giản */}
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search & Filter</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Input */}
        <div>
          <Label htmlFor="search" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Search by Name/Address
          </Label>
          <TextInput 
            id="search" 
            type="text" 
            icon={FaSearch} 
            placeholder="e.g., District 1" 
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        
        {/* Filters */}
        <div className="space-y-4 border-t dark:border-gray-700 pt-4">
          <ToggleSwitch
            checked={filters.showAvailable}
            label="Vehicles Available"
            onChange={(checked) => onFilterChange('showAvailable', checked)}
          />
          {/* <ToggleSwitch
            checked={filters.fastChargingOnly}
            label="Fast Charging Only"
            onChange={(checked) => onFilterChange('fastChargingOnly', checked)}
          /> */}
        </div>
      </div>
    </Sidebar>
  );
};

export default StationSidebar;