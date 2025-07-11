"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // from 0 to 100
  size?: number; // optional override via props or Tailwind
  strokeWidth?: number;
  className?: string;
  colorClass?: string; // optional stroke color (like 'text-blue-500')
  textClass?: string; // optional for customizing the inner % text
}

const CircularProgress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      size = 120,
      strokeWidth = 10,
      className,
      colorClass = "text-blue-500",
      textClass = "text-sm font-medium text-gray-800",
    },
    ref
  ) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn("relative flex items-center justify-center", className)}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
        }}
      >
        <svg width={size} height={size}>
          {/* Background Circle */}
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Progress Circle */}
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

        {/* Center Text */}
        <span className={cn("absolute", textClass)}>{Math.round(value)}%</span>
      </div>
    );
  }
);

CircularProgress.displayName = "Progress";

export { CircularProgress };
