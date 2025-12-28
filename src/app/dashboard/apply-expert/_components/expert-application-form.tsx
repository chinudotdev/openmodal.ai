"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { submitExpertApplicationAction } from "./actions";

interface ExpertApplicationFormProps {
  eligibility: {
    eligible: boolean;
    requirements?: {
      verifiedReports: { required: number; current: number; met: boolean };
      reputationPoints: { required: number; current: number; met: boolean };
      accountAge: { required: number; current: number; met: boolean };
    };
    reason?: string;
  };
}

export function ExpertApplicationForm({
  eligibility,
}: ExpertApplicationFormProps) {
  const router = useRouter();
  const [statement, setStatement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requirements = eligibility.requirements || {
    verifiedReports: { required: 15, current: 0, met: false },
    reputationPoints: { required: 100, current: 0, met: false },
    accountAge: { required: 30, current: 0, met: false },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (statement.length < 150 || statement.length > 500) {
      toast.error("Statement must be between 150 and 500 characters");
      return;
    }

    setIsSubmitting(true);
    const result = await submitExpertApplicationAction(statement);

    if (result.success) {
      toast.success("Application submitted successfully!");
      router.push("/dashboard/expert-application");
    } else {
      toast.error(result.error || "Failed to submit application");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>What Experts Do</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            As an Expert, you'll be able to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Verify pending reports from Contributors</li>
            <li>Flag reports for Moderator review</li>
            <li>Suggest edits to improve report quality</li>
            <li>Access verification dashboard</li>
            <li>See detailed accuracy statistics</li>
          </ul>
          <p className="text-sm font-medium mt-4">
            Your upvotes/downvotes will count 2x!
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Qualifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            {requirements.verifiedReports.met ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              {requirements.verifiedReports.current}/
              {requirements.verifiedReports.required} verified reports submitted
            </span>
          </div>
          <div className="flex items-center gap-2">
            {requirements.reputationPoints.met ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              {requirements.reputationPoints.current}/
              {requirements.reputationPoints.required} reputation points (need{" "}
              {requirements.reputationPoints.required})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {requirements.accountAge.met ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              Account age: {requirements.accountAge.current}/
              {requirements.accountAge.required} days
            </span>
          </div>
        </CardContent>
      </Card>

      {eligibility.eligible ? (
        <Card>
          <CardHeader>
            <CardTitle>Application Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="statement">
                  Tell us why you'd be a good Expert (150-500 characters)
                </Label>
                <Textarea
                  id="statement"
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="I've been contributing reports about AI in the healthcare industry for the past month. As a medical data analyst, I see these deployments firsthand and want to help verify others' reports to ensure our platform has accurate data..."
                  className="mt-2 min-h-[120px]"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {statement.length}/500 characters
                  </p>
                  {statement.length > 0 && statement.length < 150 && (
                    <p className="text-xs text-destructive">
                      {150 - statement.length} more characters required
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">⚠️ What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Your application goes to all Moderators</li>
                  <li>They have 7 days to vote</li>
                  <li>You need 3 "Approve" votes to be accepted</li>
                  <li>You'll be notified of the decision</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    statement.length < 150 ||
                    statement.length > 500
                  }
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              You don't meet all the requirements yet. Keep contributing to
              become eligible!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
