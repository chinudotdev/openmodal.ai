"use client";

import type { getCapabilityBySlug } from "@/actions/capabilities";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/date-utils";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface QuickFactsProps {
  capability: NonNullable<Capability>;
}

export function QuickFacts({ capability }: QuickFactsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Facts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold text-primary">
              {capability.progressPercentage}%
            </span>
          </div>
          <ProgressBar progress={capability.progressPercentage} size="sm" />
        </div>

        {capability.timelineEstimate && (
          <div>
            <p className="text-sm text-muted-foreground">Timeline</p>
            <p className="font-semibold text-foreground">
              {capability.timelineEstimate}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground">Jobs Protected</p>
          <p className="font-semibold text-foreground">
            {(capability.jobsProtectedCount / 1000000).toFixed(1)}M
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Research Organizations
          </p>
          <p className="font-semibold text-foreground">
            {capability.researchActivityCount}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Last Update</p>
          <p className="font-semibold text-foreground">
            {formatDistanceToNow(capability.updatedAt, { addSuffix: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
