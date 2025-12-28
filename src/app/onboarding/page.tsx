import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { OnboardingContent } from "./_components/onboarding-content";

export default function OnboardingPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Suspense fallback={<Spinner className="h-8 w-8" />}>
        <OnboardingContent />
      </Suspense>
    </div>
  );
}
