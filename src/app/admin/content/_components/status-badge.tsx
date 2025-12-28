import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "hidden" | "draft" | "published";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    active: "bg-green-500/10 text-green-700 dark:text-green-400",
    hidden: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    draft: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    published: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  };

  const labels = {
    active: "Active",
    hidden: "Hidden",
    draft: "Draft",
    published: "Published",
  };

  return (
    <Badge className={cn(variants[status], className)}>{labels[status]}</Badge>
  );
}
