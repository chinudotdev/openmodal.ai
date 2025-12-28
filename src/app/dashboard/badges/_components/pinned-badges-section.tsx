"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { userBadge } from "@/db/schema";
import { BadgeCard } from "./badge-card";

interface PinnedBadgesSectionProps {
  pinnedBadges: (typeof userBadge.$inferSelect)[];
  totalBadges: (typeof userBadge.$inferSelect)[];
}

export function PinnedBadgesSection({
  pinnedBadges,
  totalBadges,
}: PinnedBadgesSectionProps) {
  const canAddMore = pinnedBadges.length < 5;
  const unpinnedBadges = totalBadges.filter(
    (b) => !b.pinned && pinnedBadges.length < 5,
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pinned Badges (Show on profile)</CardTitle>
        <p className="text-sm text-muted-foreground">Drag to reorder • Max 5</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {pinnedBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} isPinned />
          ))}
          {canAddMore && (
            <div className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mb-1"
                asChild
              >
                <Link href="/dashboard/badges?action=pin">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
              <span className="text-xs text-muted-foreground text-center px-2">
                Add badge
              </span>
            </div>
          )}
        </div>
        {pinnedBadges.length >= 5 && (
          <p className="text-xs text-muted-foreground mt-2">
            Maximum 5 badges pinned. Unpin one to add another.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
