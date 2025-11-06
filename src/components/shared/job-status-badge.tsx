import { type AutomationStatus } from "@/db/schema/jobs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JobStatusBadgeProps {
  status: AutomationStatus;
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const statusConfig = {
    safe: {
      label: "Safe",
      variant: "default" as const,
      dotClassName: "bg-green-500",
    },
    partial: {
      label: "Partial",
      variant: "secondary" as const,
      dotClassName: "bg-yellow-500",
    },
    high_risk: {
      label: "High Risk",
      variant: "destructive" as const,
      dotClassName: "bg-red-500",
    },
    automated: {
      label: "Automated",
      variant: "outline" as const,
      dotClassName: "bg-muted-foreground",
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
