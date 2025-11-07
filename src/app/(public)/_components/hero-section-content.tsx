"use client";

import { getAGIProgress } from "@/actions/capabilities";
import { HeroSection } from "@/components/agi-dashboard/hero-section";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";

export function HeroSectionContent() {
  const {
    data: agiProgress,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["agi-progress"],
    queryFn: () => getAGIProgress(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !agiProgress) {
    return (
      <HeroSection
        agiProgress={{
          overall: 0,
          lastUpdated: "unknown",
          lastUpdatedBy: "community",
          contributors: 0,
          expertForecasts: 0,
          reports: 0,
        }}
      />
    );
  }

  return <HeroSection agiProgress={agiProgress} />;
}
