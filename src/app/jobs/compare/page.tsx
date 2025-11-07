import { Suspense } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { CompareContent } from "./_components";

interface PageProps {
  searchParams: Promise<{
    jobs?: string;
  }>;
}

export default async function CompareJobsPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-96" />
              <Skeleton className="h-64" />
            </div>
          </div>
        }
      >
        <CompareContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
