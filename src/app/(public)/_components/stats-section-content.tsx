import { StatsSection } from "@/components/agi-dashboard/stats-section";
import { getStats } from "@/actions/capabilities";

export async function StatsSectionContent() {
  const stats = await getStats().catch(() => ({
    reports: 0,
    experts: 0,
    papers: 0,
    jobsSafe: 0,
  }));

  return <StatsSection stats={stats} />;
}
