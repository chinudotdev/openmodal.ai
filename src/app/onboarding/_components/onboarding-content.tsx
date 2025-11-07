"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  completeOnboarding,
  getOnboardingStatus,
  getOnboardingStepData,
  saveOnboardingStep,
  skipOnboarding,
} from "@/actions/onboarding";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/contexts/session-context";
import { OnboardingCompletion } from "./onboarding-completion";
import { OnboardingWelcome } from "./onboarding-welcome";
import { StepAutomationExperience } from "./step-automation-experience";
import { StepBasicInfo } from "./step-basic-info";
import { StepPlatformIntent } from "./step-platform-intent";
import { StepProfessionalBackground } from "./step-professional-background";

export function OnboardingContent() {
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();

  // Fetch onboarding status
  const { data: status, isLoading: isStatusLoading } = useQuery({
    queryKey: ["onboarding-status", user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      return getOnboardingStatus(user.id);
    },
    enabled: !!user?.id,
  });

  // Fetch step data
  const { data: stepData, isLoading: isStepDataLoading } = useQuery({
    queryKey: ["onboarding-step-data", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      const [step1, step2, step3, step4] = await Promise.all([
        getOnboardingStepData(user.id, 1),
        getOnboardingStepData(user.id, 2),
        getOnboardingStepData(user.id, 3),
        getOnboardingStepData(user.id, 4),
      ]);
      return { step1, step2, step3, step4 };
    },
    enabled: !!user?.id,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [completionData, setCompletionData] = useState<{
    pointsAwarded: number;
    newTier: string;
  } | null>(null);

  // Update current step when status loads
  useEffect(() => {
    if (status) {
      if (status.completed) {
        router.push("/dashboard");
        return;
      }
      if (status.skipped) {
        router.push("/dashboard");
        return;
      }
      setCurrentStep(status.currentStep);
      setShowWelcome(status.currentStep === 1);
    }
  }, [status, router]);

  // Redirect if no user (after session loads)
  useEffect(() => {
    if (!isSessionLoading && !user) {
      router.push("/");
    }
  }, [user, isSessionLoading, router]);

  if (isSessionLoading || isStatusLoading || isStepDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user || !status) {
    return null;
  }

  // Redirect if already completed or skipped
  if (status.completed || status.skipped) {
    return null;
  }

  const handleNext = async (step: number, data: unknown) => {
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }

    setIsLoading(true);
    try {
      const result = await saveOnboardingStep(user.id, step, data as never);

      if (!result.success) {
        toast.error(result.error || "Failed to save step");
        return;
      }

      if (step < 4) {
        setCurrentStep(step + 1);
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }

    setIsLoading(true);
    try {
      const result = await skipOnboarding(user.id);
      if (result.success) {
        router.push("/dashboard");
      } else {
        toast.error("Failed to skip onboarding");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (completed) {
    return (
      <OnboardingCompletion
        pointsAwarded={completionData?.pointsAwarded || 50}
        tier={completionData?.newTier || "observer"}
      />
    );
  }

  if (showWelcome) {
    return (
      <OnboardingWelcome
        onStart={() => {
          setShowWelcome(false);
          setCurrentStep(1);
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep} of 4</span>
          {currentStep < 4 && (
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              Skip
            </button>
          )}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      {currentStep === 1 && (
        <StepBasicInfo
          onNext={(data) => handleNext(1, data)}
          onBack={handleBack}
          isLoading={isLoading}
          savedData={stepData?.step1}
        />
      )}
      {currentStep === 2 && (
        <StepProfessionalBackground
          onNext={(data) => handleNext(2, data)}
          onBack={handleBack}
          isLoading={isLoading}
          savedData={stepData?.step2}
        />
      )}
      {currentStep === 3 && (
        <StepAutomationExperience
          onNext={(data) => handleNext(3, data)}
          onBack={handleBack}
          isLoading={isLoading}
          savedData={stepData?.step3}
        />
      )}
      {currentStep === 4 && (
        <StepPlatformIntent
          onNext={(data) => handleNext(4, data)}
          onBack={handleBack}
          onFinish={async () => {
            if (!user) {
              toast.error("Please sign in to continue");
              return;
            }

            setIsLoading(true);
            try {
              const result = await completeOnboarding(user.id);
              if (result.success) {
                setCompletionData({
                  pointsAwarded: result.pointsAwarded || 50,
                  newTier: result.newTier || "observer",
                });
                setCompleted(true);
                toast.success(
                  `Welcome! You earned ${result.pointsAwarded || 50} reputation points!`,
                );
              } else {
                toast.error(result.error || "Failed to complete onboarding");
              }
            } catch (error) {
              toast.error("An error occurred");
              console.error(error);
            } finally {
              setIsLoading(false);
            }
          }}
          isLoading={isLoading}
          savedData={stepData?.step4}
        />
      )}
    </div>
  );
}
