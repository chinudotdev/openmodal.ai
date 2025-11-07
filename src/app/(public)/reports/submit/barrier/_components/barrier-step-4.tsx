"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import type { FormApi } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { BarrierReportInput } from "@/lib/validations";

interface BarrierStep4Props {
  // @ts-expect-error - TanStack Form type compatibility
  form: FormApi<Partial<BarrierReportInput>>;
  onBack: () => void;
  formData: BarrierReportInput;
}

export function BarrierStep4({
  form,
  onBack,
  formData: _formData,
}: BarrierStep4Props) {
  // Subscribe to form state changes to ensure we have the latest data
  const [formData, setFormData] = useState<BarrierReportInput>(
    form.state.values as BarrierReportInput,
  );

  useEffect(() => {
    const subscription = form.store.subscribe((state: any) => {
      if (state.values) {
        setFormData(state.values as BarrierReportInput);
      }
    });
    return () => subscription();
  }, [form]);
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

  const formatBarrierType = (type?: string) => {
    switch (type) {
      case "regulatory":
        return "Regulatory";
      case "technical":
        return "Technical";
      case "cost":
        return "Cost";
      case "safety":
        return "Safety";
      case "trust":
        return "Trust";
      case "other":
        return "Other";
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
              <Button type="button" variant="ghost" size="sm">
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
              <span>Barrier Details</span>
              <Button type="button" variant="ghost" size="sm">
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Barrier Type
                </p>
                <p className="text-sm">
                  {formatBarrierType(formData.step2?.barrierType)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Estimated Solve Date
                </p>
                <p className="text-sm">
                  {formData.step2?.estimatedSolveDate || "Not specified"}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Barrier Description
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {formData.step2?.barrierDescription || "N/A"}
              </p>
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
              <Checkbox id="barrier_guideline1" required />
              <Label htmlFor="barrier_guideline1" className="text-sm">
                I confirm this information is accurate
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="barrier_guideline2" required />
              <Label htmlFor="barrier_guideline2" className="text-sm">
                I have evidence to support my claims
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox id="barrier_guideline3" required />
              <Label htmlFor="barrier_guideline3" className="text-sm">
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
              You'll earn +75 reputation points once approved!
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
