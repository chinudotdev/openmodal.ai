import { getAGIProgress } from "@/actions/capabilities";
import { HeroSection } from "@/components/agi-dashboard/hero-section";

export async function HeroSectionContent() {
  const agiProgress = await getAGIProgress();
  return <HeroSection agiProgress={agiProgress} />;
}
