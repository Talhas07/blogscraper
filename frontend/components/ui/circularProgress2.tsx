"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // current value
  total?: number; // total value
  size?: number; // overall diameter
  strokeWidth?: number;
  className?: string;
  colorClass?: string; // e.g. text-green-500
  textClass?: string; // for the center %
  label?: string; // optional label (e.g., Implemented)
  labelClass?: string; // optional label style
}

const CircularProgress2 = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      total = 100,
      size = 160,
      strokeWidth = 10,
      className,
      colorClass = "text-blue-500",
      textClass = "text-lg font-semibold text-gray-700",
      label,
      labelClass = "text-sm text-muted-foreground mt-2",
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / total) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center", className)}
        style={{ width: size }}
      >
        <div
          className="relative"
          style={{
            width: size,
            height: size,
          }}
        >
          <svg width={size} height={size}>
            <circle
              stroke="#e5e7eb"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <circle
              className={cn("transition-all duration-300", colorClass)}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              r={radius}
              cx={size / 2}
              cy={size / 2}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(textClass)}>{Math.round(percentage)}%</span>
          </div>
        </div>

        {label && <div className={cn(labelClass)}>{label}</div>}
      </div>
    );
  }
);

CircularProgress2.displayName = "CircularProgress";

export { CircularProgress2 };
