import React from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
  }>;
  badgeText?: string;
  color?: "blue" | "red";
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  stats,
  badgeText,
  color = "blue",
}) => {
  const colorClasses = {
    blue: {
      border: "border-l-blue-500",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      badge: "bg-blue-500",
    },
    red: {
      border: "border-l-red-500",
      iconBg: "bg-red-100",
      iconText: "text-red-600",
      badge: "bg-red-500",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${colors.border}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className={`${colors.iconBg} p-3 rounded-lg`}>
            <div className={colors.iconText}>{icon}</div>
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {badgeText && (
                <span
                  className={`px-3 py-1 ${colors.badge} text-white text-sm rounded-full font-medium`}
                >
                  {badgeText}
                </span>
              )}
            </div>
            <p className="text-gray-600">{subtitle}</p>
            {stats && (
              <div className="flex items-center space-x-6 mt-3">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="mr-2">{stat.icon}</div>
                    <div>
                      <span className="font-medium text-gray-900">
                        {stat.value}
                      </span>
                      <span className="text-gray-500 ml-1">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <ClockIcon className="w-4 h-4" />
            <span>Cập nhật lúc: {new Date().toLocaleTimeString("vi-VN")}</span>
          </div>
          <div
            className={`${colors.badge} text-white px-3 py-1 rounded-md text-sm font-medium`}
          >
            Dashboard
          </div>
        </div>
      </div>
    </div>
  );
};
