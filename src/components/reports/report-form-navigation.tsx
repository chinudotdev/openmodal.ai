"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReportFormNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
  canGoBack?: boolean;
  canGoNext?: boolean;
  nextLabel?: string;
  backLabel?: string;
  className?: string;
}

export function ReportFormNavigation({
  onBack,
  onNext,
  onSaveDraft,
  isSubmitting = false,
  canGoBack = true,
  canGoNext = true,
  nextLabel = "Next",
  backLabel = "Back",
  className,
}: ReportFormNavigationProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 pt-6 border-t",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSubmitting}
          >
            Save Draft
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={!canGoBack || isSubmitting}
          >
            {backLabel}
          </Button>
        )}
        {onNext && (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
