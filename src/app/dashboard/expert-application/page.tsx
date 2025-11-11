import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpertApplicationContent } from "./_components/expert-application-content";

function ExpertApplicationFallback() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default function ExpertApplicationPage() {
  return (
    <Suspense fallback={<ExpertApplicationFallback />}>
      <ExpertApplicationContent />
    </Suspense>
  );
}
