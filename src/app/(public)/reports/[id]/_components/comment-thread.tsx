"use client";

import { ArrowDown, ArrowUp, Award, Flag, Reply, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createReportComment } from "@/actions/comments";
import { voteComment } from "@/actions/votes";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/contexts/session-context";
import { useOnboardingCheck } from "@/hooks/use-onboarding-check";
import { formatDistanceToNow } from "@/lib/date-utils";
import { ReportCommentForm } from "./comment-form";

type CommentWithMeta = Awaited<
  ReturnType<typeof import("@/actions/comments").getReportComments>
>[number];

interface CommentThreadProps {
  comment: CommentWithMeta;
  reportId: string;
  onCommentAdded: () => void;
}

const tierLabels: Record<string, string> = {
  observer: "Observer",
  contributor: "Contributor",
  trusted: "Trusted",
  expert: "Expert",
};

function ensureHandle(value?: string | null) {
  if (!value) return null;
  return value.startsWith("@") ? value : `@${value}`;
}

function getInitials(value: string) {
  const clean = value.replace(/@/g, "").trim();
  if (!clean) return "??";
  const parts = clean.split(/\s+/);
  const initials = parts
    .map((part) => part.charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  return initials || clean.slice(0, 2).toUpperCase();
}

function formatNumber(value: number | null | undefined) {
  return value == null ? 0 : value;
}

export function ReportCommentThread({
  comment,
  reportId,
  onCommentAdded,
}: CommentThreadProps) {
  const { user } = useSession();
  const {
    checkOnboarding,
    showOnboardingModal,
    setShowOnboardingModal,
    pendingAction,
  } = useOnboardingCheck();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [upvotes, setUpvotes] = useState(formatNumber(comment.upvotes));
  const [downvotes, setDownvotes] = useState(formatNumber(comment.downvotes));

  const authorHandle =
    ensureHandle(comment.author?.displayUsername) ||
    ensureHandle(comment.author?.username) ||
    ensureHandle(comment.userId) ||
    "@anonymous";
  const authorDisplayName = comment.profile?.displayName || authorHandle;
  const timeAgo = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : "";
  const badges = comment.badges ?? [];
  const tier = comment.reputation?.tier
    ? (tierLabels[comment.reputation.tier] ?? comment.reputation.tier)
    : undefined;
  const reputationPoints = comment.reputation?.reputationPoints ?? null;

  const handleVote = async (voteType: "up" | "down") => {
    const canProceed = checkOnboarding("vote", async () => {
      await performVote(voteType);
    });

    if (!canProceed) {
      return;
    }

    await performVote(voteType);
  };

  const performVote = async (voteType: "up" | "down") => {
    if (!user) return;

    setIsVoting(true);
    try {
      const result = await voteComment(user.id, {
        commentId: comment.id,
        voteType,
      });

      if (!result?.success) {
        if (result?.error?.includes("onboarding")) {
          setShowOnboardingModal(true);
          return;
        }
        toast.error(result?.error || "Failed to vote");
        return;
      }

      onCommentAdded();
    } catch (error) {
      toast.error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async (content: string) => {
    const canProceed = checkOnboarding("reply", async () => {
      await performReply(content);
    });

    if (!canProceed) {
      return;
    }

    await performReply(content);
  };

  const performReply = async (content: string) => {
    if (!user) return;

    try {
      const result = await createReportComment(user.id, {
        reportId,
        parentId: comment.id,
        content,
      });

      if (!result?.success) {
        if (result?.error?.includes("onboarding")) {
          setShowOnboardingModal(true);
          return;
        }
        toast.error(result?.error || "Failed to post reply");
        return;
      }

      setShowReplyForm(false);
      onCommentAdded();
      toast.success("Reply posted!");
    } catch (error) {
      toast.error("Failed to post reply");
    }
  };

  return (
    <>
      <div className="space-y-3">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  {comment.author?.image ? (
                    <AvatarImage
                      src={comment.author.image}
                      alt={authorDisplayName}
                    />
                  ) : null}
                  <AvatarFallback>
                    {getInitials(authorDisplayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-foreground">
                      {authorDisplayName}
                    </span>
                    <span className="text-muted-foreground">
                      {authorHandle}
                    </span>
                    {tier && (
                      <Badge variant="outline" className="gap-1">
                        <Award className="h-3 w-3" />
                        {tier}
                        {reputationPoints != null
                          ? ` (${reputationPoints})`
                          : ""}
                      </Badge>
                    )}
                    {badges.slice(0, 2).map((badge) => (
                      <Badge key={badge.id} variant="secondary">
                        {badge.badgeName}
                      </Badge>
                    ))}
                    <span className="text-xs text-muted-foreground">
                      {timeAgo}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground whitespace-pre-line">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("up")}
                        disabled={isVoting}
                        className="gap-2 h-8"
                      >
                        <ArrowUp className="h-4 w-4" />
                        {formatNumber(upvotes)}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("down")}
                        disabled={isVoting}
                        className="gap-2 h-8"
                      >
                        <ArrowDown className="h-4 w-4" />
                        {formatNumber(downvotes)}
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className="gap-2 h-8"
                    >
                      <Reply className="h-4 w-4" />
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 h-8">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 h-8">
                      <Flag className="h-4 w-4" />
                      Report
                    </Button>
                  </div>
                  {showReplyForm && (
                    <div className="mt-3 border-t pt-3">
                      <ReportCommentForm
                        reportId={reportId}
                        parentId={comment.id}
                        onSubmit={handleReply}
                        onCancel={() => setShowReplyForm(false)}
                        onCommentAdded={onCommentAdded}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-12 space-y-3">
            {comment.replies.map((reply) => (
              <ReportCommentThread
                key={reply.id}
                comment={reply}
                reportId={reportId}
                onCommentAdded={onCommentAdded}
              />
            ))}
          </div>
        )}
      </div>
      <OnboardingModal
        open={showOnboardingModal}
        onOpenChange={setShowOnboardingModal}
        action={pendingAction || "perform this action"}
      />
    </>
  );
}
