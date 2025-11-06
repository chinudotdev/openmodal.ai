"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";
import { ProgressBar } from "@/components/shared/progress-bar";
import Link from "next/link";
import type { getJobBySlug } from "@/actions/jobs";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface RequiredCapabilitiesProps {
  job: NonNullable<Job>;
}

export function RequiredCapabilities({ job }: RequiredCapabilitiesProps) {
  const capabilities = job.capabilities || [];

  const blockingCapabilities = capabilities.filter((c) => c.blockingAutomation);
  const nonBlockingCapabilities = capabilities.filter(
    (c) => !c.blockingAutomation,
  );

  const getProgressColor = (progress: number) => {
    if (progress <= 25) {
      return "text-red-600";
    } else if (progress <= 75) {
      return "text-yellow-600";
    } else {
      return "text-green-600";
    }
  };

  const getStatusIcon = (progress: number) => {
    if (progress <= 25) {
      return "🔴";
    } else if (progress <= 75) {
      return "🟡";
    } else {
      return "✅";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required AI Capabilities</CardTitle>
        <p className="text-sm text-muted-foreground">
          This job requires {capabilities.length} AI capabilities to be fully
          automated. Here's the current status:
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {blockingCapabilities.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Blocking Automation (Critical Gaps):
            </h3>
            {blockingCapabilities.map((cap) => (
              <Card key={cap.id} className="border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getStatusIcon(cap.progressPercentage)}</span>
                          <h4 className="font-semibold text-foreground">
                            {cap.name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {cap.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Used in {cap.taskCount} tasks ({cap.percentageOfJob}%
                          of job)
                        </p>
                      </div>
                      <span
                        className={`text-lg font-bold ${getProgressColor(
                          cap.progressPercentage,
                        )}`}
                      >
                        {cap.progressPercentage}%
                      </span>
                    </div>
                    <ProgressBar
                      progress={cap.progressPercentage}
                      size="md"
                      animated
                    />
                    {cap.notes && (
                      <p className="text-sm text-muted-foreground">
                        {cap.notes}
                      </p>
                    )}
                    <Button variant="ghost" className="w-full group" asChild>
                      <Link href={`/capabilities/${cap.slug}`}>
                        View full capability analysis
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {nonBlockingCapabilities.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">
              Mostly Solved (Not blocking):
            </h3>
            {nonBlockingCapabilities.map((cap) => (
              <Card key={cap.id} className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getStatusIcon(cap.progressPercentage)}</span>
                          <h4 className="font-semibold text-foreground">
                            {cap.name}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Used in {cap.taskCount} tasks ({cap.percentageOfJob}%
                          of job)
                        </p>
                      </div>
                      <span
                        className={`text-lg font-bold ${getProgressColor(
                          cap.progressPercentage,
                        )}`}
                      >
                        {cap.progressPercentage}%
                      </span>
                    </div>
                    <ProgressBar
                      progress={cap.progressPercentage}
                      size="md"
                      animated
                    />
                    <Button variant="ghost" className="w-full group" asChild>
                      <Link href={`/capabilities/${cap.slug}`}>
                        View full capability analysis
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {capabilities.length > 5 && (
          <Button variant="outline" className="w-full" asChild>
            <Link href="#capabilities">
              View all {capabilities.length} capabilities
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
