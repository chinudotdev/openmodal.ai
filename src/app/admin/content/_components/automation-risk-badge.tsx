import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AutomationRiskBadgeProps {
  percentage: number;
  status: "safe" | "partial" | "high_risk" | "automated";
  className?: string;
}

export function AutomationRiskBadge({
  percentage,
  status,
  className,
}: AutomationRiskBadgeProps) {
  const variants = {
    safe: "bg-green-500/10 text-green-700 dark:text-green-400",
    partial: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    high_risk: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    automated: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  const labels = {
    safe: "Low Risk",
    partial: "Moderate Risk",
    high_risk: "High Risk",
    automated: "Automated",
  };

  const getRiskLabel = () => {
    if (status === "safe") return "Low Risk";
    if (status === "partial") return "Moderate Risk";
    if (status === "high_risk") return "High Risk";
    return "Automated";
  };

  return (
    <Badge className={cn(variants[status], className)}>
      {getRiskLabel()} ({percentage}%)
    </Badge>
  );
}

