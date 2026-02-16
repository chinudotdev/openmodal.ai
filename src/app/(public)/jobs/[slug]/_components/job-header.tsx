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

const getStatusMessage = (riskLevel: "low" | "medium" | "high" | "critical", percentage: number) => {
  if (riskLevel === "low") {
    return "This job is well-protected by unsolved AI capabilities";
  } else if (riskLevel === "medium") {
    return "This job is partially protected, some tasks can be automated";
  } else if (riskLevel === "high") {
    return "This job is at high risk of automation";
  } else {
    return "This job has been fully automated";
  }
};

export function JobHeader({ job }: JobHeaderProps) {

  return (
    <div className="space-y-6">
      {/* Title and Actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <JobStatusBadge status={mapRiskLevelToStatus(job.riskLevel)} />
            <h1 className="text-4xl font-bold text-foreground">{job.name}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="capitalize">{job.category}</span>
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
      <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
        <CardContent className="pt-0 pb-6 px-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Automation Risk
              </span>
              <span className="text-2xl font-bold text-primary">
                {job.automationRiskPercentage}%
              </span>
            </div>
            <AutomationProgressBar
              progress={job.automationRiskPercentage}
              size="lg"
              animated
            />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <JobStatusBadge status={mapRiskLevelToStatus(job.riskLevel)} />
                <span className="text-muted-foreground">
                  {getStatusMessage(
                    job.riskLevel,
                    job.automationRiskPercentage,
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
