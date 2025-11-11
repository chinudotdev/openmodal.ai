import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentActivity } from "@/actions/gamification";
import { formatDistanceToNow } from "@/lib/date-utils";
import { CheckCircle, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";

interface RecentActivityProps {
  userId: string;
}

type Activity = Awaited<ReturnType<typeof getRecentActivity>>[number];

export async function RecentActivity({ userId }: RecentActivityProps) {
  const activities = await getRecentActivity(userId, 5);

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity to display
          </p>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "report_submitted":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "verification_completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    if (activity.activityType === "report_submitted" && "status" in activity) {
      const status =
        activity.status === "approved" ? "verified" : activity.status;
      return `Report ${status}`;
    }
    if (
      activity.activityType === "verification_completed" &&
      "canVerify" in activity
    ) {
      return activity.canVerify ? "Verified report" : "Disputed report";
    }
    return "Activity";
  };

  const getActivityLink = (activity: Activity) => {
    if (activity.entityType === "report") {
      return `/reports/${activity.entityId}`;
    }
    if (activity.entityType === "verification") {
      return `/reports/${activity.entityId}`;
    }
    return "/dashboard";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              href={getActivityLink(activity)}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="mt-0.5">
                {getActivityIcon(activity.activityType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {getActivityText(activity)}
                </p>
                {activity.entityType === "report" &&
                  "jobTitle" in activity &&
                  activity.jobTitle && (
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.jobTitle}
                    </p>
                  )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground mt-4 block"
        >
          View all →
        </Link>
      </CardContent>
    </Card>
  );
}
