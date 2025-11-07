"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createReportComment } from "@/actions/comments";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/session-context";
import { useOnboardingCheck } from "@/hooks/use-onboarding-check";

interface ReportCommentFormProps {
  reportId: string;
  parentId?: string;
  onSubmit?: (content: string) => Promise<void>;
  onCancel?: () => void;
  onCommentAdded?: () => void;
}

export function ReportCommentForm({
  reportId,
  parentId,
  onSubmit,
  onCancel,
  onCommentAdded,
}: ReportCommentFormProps) {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    const canProceed = checkOnboarding("comment", async () => {
      await performSubmit();
    });

    if (!canProceed) {
      return;
    }

    await performSubmit();
  };

  const performSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(content);
      } else {
        const result = await createReportComment(user.id, {
          reportId,
          parentId,
          content,
        });

        if (!result?.success) {
          if (result?.error?.includes("onboarding")) {
            setShowOnboardingModal(true);
            return;
          }
          toast.error(result?.error || "Failed to post comment");
          return;
        }
      }

      setContent("");
      onCommentAdded?.();
      router.refresh();
      toast.success(parentId ? "Reply posted!" : "Comment posted!");
    } catch (error) {
      console.error(error);
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
          onChange={(event) => setContent(event.target.value)}
          placeholder={
            parentId ? "Write a reply..." : "What are your thoughts?"
          }
          rows={parentId ? 3 : 4}
          className="resize-none"
        />
        <div className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : parentId ? "Reply" : "Comment"}
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
