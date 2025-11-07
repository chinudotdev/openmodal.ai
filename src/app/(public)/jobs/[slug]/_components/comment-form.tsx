"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createJobComment } from "@/actions/jobs";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/session-context";
import { useOnboardingCheck } from "@/hooks/use-onboarding-check";

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
  const {
    checkOnboarding,
    showOnboardingModal,
    setShowOnboardingModal,
    pendingAction,
  } = useOnboardingCheck();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    // Check onboarding before submitting
    const canProceed = checkOnboarding("comment", async () => {
      await performSubmit();
    });

    if (!canProceed) {
      return;
    }

    await performSubmit();
  };

  const performSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(content);
      } else {
        const result = await createJobComment(
          jobId,
          user.id,
          content,
          parentId,
        );

        // Handle backend error responses
        if (result && !result.success) {
          if (result.error?.includes("onboarding")) {
            setShowOnboardingModal(true);
            return;
          }
          toast.error(result.error || "Failed to post comment");
          return;
        }

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
    <>
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
      <OnboardingModal
        open={showOnboardingModal}
        onOpenChange={setShowOnboardingModal}
        action={pendingAction || "comment"}
      />
    </>
  );
}
