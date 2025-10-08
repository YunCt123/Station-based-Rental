import React from "react";

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  maxValue,
  color,
  showPercentage = true,
}) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600 text-sm">{label}</span>
        {showPercentage && (
          <span
            className={`font-semibold text-sm ${color.replace("bg-", "text-")}`}
          >
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};
