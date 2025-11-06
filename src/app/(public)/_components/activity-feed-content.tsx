import { ActivityFeed } from "@/components/agi-dashboard/activity-feed";
import { getActivities } from "@/actions/capabilities";

export async function ActivityFeedContent() {
  const activities = await getActivities(10).catch(() => []);

  return <ActivityFeed activities={activities} />;
}
