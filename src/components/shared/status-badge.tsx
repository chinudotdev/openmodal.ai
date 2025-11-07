import { Badge } from "@/components/ui/badge";
import type { StatusType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    solved: {
      label: "Solved",
      variant: "default" as const,
      dotClassName: "bg-primary",
    },
    partial: {
      label: "Partial",
      variant: "secondary" as const,
      dotClassName: "bg-muted-foreground",
    },
    unsolved: {
      label: "Unsolved",
      variant: "destructive" as const,
      dotClassName: "bg-destructive",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClassName)} />
      {config.label}
    </Badge>
  );
}
