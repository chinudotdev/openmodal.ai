"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateJob } from "@/actions/admin-content";
import { AutomationRiskBadge } from "../../_components/automation-risk-badge";
import { FormField } from "../../_components/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type JobData = Awaited<
  ReturnType<typeof import("@/actions/admin-content").getAdminJobById>
>;

interface JobFormStep3Props {
  jobId: string;
  initialJobData: JobData | null;
}

export function JobFormStep3({ jobId, initialJobData }: JobFormStep3Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryNote, setSummaryNote] = useState("");
  const [publishSettings, setPublishSettings] = useState({
    verified: false,
    sendNotification: false,
    featureOnHomepage: false,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { verified: boolean; summaryNote?: string }) =>
      updateJob(jobId, { verified: data.verified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success(
        publishSettings.verified
          ? "Job published successfully"
          : "Job saved as draft",
      );
      router.push("/admin/content/jobs");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save job");
    },
  });

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      updateMutation.mutate({
        verified: publishSettings.verified,
        summaryNote,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save job",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialJobData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Job not found</h2>
          <p className="text-muted-foreground">
            The job you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Add New Job</h1>
          <p className="text-muted-foreground mt-1">
            Step 3 of 3: Review & Publish
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
                ✓ Task breakdown complete ({jobData.tasks.length} tasks,{" "}
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

          <FormField
            label="Summary Note (optional)"
            hint="Add a summary explaining the overall automation outlook for this job."
          >
            <Textarea
              value={summaryNote}
              onChange={(e) => setSummaryNote(e.target.value)}
              placeholder="Software development is being augmented by AI tools..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {summaryNote.length}/500 characters
            </p>
          </FormField>

          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Status</Label>
                <RadioGroup
                  value={publishSettings.verified ? "published" : "draft"}
                  onValueChange={(value) =>
                    setPublishSettings((prev) => ({
                      ...prev,
                      verified: value === "published",
                    }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="draft" id="draft" />
                    <Label
                      htmlFor="draft"
                      className="font-normal cursor-pointer"
                    >
                      Draft (only visible to admins)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="published" id="published" />
                    <Label
                      htmlFor="published"
                      className="font-normal cursor-pointer"
                    >
                      Published (visible to all users)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {publishSettings.verified && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-notification"
                      checked={publishSettings.sendNotification}
                      onCheckedChange={(checked) =>
                        setPublishSettings((prev) => ({
                          ...prev,
                          sendNotification: checked === true,
                        }))
                      }
                    />
                    <Label
                      htmlFor="send-notification"
                      className="font-normal cursor-pointer"
                    >
                      Send notification to users tracking similar jobs
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="feature-homepage"
                      checked={publishSettings.featureOnHomepage}
                      onCheckedChange={(checked) =>
                        setPublishSettings((prev) => ({
                          ...prev,
                          featureOnHomepage: checked === true,
                        }))
                      }
                    />
                    <Label
                      htmlFor="feature-homepage"
                      className="font-normal cursor-pointer"
                    >
                      Feature on homepage (first 48 hours)
                    </Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/content/jobs/${jobId}/tasks`}>← Back</Link>
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Save as draft
                  setPublishSettings((prev) => ({ ...prev, verified: false }));
                  handlePublish();
                }}
                disabled={isSubmitting}
              >
                Save as Draft
              </Button>
              <Button
                onClick={() => {
                  setPublishSettings((prev) => ({ ...prev, verified: true }));
                  handlePublish();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing..." : "Publish Job ✓"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
