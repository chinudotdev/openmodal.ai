"use client";

import { BarChart3 } from "lucide-react";
import { getCapabilities } from "@/actions/capabilities";
import { CapabilityList } from "@/components/agi-dashboard/capability-list";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";

export function CapabilityListContent() {
  const { data: capabilitiesData, isLoading: isCapabilitiesLoading } = useQuery({
    queryKey: ["capabilities", "progress_desc", 5, 0],
    queryFn: () => getCapabilities({}, "progress_desc", 5, 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const { data: allCapabilitiesData, isLoading: isTotalLoading } = useQuery({
    queryKey: ["capabilities", "progress_desc", 1000, 0],
    queryFn: () => getCapabilities({}, "progress_desc", 1000, 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const isLoading = isCapabilitiesLoading || isTotalLoading;
  const capabilities = capabilitiesData || [];
  const totalCount = allCapabilitiesData?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

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
