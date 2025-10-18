import React from "react";

interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: "blue" | "green" | "red" | "orange" | "purple";
}

interface QuickActionsProps {
  title: string;
  subtitle: string;
  actions: QuickAction[];
  headerIcon: React.ReactNode;
  color?: "blue" | "red";
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  title,
  subtitle,
  actions,
  headerIcon,
  color = "blue",
}) => {
  const headerColors = {
    blue: "bg-blue-50 border-l-blue-500",
    red: "bg-red-50 border-l-red-500",
  };

  const actionColors = {
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    red: "bg-red-500 hover:bg-red-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    purple: "bg-purple-500 hover:bg-purple-600",
  };

  return (
    <div
      className={`${headerColors[color]} rounded-lg shadow-sm p-6 border-l-4`}
    >
      <div className="flex items-center mb-6">
        <div
          className={`${
            color === "blue" ? "bg-blue-500" : "bg-red-500"
          } p-3 rounded-lg mr-4`}
        >
          <div className="text-white">{headerIcon}</div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${
              actionColors[action.color || "blue"]
            } text-white p-4 rounded-lg transition-colors hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="w-8 h-8">{action.icon}</div>
              <div>
                <p className="font-medium">{action.label}</p>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
