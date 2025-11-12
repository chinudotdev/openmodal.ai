"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserGrowthChart } from "./user-growth-chart";
import { ContentActivityChart } from "./content-activity-chart";
import { RoleDistributionChart } from "./role-distribution-chart";
import { EngagementMetrics } from "./engagement-metrics";
import { ModerationStats } from "./moderation-stats";

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Date Range: Last 30 days</p>
        </div>
        <button type="button" className="text-sm text-muted-foreground hover:text-foreground">
          Export Data ↓
        </button>
      </div>

      <UserGrowthChart />
      <ContentActivityChart />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RoleDistributionChart />
        <EngagementMetrics />
      </div>

      <ModerationStats />
    </div>
  );
}

