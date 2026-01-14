"use client";

import type { getJobBySlug } from "@/actions/jobs";
import { JobStatusBadge } from "@/components/shared/job-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/date-utils";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface AtAGlanceProps {
  job: NonNullable<Job>;
}

const formatYear = (year: number | null) => {
  if (!year) return "2050+";
  return year.toString();
};

export function AtAGlance({ job }: AtAGlanceProps) {
  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-lg font-semibold">At a Glance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Automation Status:</p>
          <JobStatusBadge status={job.automationStatus} />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Primary Protection:</p>
          <p className="text-sm font-medium text-foreground">
            {job.capabilities?.[0]?.name || "N/A"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Timeline:</p>
          <p className="text-sm font-medium text-foreground">
            {formatYear(job.estimatedAutomationYear)} until major impact
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Confidence:</p>
          <p className="text-sm font-medium text-foreground capitalize">
            {job.confidenceLevel} ({job.capabilities?.length || 0} capabilities)
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Last Updated:</p>
          <p className="text-sm font-medium text-foreground">
            {formatDistanceToNow(job.updatedAt, { addSuffix: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
