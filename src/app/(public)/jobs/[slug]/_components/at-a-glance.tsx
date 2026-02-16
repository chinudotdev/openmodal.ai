"use client";

import type { getJobBySlug } from "@/actions/jobs";
import { JobStatusBadge } from "@/components/shared/job-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface AtAGlanceProps {
  job: NonNullable<Job>;
}

// Map riskLevel to old AutomationStatus format for badge component
const mapRiskLevelToStatus = (
  riskLevel: "low" | "medium" | "high" | "critical",
): "safe" | "partial" | "high_risk" | "automated" => {
  switch (riskLevel) {
    case "low":
      return "safe";
    case "medium":
      return "partial";
    case "high":
      return "high_risk";
    case "critical":
      return "automated";
  }
};

export function AtAGlance({ job }: AtAGlanceProps) {
  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-lg font-semibold">At a Glance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Risk Level:</p>
          <JobStatusBadge status={mapRiskLevelToStatus(job.riskLevel)} />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Primary Protection:</p>
          <p className="text-sm font-medium text-foreground">
            {job.capabilities?.[0]?.name || "N/A"}
          </p>
        </div>

        {job.timelineEstimate && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Timeline:</p>
            <p className="text-sm font-medium text-foreground">
              {job.timelineEstimate}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Confidence:</p>
          <p className="text-sm font-medium text-foreground capitalize">
            {job.confidence} ({job.capabilities?.length || 0} capabilities)
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Automation Risk:</p>
          <p className="text-sm font-medium text-foreground">
            {job.automationRiskPercentage}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
