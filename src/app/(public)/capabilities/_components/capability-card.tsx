import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/date-utils";

interface CapabilityCardProps {
  capability: any;
}

export function CapabilityCard({ capability }: CapabilityCardProps) {
  return (
    <Link href={`/capabilities/${capability.slug}`}>
      <Card className="h-full transition-all duration-300 hover:border-primary/50 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{capability.name}</CardTitle>
            <StatusBadge status={capability.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Category: {capability.category?.name || "Unknown"} • Updated{" "}
            {formatDistanceToNow(capability.updatedAt, { addSuffix: true })}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {capability.description}
          </p>

          {/* Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-sm font-bold text-primary">
                {capability.progressPercentage}%
              </span>
            </div>
            <ProgressBar progress={capability.progressPercentage} size="md" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Timeline</p>
              <p className="font-semibold text-foreground">
                {capability.timelineEstimate || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Jobs Protected</p>
              <p className="font-semibold text-foreground">
                {(capability.jobsProtectedCount / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {capability.trackingCount.toLocaleString("en-US")} tracking
            </span>
            <span>•</span>
            <span>{capability.researchActivityCount} organizations</span>
          </div>
        </CardContent>

        <CardFooter>
          <Button variant="ghost" className="w-full group">
            View details
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
