import React from "react";

interface AlertCardProps {
  type: "warning" | "error" | "info" | "success";
  title: string;
  message: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  message,
  icon: Icon,
  action,
}) => {
  const getAlertStyles = () => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-yellow-50",
          iconColor: "text-yellow-500",
          titleColor: "text-yellow-800",
          messageColor: "text-yellow-600",
          buttonColor: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800",
        };
      case "error":
        return {
          bg: "bg-red-50",
          iconColor: "text-red-500",
          titleColor: "text-red-800",
          messageColor: "text-red-600",
          buttonColor: "bg-red-100 hover:bg-red-200 text-red-800",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          iconColor: "text-blue-500",
          titleColor: "text-blue-800",
          messageColor: "text-blue-600",
          buttonColor: "bg-blue-100 hover:bg-blue-200 text-blue-800",
        };
      case "success":
        return {
          bg: "bg-green-50",
          iconColor: "text-green-500",
          titleColor: "text-green-800",
          messageColor: "text-green-600",
          buttonColor: "bg-green-100 hover:bg-green-200 text-green-800",
        };
      default:
        return {
          bg: "bg-gray-50",
          iconColor: "text-gray-500",
          titleColor: "text-gray-800",
          messageColor: "text-gray-600",
          buttonColor: "bg-gray-100 hover:bg-gray-200 text-gray-800",
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className={`flex items-start space-x-3 p-3 ${styles.bg} rounded-lg`}>
      <Icon className={`w-5 h-5 ${styles.iconColor} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${styles.titleColor}`}>{title}</p>
        <p className={`text-xs ${styles.messageColor} mt-0.5`}>{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className={`mt-2 px-3 py-1 text-xs font-medium rounded ${styles.buttonColor} transition-colors`}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};
