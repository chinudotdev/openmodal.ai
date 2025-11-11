"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCard } from "./badge-card";
import type { userBadge } from "@/db/schema";

interface BadgeCollectionProps {
  badges: (typeof userBadge.$inferSelect)[];
}

const badgeCategories = [
  "all",
  "contribution",
  "verification",
  "engagement",
  "specialty",
  "social",
] as const;

type BadgeCategory = (typeof badgeCategories)[number];

export function BadgeCollection({ badges }: BadgeCollectionProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<BadgeCategory>("all");

  const filteredBadges =
    selectedCategory === "all"
      ? badges
      : badges.filter((b) => b.badgeCategory === selectedCategory);

  const earnedBadges = filteredBadges.filter((b) => b.earnedAt);
  const lockedBadges = filteredBadges.filter((b) => !b.earnedAt);

  // Group badges by category for display
  const categoryGroups = [
    { name: "Contribution", value: "contribution" },
    { name: "Verification", value: "verification" },
    { name: "Engagement", value: "engagement" },
    { name: "Specialty", value: "specialty" },
    { name: "Social", value: "social" },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as BadgeCategory)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {categoryGroups.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {categoryGroups.map((category) => {
        const categoryBadges = badges.filter(
          (b) => b.badgeCategory === category.value,
        );
        if (categoryBadges.length === 0) return null;

        const earned = categoryBadges.filter((b) => b.earnedAt);
        const locked = categoryBadges.filter((b) => !b.earnedAt);

        if (selectedCategory !== "all" && selectedCategory !== category.value) {
          return null;
        }

        return (
          <div key={category.value} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{category.name} Badges</h2>
              <span className="text-sm text-muted-foreground">
                {earned.length} earned
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categoryBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

