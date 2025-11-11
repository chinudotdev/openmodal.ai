"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2 } from "lucide-react";
import type { userBadge } from "@/db/schema";
import { BadgeDetailsModal } from "./badge-details-modal";
import { useState } from "react";

interface BadgeCardProps {
  badge: typeof userBadge.$inferSelect;
  isPinned?: boolean;
}

export function BadgeCard({ badge, isPinned }: BadgeCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isEarned = !!badge.earnedAt;

  return (
    <>
      <Card
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          isEarned ? "" : "opacity-60 grayscale"
        } ${isPinned ? "border-primary" : ""}`}
        onClick={() => setShowDetails(true)}
      >
        <CardContent className="p-4 flex flex-col items-center gap-2 min-w-[120px]">
          <div className="text-4xl">{badge.badgeIcon || "🏅"}</div>
          <div className="text-center">
            <p className="text-sm font-medium">{badge.badgeName}</p>
            {isEarned && badge.earnedAt && (
              <p className="text-xs text-muted-foreground">
                {new Date(badge.earnedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          {isEarned ? (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>EARNED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>LOCKED</span>
            </div>
          )}
        </CardContent>
      </Card>
      {showDetails && (
        <BadgeDetailsModal
          badge={badge}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
      )}
    </>
  );
}

