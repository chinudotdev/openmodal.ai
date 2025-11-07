import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getJobBySlug, incrementViewCount } from "@/actions/jobs";
import { Navbar } from "@/components/navigation/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { job } from "@/db/schema/jobs";
import { AboutSection } from "./_components/about-section";
import { AtAGlance } from "./_components/at-a-glance";
import { AutomationReports } from "./_components/automation-reports";
import { AutomationTimeline } from "./_components/automation-timeline";
import { CapabilityWatchList } from "./_components/capability-watch-list";
import { CareerGuidance } from "./_components/career-guidance";
import { CommentSection } from "./_components/comment-section";
import { CommunityStats } from "./_components/community-stats";
import { ContributeSection } from "./_components/contribute-section";
import { GeographicBreakdown } from "./_components/geographic-breakdown";
import { JobHeader } from "./_components/job-header";
import { QuickActions } from "./_components/quick-actions";
import { QuickStatsGrid } from "./_components/quick-stats-grid";
import { RelatedJobs } from "./_components/related-jobs";
import { RequiredCapabilities } from "./_components/required-capabilities";
import { TaskBreakdown } from "./_components/task-breakdown";

// Generate static params for all jobs
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

async function JobContent({ slug }: { slug: string }) {
  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  // Increment view count (fire and forget)
  incrementViewCount(job.id).catch(console.error);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/40">
        <div className="container mx-auto px-4 py-3 text-sm">
          <nav className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link href="/jobs" className="hover:text-foreground">
              Jobs
            </Link>
            <span>/</span>
            <span className="text-foreground">{job.title}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          <JobHeader job={job} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 py-6">
          <QuickStatsGrid job={job} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            <AboutSection job={job} />
            <TaskBreakdown job={job} />
            <RequiredCapabilities job={job} />
            <AutomationTimeline job={job} />
            <GeographicBreakdown job={job} />
            <AutomationReports job={job} />
            <CareerGuidance job={job} />
            <CommentSection jobId={job.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions jobId={job.id} slug={job.slug} />
            <AtAGlance job={job} />
            <RelatedJobs job={job} />
            <CapabilityWatchList job={job} />
            <CommunityStats job={job} />
            <ContributeSection jobId={job.id} slug={job.slug} />
          </div>
        </div>
      </div>
    </>
  );
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
      <Navbar />
      <Suspense fallback={<JobFallback />}>
        <JobContent slug={slug} />
      </Suspense>
    </div>
  );
}
