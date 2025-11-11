import { ProgressBar } from "@/components/shared/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, Award } from "lucide-react";
import type { user, userBadge, userProfile, userReputation } from "@/db/schema";
import { formatDistanceToNow } from "@/lib/date-utils";
import Link from "next/link";

interface DashboardOverviewProps {
  user: typeof user.$inferSelect;
  reputation: typeof userReputation.$inferSelect | null;
  badges: (typeof userBadge.$inferSelect)[];
  profile: typeof userProfile.$inferSelect | null;
  streaks: {
    activityStreak: { currentStreak: number; longestStreak: number };
    verificationStreak: { currentStreak: number; longestStreak: number };
  };
}

export function DashboardOverview({
  user,
  reputation,
  badges,
  profile,
  streaks,
}: DashboardOverviewProps) {
  const displayName = profile?.displayName || user.name;
  const tier = reputation?.tier || "observer";
  const points = reputation?.reputationPoints || 0;
  const role = user.role || tier;
  const memberSince = new Date(user.createdAt);

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

  // Get role badge color
  const getRoleBadgeVariant = (role: string | null) => {
    if (role === "expert") return "default";
    if (role === "moderator" || role === "admin") return "secondary";
    return "outline";
  };

  // Get role display name
  const getRoleDisplayName = (role: string | null, tier: string) => {
    if (role === "expert") return "Expert";
    if (role === "moderator") return "Moderator";
    if (role === "admin") return "Admin";
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  // Get pinned badges (max 5)
  const pinnedBadges = badges
    .filter((b) => b.pinned)
    .sort((a, b) => (a.pinnedOrder || 0) - (b.pinnedOrder || 0))
    .slice(0, 5);

  // Get user initials for avatar
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image || ""} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getRoleBadgeVariant(role)}>
                {getRoleDisplayName(role, tier)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Member since{" "}
                {memberSince.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Reputation Points */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              💎 {points} reputation points
            </span>
            {nextTierPoints && (
              <span className="text-xs text-muted-foreground">
                {nextTierPoints - points} points to go
              </span>
            )}
          </div>
          {nextTierPoints && (
            <div className="space-y-1">
              <ProgressBar progress={progress} className="h-2" />
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}% to{" "}
                {tier === "observer"
                  ? "Contributor"
                  : tier === "contributor"
                    ? "Trusted"
                    : "Expert"}
              </span>
            </div>
          )}
        </div>

        {/* Streak and Badges Summary */}
        <div className="flex items-center gap-6 text-sm">
          {streaks.activityStreak.currentStreak > 0 && (
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>
                <span className="font-semibold">
                  {streaks.activityStreak.currentStreak}
                </span>
                -day streak
              </span>
            </div>
          )}
          {badges.length > 0 && (
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span>
                <span className="font-semibold">{badges.length}</span> badges
                earned
              </span>
            </div>
          )}
        </div>

        {/* Pinned Badges Showcase */}
        {pinnedBadges.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Badge Showcase</h3>
              <Link
                href="/dashboard/badges"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Manage badges →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {pinnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                  title={badge.badgeName}
                >
                  <span className="text-2xl">{badge.badgeIcon || "🏅"}</span>
                  <span className="text-xs text-center max-w-[60px] truncate">
                    {badge.badgeName}
                  </span>
                </div>
              ))}
            </div>
            {badges.length > pinnedBadges.length && (
              <p className="text-xs text-muted-foreground mt-2">
                {badges.length} total badges earned
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
