import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CapabilityListFallback() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Capability Progress
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Core AI capabilities and their current status
        </p>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}
