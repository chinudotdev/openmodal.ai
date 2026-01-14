import Link from "next/link";
import { notFound } from "next/navigation";
import { getCapabilityBySlug } from "@/actions/capabilities";
import { BottleneckCards } from "./bottleneck-cards";
import { CapabilityDescription } from "./capability-description";
import { CapabilityHeader } from "./capability-header";
import { CommentSection } from "./comment-section";
import { CurrentState } from "./current-state";
import { RelatedCapabilities } from "./related-capabilities";
import { TimelineForecast } from "./timeline-forecast";
import { WhyItMatters } from "./why-it-matters";

export async function CapabilityContent({ slug }: { slug: string }) {
  const capability = await getCapabilityBySlug(slug);

  if (!capability) {
    notFound();
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-3 text-sm max-w-5xl">
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
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <CapabilityHeader capability={capability} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-12">
          {/* Main Content */}
          <div className="space-y-12">
            <CapabilityDescription capability={capability} />
            <WhyItMatters capability={capability} />
            <CurrentState capability={capability} />
            <BottleneckCards bottlenecks={capability.bottlenecks} />
            <TimelineForecast capability={capability} />
            <CommentSection capabilityId={capability.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
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
