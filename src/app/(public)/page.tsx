import { QuickAccess } from "@/components/agi-dashboard/quick-access";
import type { Metadata } from "next";
import { ActivityFeedContent } from "./_components/activity-feed-content";
import { CapabilityListContent } from "./_components/capability-list-content";
import { HeroSectionContent } from "./_components/hero-section-content";
import { StatsSectionContent } from "./_components/stats-section-content";

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
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSectionContent />

      {/* Main Content: Two-Column Layout */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 max-w-[1400px] mx-auto">
          {/* Left Column: Capability Progress */}
          <CapabilityListContent />

          {/* Right Column: Activity Feed */}
          <ActivityFeedContent />
        </div>
      </section>

      {/* Quick Access Section */}
      <QuickAccess />

      {/* Stats Section */}
      <StatsSectionContent />
    </main>
  );
}
