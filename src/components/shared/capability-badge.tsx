"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { type ImportanceLevel } from "@/db/schema/jobs";

interface CapabilityBadgeProps {
  capabilityId: string;
  capabilitySlug: string;
  capabilityName: string;
  progress: number;
  importance?: ImportanceLevel;
  className?: string;
}

export function CapabilityBadge({
  capabilityId,
  capabilitySlug,
  capabilityName,
  progress,
  importance,
  className,
}: CapabilityBadgeProps) {
  const getProgressColor = (progress: number) => {
    if (progress <= 25) {
      return "text-red-600";
    } else if (progress <= 75) {
      return "text-yellow-600";
    } else {
      return "text-green-600";
    }
  };

  const importanceLabels = {
    critical: "Critical",
    important: "Important",
    minor: "Minor",
  };

  return (
    <Link href={`/capabilities/${capabilitySlug}`}>
      <Badge
        variant="outline"
        className={cn(
          "group inline-flex items-center gap-2 transition-colors hover:border-primary hover:bg-primary/5",
          className,
        )}
      >
        <span className="font-medium">{capabilityName}</span>
        <span
          className={cn("text-xs font-semibold", getProgressColor(progress))}
        >
          {progress}%
        </span>
        {importance && (
          <span className="text-xs text-muted-foreground">
            [{importanceLabels[importance]}]
          </span>
        )}
        <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
      </Badge>
    </Link>
  );
}
