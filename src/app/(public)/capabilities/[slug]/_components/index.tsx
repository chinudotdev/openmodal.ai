import { getCapabilityBySlug } from "@/actions/capabilities";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BottleneckCards } from "./bottleneck-cards";
import { CapabilityDescription } from "./capability-description";
import { CapabilityHeader } from "./capability-header";
import { CommentSection } from "./comment-section";
import { CurrentState } from "./current-state";
import { JobImpactSection } from "./job-impact-section";
import { JobsProtected } from "./jobs-protected";
import { QuickFacts } from "./quick-facts";
import { RelatedCapabilities } from "./related-capabilities";
import { TimelineForecast } from "./timeline-forecast";
import { TopOrganizations } from "./top-organizations";
import { WhyItMatters } from "./why-it-matters";

export async function CapabilityContent({ slug }: { slug: string }) {
  const capability = await getCapabilityBySlug(slug);

  if (!capability) {
    notFound();
  }

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
