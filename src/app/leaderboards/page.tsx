import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardsContent } from "./_components/leaderboards-content";

function LeaderboardsFallback() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="mt-6">
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 10 }, (_, i) => {
            // biome-ignore lint/suspicious/noArrayIndexKey: Static loading skeleton, index is safe
            return <Skeleton key={i} className="h-20 w-full" />;
          })}
        </div>
      </div>
      <div className="mt-6">
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

export default async function LeaderboardsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  return (
    <Suspense fallback={<LeaderboardsFallback />}>
      <LeaderboardsContent promiseSearchParams={searchParams} />
    </Suspense>
  );
}
