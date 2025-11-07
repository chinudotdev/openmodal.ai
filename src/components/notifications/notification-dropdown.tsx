"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "@/contexts/session-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserNotifications,
  getUnreadCount,
  markAllNotificationsRead,
} from "@/actions/notifications";
import { NotificationItem } from "./notification-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

export function NotificationDropdown() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notification-unread-count", user?.id],
    queryFn: () => {
      if (!user?.id) return 0;
      return getUnreadCount(user.id);
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications-recent", user?.id],
    queryFn: () => {
      if (!user?.id) return [];
      return getUserNotifications(user.id, 5, 0);
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
        queryKey: ["notifications-recent", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count", user?.id],
      });
    },
  });

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  if (!user) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full ring-2 ring-background" />
          )}
          {unreadCount > 0 && unreadCount < 100 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                No notifications
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => {
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
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
