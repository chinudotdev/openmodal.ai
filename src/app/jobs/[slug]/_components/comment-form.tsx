"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createJobComment } from "@/actions/jobs";
import { useSession } from "@/contexts/session-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  jobId: string;
  parentId?: string;
  onSubmit?: (content: string) => Promise<void>;
  onCancel?: () => void;
  onCommentAdded?: () => void;
}

export function CommentForm({
  jobId,
  parentId,
  onSubmit,
  onCancel,
  onCommentAdded,
}: CommentFormProps) {
  const { user } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to comment");
      window.location.href = "/login";
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(content);
      } else {
        await createJobComment(jobId, user.id, content, parentId);
        toast.success("Comment posted!");
      }
      setContent("");
      onCommentAdded?.();
      router.refresh();
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Write a comment..."}
        rows={3}
        className="resize-none"
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : parentId ? "Reply" : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}
