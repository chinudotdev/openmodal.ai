"use client";

import {
  AlertCircle,
  ArrowUp,
  Cpu,
  DollarSign,
  FileText,
  MessageSquare,
  Rocket,
  Share2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { Activity, ActivityType } from "@/actions/capabilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: Activity;
}

const activityConfig: Record<
  ActivityType,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconClassName: string;
    bgClassName: string;
  }
> = {
  breakthrough: {
    icon: Zap,
    iconClassName: "text-primary",
    bgClassName: "bg-primary/10",
  },
  setback: {
    icon: AlertCircle,
    iconClassName: "text-muted-foreground",
    bgClassName: "bg-muted",
  },
  deployment: {
    icon: Rocket,
    iconClassName: "text-primary",
    bgClassName: "bg-primary/10",
  },
  research: {
    icon: FileText,
    iconClassName: "text-primary",
    bgClassName: "bg-primary/10",
  },
  funding: {
    icon: DollarSign,
    iconClassName: "text-muted-foreground",
    bgClassName: "bg-muted",
  },
  technology: {
    icon: Cpu,
    iconClassName: "text-primary",
    bgClassName: "bg-primary/10",
  },
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
              config.bgClassName,
            )}
          >
            <Icon className={cn("h-4 w-4", config.iconClassName)} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base leading-tight">
              {activity.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {activity.description}
        </p>

        {/* External Link */}
        {activity.url && (
          <Link
            href={activity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-primary hover:underline truncate"
          >
            {activity.url}
          </Link>
        )}

        {/* Meta Info */}
        <div className="text-xs text-muted-foreground">
          Posted {activity.timestamp} ago by @{activity.author.username}
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3 border-t pt-3">
        {/* Interaction Bar */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              {activity.upvotes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {activity.comments}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>

        {/* Tags */}
        {activity.tags && activity.tags.length > 0 && (
          <div className="flex w-full flex-wrap gap-1.5">
            {activity.tags.map((tag) => (
              <Badge
                key={`${activity.id}-${tag}`}
                variant="secondary"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
