import type { getCapabilityBySlug } from "@/actions/capabilities";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface TimelineChartProps {
  capability: NonNullable<Capability>;
}

// Timeline chart functionality has been removed from the schema
// - timelineEstimate field removed from capability
// - communityPredictionMedian field removed from capability
export function TimelineChart(_props: TimelineChartProps) {
  // Component returns null - timeline chart is not available
  // The parent TimelineForecast component now handles the "not available" display
  return null;
}
