import { Suspense } from "react";
import { VerifyEmailContent } from "./_components/verify-email-content";
import { Spinner } from "@/components/ui/spinner";

export default function VerifyEmailPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Suspense fallback={<Spinner className="w-8 h-8" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
