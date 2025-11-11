import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplyExpertContent } from "./_components/apply-expert-content";

function ApplyExpertFallback() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Skeleton className="h-9 w-64 mb-6" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default function ApplyExpertPage() {
  return (
    <Suspense fallback={<ApplyExpertFallback />}>
      <ApplyExpertContent />
    </Suspense>
  );
}
