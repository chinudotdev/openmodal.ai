import { QuickAccess } from "@/components/agi-dashboard/quick-access";
import type { Metadata } from "next";
import { ActivityFeedContent } from "./_components/activity-feed-content";
import { CapabilityListContent } from "./_components/capability-list-content";
import { HeroSectionContent } from "./_components/hero-section-content";
import { StatsSectionContent } from "./_components/stats-section-content";
import { Brain } from "lucide-react";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "OpenModal - AGI Progress Tracker & AI Capabilities Dashboard",
  description:
    "Track progress toward Artificial General Intelligence (AGI). Community-driven dashboard showing AI capabilities, breakthrough developments, and which jobs are safe from automation.",
  keywords: [
    "AGI",
    "artificial general intelligence",
    "AI progress",
    "AI capabilities",
    "AI automation",
    "job automation",
    "AI technologies",
    "machine learning",
    "AI safety",
  ],
  openGraph: {
    title: "OpenModal - AGI Progress Tracker & AI Capabilities Dashboard",
    description:
      "Track progress toward Artificial General Intelligence (AGI). Community-driven dashboard showing AI capabilities, breakthrough developments, and which jobs are safe from automation.",
    type: "website",
    url: "/",
    siteName: "OpenModal",
    images: [
      {
        url: "/api/og?type=landing",
        width: 1200,
        height: 630,
        alt: "OpenModal - AGI Progress Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenModal - AGI Progress Tracker",
    description:
      "Track progress toward Artificial General Intelligence. Community-driven dashboard for AI capabilities and breakthroughs.",
    images: ["/api/og?type=landing"],
  },
};

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden bg-linear-to-b from-muted to-background py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-[800px] text-center">
            <div className="mb-6 flex justify-center animate-fade-in-up">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Brain className="h-8 w-8 text-primary" />
              </div>
            </div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in-up">
              Artificial General Intelligence
            </h1>

            <p
              className="mb-6 text-lg text-muted-foreground md:text-xl animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              How close are we to human-level AI?
              <br />
              <span className="text-base text-muted-foreground/80">
                Community-tracked progress
              </span>
            </p>
            <Suspense fallback={<Spinner className="h-8 w-8" />}>
              <HeroSectionContent />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 max-w-[1400px] mx-auto items-stretch">
          <Suspense fallback={<Spinner className="h-8 w-8" />}>
            <CapabilityListContent />
          </Suspense>
          <Suspense fallback={<Spinner className="h-8 w-8" />}>
            <ActivityFeedContent />
          </Suspense>
        </div>
      </section>

      <QuickAccess />
      <Suspense fallback={<Spinner className="h-8 w-8" />}>
        <StatsSectionContent />
      </Suspense>
    </main>
  );
}
