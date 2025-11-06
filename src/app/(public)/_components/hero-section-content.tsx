import { HeroSection } from "@/components/agi-dashboard/hero-section";
import { getAGIProgress } from "@/actions/capabilities";

export async function HeroSectionContent() {
  const agiProgress = await getAGIProgress().catch(() => ({
    overall: 0,
    lastUpdated: "unknown",
    lastUpdatedBy: "community",
    contributors: 0,
    expertForecasts: 0,
    reports: 0,
  }));

  return <HeroSection agiProgress={agiProgress} />;
}
