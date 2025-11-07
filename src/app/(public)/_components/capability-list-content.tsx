import { getCapabilities } from "@/actions/capabilities";
import { CapabilityList } from "@/components/agi-dashboard/capability-list";
import { BarChart3 } from "lucide-react";

export async function CapabilityListContent() {
  const capabilities = await getCapabilities({}, "progress_desc", 5, 0);
  return (
    <div className="h-full flex flex-col">
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
      <CapabilityList capabilities={capabilities} />
    </div>
  );
}
