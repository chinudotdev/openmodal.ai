"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import type { FormApi } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { DeploymentReportInput } from "@/lib/validations";

interface DeploymentStep4Props {
  // @ts-expect-error - TanStack Form type compatibility
  form: FormApi<Partial<DeploymentReportInput>>;
  onBack: () => void;
  formData: DeploymentReportInput;
}

export function DeploymentStep4({
  form,
  onBack,
  formData: _formData,
}: DeploymentStep4Props) {
  // Subscribe to form state changes to ensure we have the latest data
  const [formData, setFormData] = useState<DeploymentReportInput>(
    form.state.values as DeploymentReportInput,
  );

  useEffect(() => {
    const subscription = form.store.subscribe((state: any) => {
      if (state.values) {
        setFormData(state.values as DeploymentReportInput);
      }
    });
    return () => subscription();
  }, [form]);
  const formatDate = (date?: Date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatSource = (source?: string) => {
    switch (source) {
      case "work_at_company":
        return "I work/worked there";
      case "news_article":
        return "News article";
      case "public_announcement":
        return "Public announcement";
      case "industry_knowledge":
        return "Industry knowledge";
      case "other":
        return `Other${formData.step3?.sourceOther ? `: ${formData.step3.sourceOther}` : ""}`;
      default:
        return "Not specified";
    }
  };

  const formatDeploymentStatus = (status?: string) => {
    switch (status) {
      case "fully_deployed":
        return "Fully deployed (in production)";
      case "pilot":
        return "Pilot/testing phase";
      case "announced":
        return "Announced but not deployed";
      case "failed":
        return "Deployment failed/cancelled";
      default:
        return "Not specified";
    }
  };

  const formatImpactType = (type?: string) => {
    switch (type) {
      case "completely_replaced":
        return "Completely replaced (workers laid off)";
      case "partially_replaced":
        return "Partially replaced (reduced headcount)";
      case "augmented":
        return "Augmented (workers still needed but fewer)";
      case "no_job_loss":
        return "No job loss yet";
      default:
        return "Not specified";
    }
  };

  const formatPerformance = (perf?: string) => {
    switch (perf) {
      case "better_than_humans":
        return "Better than humans";
      case "about_same":
        return "About the same";
      case "worse_improving":
        return "Worse but improving";
      case "worse_not_improving":
        return "Worse and not improving";
      default:
        return "Not specified";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Basic Information</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Navigate back to step 1
                  // This would be handled by the parent component
                }}
              >
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Job Title
                </p>
                <p className="text-sm">{formData.step1?.jobTitle || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Technology
                </p>
                <p className="text-sm">{formData.step1?.technology || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Company
                </p>
                <p className="text-sm">
                  {formData.step1?.company || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Location
                </p>
                <p className="text-sm">
                  {[
                    formData.step1?.city,
                    formData.step1?.stateProvince,
                    formData.step1?.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Impact Data</span>
              <Button type="button" variant="ghost" size="sm">
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Deployment Status
                </p>
                <p className="text-sm">
                  {formatDeploymentStatus(formData.step2?.deploymentStatus)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Deployment Date
                </p>
                <p className="text-sm">
                  {formatDate(formData.step2?.deploymentDate)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Workers Affected
                </p>
                <p className="text-sm">
                  {formData.step2?.workersAffected || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Impact Type
                </p>
                <p className="text-sm">
                  {formatImpactType(formData.step2?.impactType)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Automation Percentage
                </p>
                <p className="text-sm">
                  {formData.step2?.automationPercentage || 0}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Performance
                </p>
                <p className="text-sm">
                  {formatPerformance(formData.step2?.performanceComparison)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Description & Evidence</span>
              <Button type="button" variant="ghost" size="sm">
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {formData.step3?.description || "N/A"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Evidence Links ({formData.step3?.evidenceLinks?.length || 0})
              </p>
              <div className="space-y-2">
                {formData.step3?.evidenceLinks?.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    {link}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Source
              </p>
              <p className="text-sm">{formatSource(formData.step3?.source)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox id="guideline1" required />
              <Label htmlFor="guideline1" className="text-sm">
                I confirm this information is accurate
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="guideline2" required />
              <Label htmlFor="guideline2" className="text-sm">
                I have evidence to support my claims
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="guideline3" required />
              <Label htmlFor="guideline3" className="text-sm">
                I'm not submitting spam or false information
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">
              Your report will be reviewed by moderators before appearing
              publicly.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll earn +100 reputation points once approved!
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="flex items-center justify-between gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={form.state.isSubmitting}>
            {form.state.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {form.state.isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </div>
  );
}
