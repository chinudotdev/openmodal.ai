"use client";

import { cn } from "@/lib/utils";

interface ReportFormStepperProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ReportFormStepper({
  currentStep,
  totalSteps,
  className,
}: ReportFormStepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
