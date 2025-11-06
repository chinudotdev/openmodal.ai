"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, MessageSquare, Reply } from "lucide-react";
import { voteJobComment, createJobComment } from "@/actions/jobs";
import { useSession } from "@/contexts/session-context";
import { toast } from "sonner";
import { CommentForm } from "./comment-form";
import { formatDistanceToNow } from "@/lib/date-utils";

interface CommentThreadProps {
  comment: any;
  jobId: string;
  onCommentAdded: () => void;
}

export function CommentThread({
  comment,
  jobId,
  onCommentAdded,
}: CommentThreadProps) {
  const { user } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [upvotes, setUpvotes] = useState(comment.upvotes || 0);

  const handleVote = async () => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    setIsVoting(true);
    try {
      await voteJobComment(comment.id, user.id, "up");
      setUpvotes(upvotes + 1);
    } catch (error) {
      toast.error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async (content: string) => {
    if (!user) {
      toast.error("Please sign in to reply");
      return;
    }

    try {
      await createJobComment(jobId, user.id, content, comment.id);
      setShowReplyForm(false);
      onCommentAdded();
      toast.success("Reply posted!");
    } catch (error) {
      toast.error("Failed to post reply");
    }
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">
                    {comment.userId}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(comment.createdAt, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
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
  );
}
