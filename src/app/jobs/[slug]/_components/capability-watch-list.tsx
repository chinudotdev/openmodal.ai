"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProgressBar } from "@/components/shared/progress-bar";
import type { getJobBySlug } from "@/actions/jobs";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface CapabilityWatchListProps {
  job: NonNullable<Job>;
}

export function CapabilityWatchList({ job }: CapabilityWatchListProps) {
  const blockingCapabilities = job.capabilities?.filter(
    (c) => c.blockingAutomation
  ) || [];

  if (blockingCapabilities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capability Watch List</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track these to monitor automation risk:
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {blockingCapabilities.slice(0, 3).map((cap) => (
          <div key={cap.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Link
                href={`/capabilities/${cap.slug}`}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {cap.name}
              </Link>
              <span className="text-sm font-semibold text-muted-foreground">
                {cap.progressPercentage}%
              </span>
            </div>
            <ProgressBar progress={cap.progressPercentage} size="sm" />
            <p className="text-xs text-muted-foreground">
              {cap.taskCount} tasks • {cap.percentageOfJob}% of job
            </p>
            <Button variant="ghost" size="sm" className="w-full group" asChild>
              <Link href={`/capabilities/${cap.slug}`}>
                Track capability
                <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        ))}
        {blockingCapabilities.length > 3 && (
          <Button variant="outline" className="w-full" asChild>
            <Link href="#capabilities">
              View all {blockingCapabilities.length} capabilities
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

