import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { HeroSection } from "@/components/agi-dashboard/hero-section";
import { CapabilityList } from "@/components/agi-dashboard/capability-list";
import { ActivityFeed } from "@/components/agi-dashboard/activity-feed";
import { QuickAccess } from "@/components/agi-dashboard/quick-access";
import { StatsSection } from "@/components/agi-dashboard/stats-section";

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

export default async function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content: Two-Column Layout */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 max-w-[1400px] mx-auto">
          {/* Left Column: Capability Progress */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Capability Progress
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Core AI capabilities and their current status
              </p>
            </div>
            <CapabilityList />
          </div>

          {/* Right Column: Activity Feed */}
          <div>
            <ActivityFeed />
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <QuickAccess />

      {/* Stats Section */}
      <StatsSection />
    </main>
  );
}
