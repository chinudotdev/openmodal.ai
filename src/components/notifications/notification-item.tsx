"use client";

import {
  CheckCircle2,
  MessageSquare,
  Award,
  TrendingUp,
  Flag,
  ShieldCheck,
  FileText,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/date-utils";
import { type notification } from "@/db/schema";
import { markNotificationRead } from "@/actions/notifications";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type NotificationItem = typeof notification.$inferSelect;

interface NotificationItemProps {
  notification: NotificationItem;
  onMarkRead?: () => void;
}

const notificationIcons: Record<string, typeof CheckCircle2> = {
  report_verified: CheckCircle2,
  report_approved: CheckCircle2,
  report_rejected: XCircle,
  report_changes_requested: FileText,
  comment_reply: MessageSquare,
  reputation_milestone: Award,
  capability_breakthrough: TrendingUp,
  verification_received: ShieldCheck,
  dispute_received: Flag,
  moderation_assigned: FileText,
};

const notificationColors: Record<string, string> = {
  report_verified: "text-green-600",
  report_approved: "text-green-600",
  report_rejected: "text-red-600",
  report_changes_requested: "text-yellow-600",
  comment_reply: "text-blue-600",
  reputation_milestone: "text-purple-600",
  capability_breakthrough: "text-orange-600",
  verification_received: "text-green-600",
  dispute_received: "text-red-600",
  moderation_assigned: "text-blue-600",
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const Icon = notificationIcons[notification.type] || CheckCircle2;
  const colorClass =
    notificationColors[notification.type] || "text-muted-foreground";

  const handleClick = async () => {
    if (!notification.read) {
      await markNotificationRead(notification.id, notification.userId);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
        !notification.read && "bg-muted/50 hover:bg-muted",
        notification.read && "hover:bg-muted/50",
      )}
      onClick={handleClick}
    >
      <div className={cn("mt-0.5", colorClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            !notification.read && "font-semibold",
          )}
        >
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </p>
      </div>
      {!notification.read && (
        <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
      )}
    </div>
  );

  return content;
}
