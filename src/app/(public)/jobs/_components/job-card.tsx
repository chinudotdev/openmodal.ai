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
    name: string;
    category: string;
    description: string;
    automationRiskPercentage: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    updatedAt: Date;
    capabilities?: Array<{
      id: string;
      slug: string;
      name: string;
      progressPercentage: number;
      importance?: "critical" | "important" | "minor";
    }>;
  };
}

// Map riskLevel to old AutomationStatus format for badge component
const mapRiskLevelToStatus = (
  riskLevel: "low" | "medium" | "high" | "critical",
): "safe" | "partial" | "high_risk" | "automated" => {
  switch (riskLevel) {
    case "low":
      return "safe";
    case "medium":
      return "partial";
    case "high":
      return "high_risk";
    case "critical":
      return "automated";
  }
};

export function JobCard({ job }: JobCardProps) {
  // Get top 3 capabilities
  const topCapabilities =
    job.capabilities
      ?.filter((cap) => cap)
      .slice(0, 3)
      .map((cap) => ({
        capabilityId: cap.id,
        capabilitySlug: cap.slug,
        capabilityName: cap.name,
        progress: cap.progressPercentage,
        importance: cap.importance || "minor",
      })) || [];

  return (
    <Link href={`/jobs/${job.slug}`}>
      <Card className="h-full border-muted shadow-none bg-transparent hover:bg-muted hover:border-primary/20 transition-all duration-300 rounded-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{job.name}</CardTitle>
            <JobStatusBadge status={mapRiskLevelToStatus(job.riskLevel)} />
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {job.category}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>

          {/* Automation Risk */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Automation Risk
              </span>
              <span className="text-sm font-bold text-primary">
                {job.automationRiskPercentage}%
              </span>
            </div>
            <AutomationProgressBar
              progress={job.automationRiskPercentage}
              size="md"
            />
          </div>

          {/* Key Protection/Risk Capabilities */}
          {topCapabilities.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {job.automationRiskPercentage <= 25
                  ? "Protected by:"
                  : job.automationRiskPercentage <= 75
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
