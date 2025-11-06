"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AutomationProgressBarProps {
  progress: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showLabel?: boolean;
}

export function AutomationProgressBar({
  progress,
  className,
  size = "md",
  animated = false,
  showLabel = false,
}: AutomationProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(
    animated ? 0 : progress,
  );

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, animated]);

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-8",
  };

  // Color coding based on automation risk
  const getColorClass = (progress: number) => {
    if (progress <= 25) {
      return "bg-green-500"; // Safe
    } else if (progress <= 75) {
      return "bg-yellow-500"; // Partial
    } else if (progress < 100) {
      return "bg-orange-500"; // High Risk
    } else {
      return "bg-red-500"; // Automated
    }
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-muted",
        sizeClasses[size],
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000 ease-out",
          getColorClass(progress),
        )}
        style={{ width: `${animatedProgress}%` }}
      >
        {showLabel && size === "lg" && (
          <div className="flex h-full items-center justify-end px-3">
            <span className="text-xs font-semibold text-white">
              {progress}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

