import { getAdminOverview, getActionRequired } from "@/actions/admin";
import { AdminStatsCards } from "./admin-stats-cards";
import { ActionRequired } from "./action-required";
import { QuickActions } from "./quick-actions";
import { RecentActivity } from "./recent-activity";
import { PlatformHealthChart } from "./platform-health-chart";

export async function AdminOverview() {
  const stats = await getAdminOverview();
  const actionRequired = await getActionRequired();

  return (
    <div className="space-y-6">
      <AdminStatsCards stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionRequired data={actionRequired} />
        <QuickActions />
      </div>
      <RecentActivity />
      <PlatformHealthChart />
    </div>
  );
}
