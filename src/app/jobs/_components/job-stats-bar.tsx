"use client";

import { Card, CardContent } from "@/components/ui/card";

interface JobStatsBarProps {
  totalJobs?: number;
  avgRisk?: number;
  protectedWorkers?: number;
}

export function JobStatsBar({
  totalJobs = 0,
  avgRisk = 0,
  protectedWorkers = 0,
}: JobStatsBarProps) {
  const formatWorkers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-foreground">{totalJobs}</p>
            <p className="text-sm text-muted-foreground">Jobs Analyzed</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-foreground">
              {avgRisk.toFixed(0)}%
            </p>
            <p className="text-sm text-muted-foreground">Avg Risk</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-foreground">
              {formatWorkers(protectedWorkers)}
            </p>
            <p className="text-sm text-muted-foreground">Protected Workers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

