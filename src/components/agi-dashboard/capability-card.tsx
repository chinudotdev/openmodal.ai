"use client";

import {
  ArrowRight,
  Brain,
  Eye,
  Hand,
  MessageSquare,
  Target,
} from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Capability } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface CapabilityCardProps {
  capability: Capability;
  index?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Eye,
  Brain,
  MessageSquare,
  Hand,
  Target,
};

export function CapabilityCard({ capability, index = 0 }: CapabilityCardProps) {
  // Get the icon component from the map
  const IconComponent = iconMap[capability.icon];

  return (
    <Link
      href={`/capabilities/${capability.id}`}
      className={cn(
        "block transition-all duration-300 hover:-translate-y-1",
        "animate-fade-in-up",
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Card className="h-full hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {IconComponent && (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
              )}
              <CardTitle className="text-lg">{capability.name}</CardTitle>
            </div>
            <StatusBadge status={capability.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-sm font-bold text-primary">
                {capability.progress}%
              </span>
            </div>
            <ProgressBar progress={capability.progress} size="md" />
          </div>

          {/* Strong Areas */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Strong areas:
            </h4>
            <ul className="space-y-1.5">
              {capability.strongAreas.map((area) => (
                <li
                  key={`${capability.id}-strong-${area.name}`}
                  className="flex items-center justify-between text-sm text-muted-foreground"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {area.name}
                  </span>
                  <span className="font-medium text-foreground">
                    {area.progress}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Gaps */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Key gaps:
            </h4>
            <ul className="space-y-1.5">
              {capability.keyGaps.map((gap) => (
                <li
                  key={`${capability.id}-gap-${gap.name}`}
                  className="flex items-center justify-between text-sm text-muted-foreground"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    {gap.name}
                  </span>
                  <span className="font-medium text-foreground">
                    {gap.progress}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Jobs Protected */}
          <div className="rounded-lg bg-muted px-3 py-2">
            <p className="text-sm text-muted-foreground">
              Protects:{" "}
              <span className="font-semibold text-foreground">
                {(capability.jobsProtected / 1000000).toFixed(1)}M jobs
              </span>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between text-sm font-medium text-primary group-hover:text-primary/80">
          <span>View details</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </CardFooter>
      </Card>
    </Link>
  );
}
