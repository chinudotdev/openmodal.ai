"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  progress: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showLabel?: boolean;
  gradient?: boolean;
}

export function ProgressBar({
  progress,
  className,
  size = "md",
  animated = false,
  showLabel = false,
  gradient = false,
}: ProgressBarProps) {
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
          gradient
            ? "bg-gradient-to-r from-primary to-primary/80"
            : "bg-primary",
        )}
        style={{ width: `${animatedProgress}%` }}
      >
        {showLabel && size === "lg" && (
          <div className="flex h-full items-center justify-end px-3">
            <span className="text-xs font-semibold text-primary-foreground">
              {progress}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
