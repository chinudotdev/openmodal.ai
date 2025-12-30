import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { MyReportsContent } from "./_components/my-reports-content";

export default function MyReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <MyReportsContent />
      </Suspense>
    </div>
  );
}
