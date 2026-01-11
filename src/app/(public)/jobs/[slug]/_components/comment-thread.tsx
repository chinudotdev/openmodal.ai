"use client";

import { ArrowUp, Award, MessageSquare, Reply } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createJobComment, voteJobComment } from "@/actions/jobs";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/contexts/session-context";
import { useOnboardingCheck } from "@/hooks/use-onboarding-check";
import { formatDistanceToNow } from "@/lib/date-utils";
import { CommentForm } from "./comment-form";

interface CommentThreadProps {
  comment: any;
  jobId: string;
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

export function CommentThread({
  comment,
  jobId,
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
  const [upvotes, setUpvotes] = useState(comment.upvotes || 0);

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

  const handleVote = async () => {
    // Check onboarding before voting
    const canProceed = checkOnboarding("vote", async () => {
      await performVote();
    });

    if (!canProceed) {
      return;
    }

    await performVote();
  };

  const performVote = async () => {
    if (!user) return;

    setIsVoting(true);
    try {
      const result = await voteJobComment(comment.id, user.id, "up");

      // Handle backend error responses
      if (result && !result.success) {
        if (result.error?.includes("onboarding")) {
          setShowOnboardingModal(true);
          return;
        }
        toast.error(result.error || "Failed to vote");
        return;
      }

      // Refresh comment data to get updated vote count
      // The backend handles vote toggling, so we need to get the actual count
      // For now, we'll trigger a refresh by calling onCommentAdded
      // In a full implementation, you'd fetch the updated comment data
      onCommentAdded();
    } catch (error) {
      toast.error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async (content: string) => {
    // Check onboarding before replying
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
      const result = await createJobComment(
        jobId,
        user.id,
        content,
        comment.id,
      );

      // Handle backend error responses
      if (result && !result.success) {
        if (result.error?.includes("onboarding")) {
          setShowOnboardingModal(true);
          return;
        }
        toast.error(result.error || "Failed to post reply");
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
                    {badges.slice(0, 2).map((badge: any) => (
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
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVote}
                  disabled={isVoting}
                  className="gap-2 h-8"
                >
                  <ArrowUp className="h-4 w-4" />
                  {upvotes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="gap-2 h-8"
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </Button>
              </div>

              {showReplyForm && (
                <div className="mt-3 border-t pt-3">
                  <CommentForm
                    jobId={jobId}
                    parentId={comment.id}
                    onSubmit={handleReply}
                    onCancel={() => setShowReplyForm(false)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-8 space-y-3">
            {comment.replies.map((reply: any) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                jobId={jobId}
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
