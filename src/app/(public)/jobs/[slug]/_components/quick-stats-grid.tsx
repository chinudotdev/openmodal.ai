"use client";

import { AlertTriangle, Calendar, Gauge, TrendingUp } from "lucide-react";
import type { getJobBySlug } from "@/actions/jobs";
import { Card, CardContent } from "@/components/ui/card";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface QuickStatsGridProps {
  job: NonNullable<Job>;
}

export function QuickStatsGrid({ job }: QuickStatsGridProps) {
  const formatRiskLevel = (level: "low" | "medium" | "high" | "critical") => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
        <CardContent className="pt-0 px-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Automation Risk</p>
              <p className="text-lg font-semibold text-foreground">
                {job.automationRiskPercentage}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
        <CardContent className="pt-0 px-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Level</p>
              <p className="text-lg font-semibold text-foreground capitalize">
                {formatRiskLevel(job.riskLevel)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {job.timelineEstimate && (
        <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
          <CardContent className="pt-0 px-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="text-lg font-semibold text-foreground">
                  {job.timelineEstimate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
        <CardContent className="pt-0 px-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confidence</p>
              <p className="text-lg font-semibold text-foreground capitalize">
                {job.confidence}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
