import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { checkExpertEligibility } from "@/actions/gamification";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoleProgressionCardProps {
  userId: string;
  currentTier: string;
  reputationPoints: number;
}

export async function RoleProgressionCard({
  userId,
  currentTier,
  reputationPoints,
}: RoleProgressionCardProps) {
  // Only show for contributors who can become experts
  if (currentTier !== "contributor" && currentTier !== "trusted") {
    return null;
  }

  const eligibility = await checkExpertEligibility(userId);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!eligibility.eligible && !eligibility.requirements) {
    return null;
  }

  const requirements = eligibility.requirements || {
    verifiedReports: { required: 15, current: 0, met: false },
    reputationPoints: { required: 100, current: 0, met: false },
    accountAge: { required: 30, current: 0, met: false },
  };

  const nextRole = currentTier === "contributor" ? "Expert" : "Expert";
  const allMet = requirements.verifiedReports.met && requirements.reputationPoints.met && requirements.accountAge.met;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress to Next Role: {nextRole}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {requirements.verifiedReports.met ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              {requirements.verifiedReports.current}/{requirements.verifiedReports.required} Verified reports
            </span>
          </div>
          <div className="flex items-center gap-2">
            {requirements.reputationPoints.met ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              {requirements.reputationPoints.current}/{requirements.reputationPoints.required} Reputation points
            </span>
          </div>
          <div className="flex items-center gap-2">
            {requirements.accountAge.met ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              Account age: {requirements.accountAge.current}/{requirements.accountAge.required} days
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your account must be at least 30 days old</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {allMet ? (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              🎉 Congratulations! You're eligible to become an Expert!
            </p>
            {session?.user && (
              <Button asChild>
                <Link href="/dashboard/apply-expert">Apply now</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="pt-2 border-t">
            {!requirements.accountAge.met && (
              <p className="text-sm text-muted-foreground">
                {requirements.accountAge.required - requirements.accountAge.current} more days until you can apply!
              </p>
            )}
            {requirements.accountAge.met && (
              <p className="text-sm text-muted-foreground">
                OR get a referral from a Moderator
              </p>
            )}
            <Link
              href="/dashboard/apply-expert"
              className="text-xs text-muted-foreground hover:text-foreground mt-2 block"
            >
              Learn about {nextRole} role →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

