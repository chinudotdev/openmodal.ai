import { AutomationRiskBadge } from "../../_components/automation-risk-badge";
import { StatusBadge } from "../../_components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/date-utils";
import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";
import { JobCardDeleteButton } from "./job-card-delete-button";

interface JobCardProps {
  job: {
    id: string;
    slug: string;
    title: string;
    industry: { id: string; name: string; icon?: string | null };
    category: string;
    automationPercentage: number;
    automationStatus: "safe" | "partial" | "high_risk" | "automated";
    totalTasks: number;
    trackingCount: number;
    reportCount: number;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  onDelete?: (jobId: string) => void;
}

export function JobCard({ job, onDelete }: JobCardProps) {
  const isDraft = !job.verified;
  const hasIssues = job.totalTasks === 0;

  return (
    <Card className={hasIssues ? "border-yellow-500/50" : ""}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                {isDraft && <StatusBadge status="draft" />}
                {hasIssues && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    ⚠️ Incomplete
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {job.industry.icon && <span className="mr-1">{job.industry.icon}</span>}
                {job.industry.name} • {job.category}
              </p>
            </div>
            <AutomationRiskBadge
              percentage={job.automationPercentage}
              status={job.automationStatus}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Tasks</p>
              <p className="font-medium">
                {job.totalTasks} {job.totalTasks === 0 && "⚠️"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tracking</p>
              <p className="font-medium">{job.trackingCount} users</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reports</p>
              <p className="font-medium">{job.reportCount}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(job.updatedAt, { addSuffix: true })}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/jobs/${job.slug}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/content/jobs/${job.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              {onDelete && (
                <JobCardDeleteButton jobId={job.id} onDelete={onDelete} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
