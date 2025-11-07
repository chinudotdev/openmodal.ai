"use client";

import { Bell, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isTrackingJob, trackJob, untrackJob } from "@/actions/jobs";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/session-context";
import { useOnboardingCheck } from "@/hooks/use-onboarding-check";

interface TrackButtonProps {
  jobId: string;
}

export function TrackButton({ jobId }: TrackButtonProps) {
  const { user } = useSession();
  const router = useRouter();
  const {
    checkOnboarding,
    showOnboardingModal,
    setShowOnboardingModal,
    pendingAction,
  } = useOnboardingCheck();
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial tracking state
  useEffect(() => {
    if (user) {
      isTrackingJob(jobId, user.id).then(setIsTracking);
    }
  }, [user, jobId]);

  const handleTrack = async () => {
    // Check onboarding before tracking
    const canProceed = checkOnboarding("track jobs", async () => {
      await performTrack();
    });

    if (!canProceed) {
      return;
    }

    await performTrack();
  };

  const performTrack = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (isTracking) {
        const result = await untrackJob(jobId, user.id);

        // Handle backend error responses
        if (result && !result.success) {
          if (result.error?.includes("onboarding")) {
            setShowOnboardingModal(true);
            return;
          }
          toast.error(result.error || "Failed to update tracking");
          return;
        }

        setIsTracking(false);
        toast.success("Stopped tracking this job");
      } else {
        const result = await trackJob(jobId, user.id);

        // Handle backend error responses
        if (result && !result.success) {
          if (result.error?.includes("onboarding")) {
            setShowOnboardingModal(true);
            return;
          }
          toast.error(result.error || "Failed to update tracking");
          return;
        }

        setIsTracking(true);
        toast.success("You'll get notified of updates");
      }
    } catch (error) {
      toast.error("Failed to update tracking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleTrack}
        disabled={isLoading}
        variant={isTracking ? "default" : "outline"}
        className="gap-2"
      >
        {isTracking ? (
          <>
            <Check className="h-4 w-4" />
            Tracking
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" />
            Track
          </>
        )}
      </Button>
      <OnboardingModal
        open={showOnboardingModal}
        onOpenChange={setShowOnboardingModal}
        action={pendingAction || "track jobs"}
      />
    </>
  );
}
