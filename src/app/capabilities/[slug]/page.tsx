import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getCapabilities,
  getCapabilityBySlug,
  incrementViewCount,
} from "@/actions/capabilities";
import { Navbar } from "@/components/navigation/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { BottleneckCards } from "./_components/bottleneck-cards";
import { CapabilityDescription } from "./_components/capability-description";
import { CapabilityHeader } from "./_components/capability-header";
import { CommentSection } from "./_components/comment-section";
import { CurrentState } from "./_components/current-state";
import { JobImpactSection } from "./_components/job-impact-section";
import { JobsProtected } from "./_components/jobs-protected";
import { QuickFacts } from "./_components/quick-facts";
import { RelatedCapabilities } from "./_components/related-capabilities";
import { TimelineForecast } from "./_components/timeline-forecast";
import { TopOrganizations } from "./_components/top-organizations";
import { WhyItMatters } from "./_components/why-it-matters";

// Generate static params for common/popular capabilities
export async function generateStaticParams() {
  try {
    // Fetch all capabilities to generate static params
    // Limit to first 100 to avoid too many static pages
    const capabilities = await getCapabilities({}, "progress_desc", 100, 0);

    // Handle case when there are no capabilities in the database
    // With Cache Components, we must return at least one result
    // Return a placeholder slug that will result in 404
    if (!capabilities || capabilities.length === 0) {
      return [{ slug: "__placeholder__no_capabilities__" }];
    }

    return capabilities.map((capability) => ({
      slug: capability.slug,
    }));
  } catch (error) {
    // If there's an error fetching capabilities (e.g., database connection issue),
    // return a placeholder to satisfy Cache Components requirement
    // The placeholder will result in 404, which is handled by the page component
    console.error("Error generating static params for capabilities:", error);
    return [{ slug: "__placeholder__error__" }];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function CapabilityContent({ slug }: { slug: string }) {
  const capability = await getCapabilityBySlug(slug);

  if (!capability) {
    notFound();
  }

  // Increment view count (fire and forget)
  incrementViewCount(capability.id).catch(console.error);

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
            <Link href="/capabilities" className="hover:text-foreground">
              Capabilities
            </Link>
            <span>/</span>
            <span className="text-foreground">{capability.name}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          <CapabilityHeader capability={capability} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            <CapabilityDescription capability={capability} />
            <WhyItMatters capability={capability} />
            <CurrentState capability={capability} />
            <BottleneckCards bottlenecks={capability.bottlenecks} />
            <TimelineForecast capability={capability} />
            <JobImpactSection capability={capability} />
            <CommentSection capabilityId={capability.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickFacts capability={capability} />
            <JobsProtected capability={capability} />
            <TopOrganizations organizations={capability.organizations} />
            <RelatedCapabilities
              categoryId={capability.categoryId}
              currentSlug={capability.slug}
            />
          </div>
        </div>
      </div>
    </>
  );
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
      <Navbar />
      <Suspense fallback={<CapabilityFallback />}>
        <CapabilityContent slug={slug} />
      </Suspense>
    </div>
  );
}
