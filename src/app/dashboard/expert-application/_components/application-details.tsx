"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/date-utils";
import { withdrawExpertApplication } from "@/actions/expert-application";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import type { expertApplication } from "@/db/schema";

interface ApplicationDetailsProps {
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
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
  const router = useRouter();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    if (!confirm("Are you sure you want to withdraw your application?")) {
      return;
    }

    setIsWithdrawing(true);
    const result = await withdrawExpertApplication(
      application.userId,
      application.id,
    );

    if (result.success) {
      toast.success("Application withdrawn");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to withdraw application");
    }
    setIsWithdrawing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Application Statement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {application.statement}
          </p>
          <p className="text-xs text-muted-foreground">
            Submitted:{" "}
            {new Date(application.submittedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What Moderators See</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Your verified reports</li>
            <li>Your comment history</li>
            <li>Your reputation: {application.voteCounts.approve} points</li>
            <li>Report quality scores</li>
            <li>Community feedback</li>
          </ul>
        </CardContent>
      </Card>

      {application.status === "pending" && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleWithdraw}
            disabled={isWithdrawing}
          >
            {isWithdrawing ? "Withdrawing..." : "Withdraw application"}
          </Button>
        </div>
      )}
    </div>
  );
}

