"use client";

import { ProgressBar } from "@/components/shared/progress-bar";

interface ProgressMeterProps {
  percentage: number;
  className?: string;
}

export function ProgressMeter({ percentage, className }: ProgressMeterProps) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Overall Progress:
        </span>
        <span className="text-lg font-bold text-primary">{percentage}%</span>
      </div>
      <ProgressBar
        progress={percentage}
        size="lg"
        animated
        showLabel={false}
        gradient
      />
    </div>
  );
}
