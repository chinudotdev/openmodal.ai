"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/contexts/session-context";

/**
 * Hook to check if user can perform actions (signed in and onboarding completed)
 * Returns a function that checks onboarding and shows modal if needed
 */
export function useOnboardingCheck() {
  const { user } = useSession();
  const router = useRouter();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const checkOnboarding = useCallback(
    (action: string, callback?: () => void | Promise<void>) => {
      // Check if user is signed in
      if (!user) {
        toast.error("Please sign in to continue");
        router.push("/login");
        return false;
      }

      // Check if onboarding is completed
      if (!user.onboardingCompleted) {
        setPendingAction(action);
        setShowOnboardingModal(true);
        return false;
      }

      // If callback provided and checks pass, execute it
      if (callback) {
        void callback();
      }

      return true;
    },
    [user, router],
  );

  return {
    checkOnboarding,
    showOnboardingModal,
    setShowOnboardingModal,
    pendingAction,
  };
}
