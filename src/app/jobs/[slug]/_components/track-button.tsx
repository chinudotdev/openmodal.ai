"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Bell } from "lucide-react";
import { trackJob, untrackJob, isTrackingJob } from "@/actions/jobs";
import { useSession } from "@/contexts/session-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TrackButtonProps {
  jobId: string;
}

export function TrackButton({ jobId }: TrackButtonProps) {
  const { user } = useSession();
  const router = useRouter();
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial tracking state
  useEffect(() => {
    if (user) {
      isTrackingJob(jobId, user.id).then(setIsTracking);
    }
  }, [user, jobId]);

  const handleTrack = async () => {
    if (!user) {
      toast.error("Please sign in to track jobs");
      window.location.href = "/login";
      return;
    }

    setIsLoading(true);
    try {
      if (isTracking) {
        await untrackJob(jobId, user.id);
        setIsTracking(false);
        toast.success("Stopped tracking this job");
      } else {
        await trackJob(jobId, user.id);
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
  );
}

