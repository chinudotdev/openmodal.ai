import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StreaksContent } from "./_components/streaks-content";

function StreaksFallback() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <div className="p-6">
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

export default function StreaksPage() {
  return (
    <Suspense fallback={<StreaksFallback />}>
      <StreaksContent />
    </Suspense>
  );
}
