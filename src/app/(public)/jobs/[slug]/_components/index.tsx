import { getJobBySlug, incrementViewCount } from "@/actions/jobs";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AboutSection } from "./about-section";
import { AtAGlance } from "./at-a-glance";
import { AutomationReports } from "./automation-reports";
import { AutomationTimeline } from "./automation-timeline";
import { CapabilityWatchList } from "./capability-watch-list";
import { CareerGuidance } from "./career-guidance";
import { CommentSection } from "./comment-section";
import { CommunityStats } from "./community-stats";
import { ContributeSection } from "./contribute-section";
import { GeographicBreakdown } from "./geographic-breakdown";
import { JobHeader } from "./job-header";
import { QuickActions } from "./quick-actions";
import { QuickStatsGrid } from "./quick-stats-grid";
import { RelatedJobs } from "./related-jobs";
import { RequiredCapabilities } from "./required-capabilities";
import { TaskBreakdown } from "./task-breakdown";

export async function JobContent({ slug }: { slug: string }) {
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
