import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { CapabilityContent } from "./_components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function CapabilityFallback() {
  return (
    <>
      {/* Breadcrumb Skeleton */}
      <div className="border-b border-border bg-muted/40">
        <div className="container mx-auto px-4 py-3 text-sm">
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">
          <div className="space-y-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    </>
  );
}

export default async function CapabilityDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<CapabilityFallback />}>
        <CapabilityContent slug={slug} />
      </Suspense>
    </div>
  );
}
