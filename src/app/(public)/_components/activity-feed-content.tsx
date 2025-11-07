import { getActivities } from "@/actions/capabilities";
import { ActivityFeed } from "@/components/agi-dashboard/activity-feed";

export async function ActivityFeedContent() {
  const activities = await getActivities(6);

  return (
    <div className="h-full">
      <ActivityFeed activities={activities} />
    </div>
  );
}
