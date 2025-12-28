import { ModerationReportList } from "./moderation-report-list-content";
import { ModerationSubnav } from "./moderation-subnav";

interface ModerationTabsProps {
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    changesRequested: number;
    disputed: number;
    flagged: number;
  } | null;
  activeTab: "pending" | "flagged" | "disputed";
}

export function ModerationTabs({ stats, activeTab }: ModerationTabsProps) {
  return (
    <div className="space-y-6">
      <ModerationSubnav stats={stats} activeTab={activeTab} />
      <div className="mt-6">
        <ModerationReportList type={activeTab} />
      </div>
    </div>
  );
}
