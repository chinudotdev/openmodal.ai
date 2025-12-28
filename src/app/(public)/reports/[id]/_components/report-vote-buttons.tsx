"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { voteReport } from "@/actions/votes";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/session-context";

interface ReportVoteButtonsProps {
  reportId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVoteType: "up" | "down" | null;
  userId: string | null;
}

function formatNumber(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function ReportVoteButtons({
  reportId,
  initialUpvotes,
  initialDownvotes,
  initialUserVoteType,
  userId: initialUserId,
}: ReportVoteButtonsProps) {
  const router = useRouter();
  const { user } = useSession();
  const userId = initialUserId ?? user?.id ?? null;

  const [isVoting, setIsVoting] = useState(false);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVoteType, setUserVoteType] = useState<"up" | "down" | null>(
    initialUserVoteType,
  );

  const handleVote = async (voteType: "up" | "down") => {
    if (isVoting || !userId) {
      if (!userId) {
        toast.error("Please sign in to vote");
        router.push("/login");
      }
      return;
    }
    setIsVoting(true);

    try {
      const result = await voteReport(userId, {
        reportId,
        voteType,
      });

      if (!result?.success) {
        toast.error(result?.error || "Failed to update vote");
        return;
      }

      // Optimistically update vote counts
      if (userVoteType !== voteType) {
        if (voteType === "up") {
          setUpvotes((current) => current + 1);
          if (userVoteType === "down") {
            setDownvotes((current) => Math.max(0, current - 1));
          }
        } else {
          setDownvotes((current) => current + 1);
          if (userVoteType === "up") {
            setUpvotes((current) => Math.max(0, current - 1));
          }
        }
      }

      setUserVoteType(voteType);
      // Refresh to get updated vote counts from server
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update vote");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm md:flex-col md:items-center md:justify-start md:gap-3">
      <Button
        aria-label="Upvote report"
        variant={userVoteType === "up" ? "default" : "outline"}
        size="icon"
        disabled={isVoting}
        onClick={() => handleVote("up")}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <div className="text-xl font-semibold leading-none">
        {formatNumber(upvotes)}
      </div>
      <Button
        aria-label="Downvote report"
        variant={userVoteType === "down" ? "default" : "outline"}
        size="icon"
        disabled={isVoting}
        onClick={() => handleVote("down")}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <div className="text-xs font-medium text-muted-foreground">
        {formatNumber(downvotes)} down
      </div>
    </div>
  );
}
