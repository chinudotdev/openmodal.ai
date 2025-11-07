import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { type JobsContentProps, JobsContent } from "./_components";

export default async function JobsListPage({ searchParams }: JobsContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-96" />
              <div className="grid grid-cols-1 lg:grid-cols-[25%_75%] gap-8">
                <div className="space-y-4">
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                </div>
              </div>
            </div>
          </div>
        }
      >
        <JobsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
