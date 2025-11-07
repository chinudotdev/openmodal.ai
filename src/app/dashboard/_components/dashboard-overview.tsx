"use client";

import { ProgressBar } from "@/components/shared/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { userBadge, userProfile, userReputation } from "@/db/schema";

interface DashboardOverviewProps {
  reputation: typeof userReputation.$inferSelect | null;
  badges: (typeof userBadge.$inferSelect)[];
  profile: typeof userProfile.$inferSelect | null;
}

export function DashboardOverview({
  reputation,
  badges,
  profile,
}: DashboardOverviewProps) {
  const displayName = profile?.displayName || "User";
  const tier = reputation?.tier || "observer";
  const points = reputation?.reputationPoints || 0;

  // Calculate points needed for next tier
  const getNextTierPoints = (currentTier: string) => {
    switch (currentTier) {
      case "observer":
        return 200;
      case "contributor":
        return 1000;
      case "trusted":
        return 5000;
      default:
        return null;
    }
  };

  const nextTierPoints = getNextTierPoints(tier);
  const progress = nextTierPoints
    ? Math.min((points / nextTierPoints) * 100, 100)
    : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{displayName}</h2>
          <Badge variant="outline" className="mt-2">
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Badge>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {points} reputation points
            </span>
            {nextTierPoints && (
              <span className="text-xs text-muted-foreground">
                {nextTierPoints - points} to{" "}
                {tier === "observer"
                  ? "Contributor"
                  : tier === "contributor"
                    ? "Trusted"
                    : "Expert"}
              </span>
            )}
          </div>
          {nextTierPoints && (
            <ProgressBar progress={progress} className="h-2" />
          )}
        </div>

        {badges.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={badge.id} variant="secondary">
                  {badge.badgeName}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
