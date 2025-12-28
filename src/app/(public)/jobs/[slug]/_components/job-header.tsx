import { MessageSquare } from "lucide-react";
import type { getJobBySlug } from "@/actions/jobs";
import { AutomationProgressBar } from "@/components/shared/automation-progress-bar";
import { JobStatusBadge } from "@/components/shared/job-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/date-utils";
import { ShareButton } from "./share-button";
import { TrackButton } from "./track-button";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface JobHeaderProps {
  job: NonNullable<Job>;
}

export function JobHeader({ job }: JobHeaderProps) {
  const getStatusMessage = (status: string, percentage: number) => {
    if (status === "safe") {
      return "This job is well-protected by unsolved AI capabilities";
    } else if (status === "partial") {
      return "This job is partially protected, some tasks can be automated";
    } else if (status === "high_risk") {
      return "This job is at high risk of automation";
    } else {
      return "This job has been fully automated";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title and Actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <JobStatusBadge status={job.automationStatus} />
            <h1 className="text-4xl font-bold text-foreground">{job.title}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {job.industry?.name || "Unknown"} | {job.category}
            </span>
            <span>•</span>
            <span>
              Updated {formatDistanceToNow(job.updatedAt, { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrackButton jobId={job.id} />
          <ShareButton slug={job.slug} />
          <Button variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Discuss
          </Button>
        </div>
      </div>

      {/* Automation Risk Meter */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Automation Risk
              </span>
              <span className="text-2xl font-bold text-primary">
                {job.automationPercentage}%
              </span>
            </div>
            <AutomationProgressBar
              progress={job.automationPercentage}
              size="lg"
              animated
            />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <JobStatusBadge status={job.automationStatus} />
                <span className="text-muted-foreground">
                  {getStatusMessage(
                    job.automationStatus,
                    job.automationPercentage,
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
