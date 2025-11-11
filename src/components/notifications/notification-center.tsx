"use client";

import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/contexts/session-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserNotifications,
  markAllNotificationsRead,
} from "@/actions/notifications";
import { NotificationItem } from "./notification-item";
import { Spinner } from "@/components/ui/spinner";
import { formatDistanceToNow } from "@/lib/date-utils";
import { type notification } from "@/db/schema";

type Notification = typeof notification.$inferSelect;

function groupNotificationsByDate(notifications: Notification[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);

  const groups: {
    label: string;
    notifications: Notification[];
  }[] = [
    { label: "Today", notifications: [] },
    { label: "Yesterday", notifications: [] },
    { label: "This Week", notifications: [] },
    { label: "Older", notifications: [] },
  ];

  for (const notification of notifications) {
    const notifDate = new Date(notification.createdAt);
    if (notifDate >= today) {
      groups[0].notifications.push(notification);
    } else if (notifDate >= yesterday) {
      groups[1].notifications.push(notification);
    } else if (notifDate >= thisWeek) {
      groups[2].notifications.push(notification);
    } else {
      groups[3].notifications.push(notification);
    }
  }

  return groups.filter((group) => group.notifications.length > 0);
}

export function NotificationCenter() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications-all", user?.id],
    queryFn: () => {
      if (!user?.id) return [];
      return getUserNotifications(user.id, 50, 0);
    },
    enabled: !!user?.id,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) return Promise.resolve({ success: false });
      return markAllNotificationsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications-all", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications-recent", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count", user?.id],
      });
    },
  });

  const groupedNotifications = groupNotificationsByDate(notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Please sign in to view notifications
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Bell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                You're all caught up! When you receive notifications, they'll
                appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedNotifications.map((group) => (
            <Card key={group.label}>
              <CardHeader>
                <CardTitle className="text-lg">{group.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {group.notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={() => {
                        queryClient.invalidateQueries({
                          queryKey: ["notifications-all", user?.id],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["notifications-recent", user?.id],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["notification-unread-count", user?.id],
                        });
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
