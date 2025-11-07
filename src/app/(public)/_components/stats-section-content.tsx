import { getStats } from "@/actions/capabilities";
import { StatsSection } from "@/components/agi-dashboard/stats-section";

export async function StatsSectionContent() {
  const stats = await getStats();

  return <StatsSection stats={stats} />;
}
