"use client";

import { Flame } from "lucide-react";
import { mockActivities } from "@/lib/mock-data";
import { ActivityCard } from "./activity-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function ActivityFeed() {
  // Show first 10 activities
  const displayedActivities = mockActivities.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            What's Happening Now
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest breakthroughs, setbacks, and developments
        </p>
      </div>

      {/* Activity Cards */}
      <div className="space-y-4">
        {displayedActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      {/* View All Button */}
      <div className="pt-2">
        <Link href="/activity">
          <Button variant="outline" className="w-full group">
            View all updates
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
