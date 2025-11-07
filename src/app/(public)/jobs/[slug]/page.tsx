import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { job } from "@/db/schema/jobs";
import { Suspense } from "react";
import { JobContent } from "./_components";

export async function generateStaticParams() {
  try {
    // Check if database connection is available
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not configured, returning fallback params");
      // Return a non-existent slug - the page will handle it with notFound()
      return [{ slug: "__no_jobs__" }];
    }

    const jobs = await db.select({ slug: job.slug }).from(job);

    // Filter out any null/undefined slugs and ensure we have valid slugs
    const validJobs = jobs.filter((j) => j.slug && j.slug.trim().length > 0);

    // Return at least one result to satisfy Next.js Cache Components requirement
    if (validJobs.length === 0) {
      // Return a non-existent slug - the page will handle it with notFound()
      // This satisfies Next.js requirement while gracefully handling empty database
      return [{ slug: "__no_jobs__" }];
    }

    return validJobs.map((j) => ({ slug: j.slug }));
  } catch (error) {
    console.error("Error generating static params for jobs:", error);
    // Return a non-existent slug - the page will handle it with notFound()
    // This satisfies Next.js requirement while gracefully handling errors
    return [{ slug: "__no_jobs__" }];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function JobFallback() {
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

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<JobFallback />}>
        <JobContent slug={slug} />
      </Suspense>
    </div>
  );
}
