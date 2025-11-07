"use client";

import { getActivities } from "@/actions/capabilities";
import { ActivityFeed } from "@/components/agi-dashboard/activity-feed";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";

export function ActivityFeedContent() {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["activities", 10],
    queryFn: () => getActivities(10),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !activities) {
    return <ActivityFeed activities={[]} />;
  }

  return <ActivityFeed activities={activities} />;
}
