"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AutomationProgressBar } from "@/components/shared/automation-progress-bar";
import { CapabilityBadge } from "@/components/shared/capability-badge";
import { JobStatusBadge } from "@/components/shared/job-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/date-utils";

interface JobCardProps {
  job: {
    id: string;
    slug: string;
    title: string;
    industry: string;
    category: string;
    shortDescription: string;
    automationPercentage: number;
    automationStatus: "safe" | "partial" | "high_risk" | "automated";
    totalWorkersGlobal: number | null;
    medianSalaryUsa: number | null;
    updatedAt: Date;
    capabilities?: Array<{
      capability?: {
        id: string;
        slug: string;
        name: string;
        progressPercentage: number;
      };
      importance?: "critical" | "important" | "minor";
    }>;
  };
}

export function JobCard({ job }: JobCardProps) {
  const formatWorkers = (count: number | null) => {
    if (!count) return "N/A";
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toLocaleString();
  };

  const formatSalary = (salary: number | null) => {
    if (!salary) return "N/A";
    return `$${(salary / 1000).toFixed(0)}k`;
  };

  // Get top 3 capabilities
  const topCapabilities =
    job.capabilities
      ?.filter((jc) => jc.capability)
      .slice(0, 3)
      .map((jc) => ({
        capabilityId: jc.capability!.id,
        capabilitySlug: jc.capability!.slug,
        capabilityName: jc.capability!.name,
        progress: jc.capability!.progressPercentage,
        importance: jc.importance || "minor",
      })) || [];

  return (
    <Link href={`/jobs/${job.slug}`}>
      <Card className="h-full transition-all duration-300 hover:border-primary/50 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <JobStatusBadge status={job.automationStatus} />
          </div>
          <p className="text-sm text-muted-foreground">
            {job.industry} | {job.category}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.shortDescription}
          </p>

          {/* Automation Risk */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Automation Risk
              </span>
              <span className="text-sm font-bold text-primary">
                {job.automationPercentage}%
              </span>
            </div>
            <AutomationProgressBar
              progress={job.automationPercentage}
              size="md"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Workers</p>
              <p className="font-semibold text-foreground">
                {formatWorkers(job.totalWorkersGlobal)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Median Salary</p>
              <p className="font-semibold text-foreground">
                {formatSalary(job.medianSalaryUsa)}
              </p>
            </div>
          </div>

          {/* Key Protection/Risk Capabilities */}
          {topCapabilities.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {job.automationPercentage <= 25
                  ? "Protected by:"
                  : job.automationPercentage <= 75
                    ? "Partially protected by:"
                    : "At risk due to:"}
              </p>
              <div className="flex flex-wrap gap-2">
                {topCapabilities.map((cap) => (
                  <CapabilityBadge
                    key={cap.capabilityId}
                    capabilityId={cap.capabilityId}
                    capabilitySlug={cap.capabilitySlug}
                    capabilityName={cap.capabilityName}
                    progress={cap.progress}
                    importance={cap.importance}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Updated {formatDistanceToNow(job.updatedAt, { addSuffix: true })}
            </span>
          </div>
        </CardContent>

        <CardFooter>
          <Button variant="ghost" className="w-full group">
            View Full Analysis
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
