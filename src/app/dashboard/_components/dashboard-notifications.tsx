import { getUserNotifications } from "@/actions/notifications";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import Link from "next/link";

export async function DashboardNotifications({ userId }: { userId: string }) {
  const notifications = await getUserNotifications(userId, 5, 0);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({unreadCount} new)
              </span>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/notifications">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-muted-foreground">
              No notifications
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
