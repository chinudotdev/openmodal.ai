import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgesContent } from "./_components/badges-content";

function BadgesFallback() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}

export default function BadgesPage() {
  return (
    <Suspense fallback={<BadgesFallback />}>
      <BadgesContent />
    </Suspense>
  );
}
