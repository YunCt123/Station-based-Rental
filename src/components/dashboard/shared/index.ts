export { StatCard } from "./StatCard";
export { FilterSection } from "./FilterSection";
export { PageHeader } from "./PageHeader";
export { QuickActions } from "./QuickActions";

// Types
export interface FilterOption {
  value: string;
  label: string;
}

export interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: "blue" | "green" | "red" | "orange" | "purple";
}
