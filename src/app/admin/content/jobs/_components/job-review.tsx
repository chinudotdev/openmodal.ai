import { AutomationRiskBadge } from "../../_components/automation-risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type JobData = Awaited<
  ReturnType<typeof import("@/actions/admin-content").getAdminJobById>
>;

interface JobReviewProps {
  initialJobData: NonNullable<JobData>;
}

export function JobReview({ initialJobData }: JobReviewProps) {
  const jobData = initialJobData;
  const tasks = jobData.tasks || [];

  const replaceableTasks = tasks.filter(
    (t) => t.automationStatus === "replaceable",
  );
  const partialTasks = tasks.filter((t) => t.automationStatus === "partial");
  const safeTasks = tasks.filter((t) => t.automationStatus === "safe");

  const replaceablePercentage = replaceableTasks.reduce(
    (sum, t) => sum + (t.percentageOfJob || 0),
    0,
  );
  const partialPercentage = partialTasks.reduce(
    (sum, t) => sum + (t.percentageOfJob || 0),
    0,
  );
  const safePercentage = safeTasks.reduce(
    (sum, t) => sum + (t.percentageOfJob || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/content/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Review Job</h1>
          <p className="text-muted-foreground mt-1">
            View job details: {jobData.title}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review: {jobData.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Validation Complete</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-green-600 dark:text-green-300">
              <li>✓ Basic information provided</li>
              <li>
                ✓ Task breakdown complete ({tasks.length} tasks,{" "}
                {Math.round(
                  replaceablePercentage + partialPercentage + safePercentage,
                )}
                %)
              </li>
              <li>
                ✓ Automation risk calculated: {jobData.automationPercentage}%
              </li>
            </ul>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Automation Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Risk</span>
                  <AutomationRiskBadge
                    percentage={jobData.automationPercentage}
                    status={jobData.automationStatus}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Task Breakdown:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    • {replaceableTasks.length} tasks replaceable (
                    {replaceablePercentage.toFixed(1)}%)
                  </li>
                  <li>
                    • {partialTasks.length} tasks partially automatable (
                    {partialPercentage.toFixed(1)}%)
                  </li>
                  <li>
                    • {safeTasks.length} tasks safe ({safePercentage.toFixed(1)}
                    %)
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Status:</p>
                <p className="text-sm text-muted-foreground">
                  {jobData.automationStatus === "safe"
                    ? "🟢 Safe - Role well-protected by unsolved capabilities"
                    : jobData.automationStatus === "partial"
                      ? "🟡 Evolving - Role changing but not disappearing"
                      : jobData.automationStatus === "high_risk"
                        ? "🔴 High Risk - Significant automation expected"
                        : "⚫ Automated - Role has been fully automated"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Publication Status</p>
                <Badge variant={jobData.verified ? "default" : "secondary"}>
                  {jobData.verified ? "Published" : "Draft"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {jobData.verified
                    ? "This job is visible to all users"
                    : "This job is only visible to admins"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/content/jobs">← Back to Jobs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
