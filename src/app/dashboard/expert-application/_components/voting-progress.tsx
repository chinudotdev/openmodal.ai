"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { CheckCircle2, XCircle, Minus } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";
import type { expertApplication } from "@/db/schema";

interface VotingProgressProps {
  application: typeof expertApplication.$inferSelect & {
    votes: Array<{
      moderatorId: string;
      vote: "approve" | "reject" | "abstain";
      votedAt: string;
    }>;
    voteCounts: {
      approve: number;
      reject: number;
      abstain: number;
      total: number;
      needed: number;
      totalModerators: number;
    };
  };
  voteCounts: {
    approve: number;
    reject: number;
    abstain: number;
    total: number;
    needed: number;
    totalModerators: number;
  };
}

export function VotingProgress({
  application,
  voteCounts,
}: VotingProgressProps) {
  const votingDeadline = application.votingDeadline
    ? new Date(application.votingDeadline)
    : null;
  const timeRemaining = votingDeadline
    ? formatDistanceToNow(votingDeadline, { addSuffix: false })
    : null;

  const progress = voteCounts.totalModerators > 0
    ? (voteCounts.total / voteCounts.totalModerators) * 100
    : 0;

  const neededApprovals = Math.max(0, voteCounts.needed - voteCounts.approve);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Voting Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {voteCounts.total}/{voteCounts.totalModerators} Moderators voted
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <ProgressBar progress={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">{voteCounts.approve} Approve</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm font-medium">{voteCounts.reject} Reject</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{voteCounts.abstain} Abstain</p>
            </div>
          </div>
        </div>

        {neededApprovals > 0 && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">
              Need {neededApprovals} more approval{neededApprovals !== 1 ? "s" : ""}!
            </p>
          </div>
        )}

        {votingDeadline && (
          <div className="text-sm text-muted-foreground">
            Time remaining: {timeRemaining}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

