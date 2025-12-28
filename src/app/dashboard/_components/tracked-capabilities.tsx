"use client";

import { Brain, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { capability, capabilityTracking } from "@/db/schema";

type TrackedCapability = typeof capabilityTracking.$inferSelect & {
  capability: typeof capability.$inferSelect;
};

interface TrackedCapabilitiesProps {
  capabilities: TrackedCapability[];
}

export function TrackedCapabilities({
  capabilities,
}: TrackedCapabilitiesProps) {
  if (!capabilities || capabilities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Tracked Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-muted-foreground mb-1">
              No tracked capabilities
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Start tracking capabilities to see their progress here
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/capabilities">Browse Capabilities</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Tracked Capabilities
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/capabilities">Manage</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {capabilities.slice(0, 5).map((tracked) => {
            const cap = tracked.capability;
            const progress = cap.progressPercentage || 0;
            const hasUpdate = cap.recentBreakthroughDate
              ? new Date(cap.recentBreakthroughDate).getTime() >
                new Date(tracked.createdAt).getTime()
              : false;

            return (
              <div
                key={tracked.id}
                className="space-y-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/capabilities/${cap.slug}`}
                      className="font-semibold text-sm hover:underline block"
                    >
                      {cap.name}
                    </Link>
                    {hasUpdate && (
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-orange-600" />
                        <span className="text-xs text-orange-600">
                          New breakthrough
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {progress}%
                  </span>
                </div>
                <ProgressBar progress={progress} className="h-2" />
              </div>
            );
          })}
          {capabilities.length > 5 && (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/capabilities">View All Tracked Capabilities</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
