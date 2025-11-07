"use client";

import { getStats } from "@/actions/capabilities";
import { StatsSection } from "@/components/agi-dashboard/stats-section";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";

export function StatsSectionContent() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["stats"],
    queryFn: () => getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <StatsSection
        stats={{
          reports: 0,
          experts: 0,
          papers: 0,
          jobsSafe: 0,
        }}
      />
    );
  }

  return <StatsSection stats={stats} />;
}
