import { BarChart3 } from "lucide-react";
import { CapabilityList } from "@/components/agi-dashboard/capability-list";
import { getCapabilities } from "@/actions/capabilities";

export async function CapabilityListContent() {
  const [capabilities, allCapabilities] = await Promise.all([
    getCapabilities({}, "progress_desc", 5, 0).catch(() => []),
    getCapabilities({}, "progress_desc", 1000, 0).catch(() => []),
  ]);

  const totalCount = allCapabilities.length;

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
      <CapabilityList capabilities={capabilities} totalCount={totalCount} />
    </div>
  );
}
