import type { getCapabilityBySlug } from "@/actions/capabilities";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/date-utils";
import { ShareButton } from "./share-button";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface CapabilityHeaderProps {
  capability: NonNullable<Capability>;
}

export function CapabilityHeader({ capability }: CapabilityHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title and Actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            {capability.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Category:{" "}
              <span className="font-medium capitalize text-foreground">
                {capability.category}
              </span>
            </span>
            <span>•</span>
            <span>
              Updated{" "}
              {formatDistanceToNow(capability.updatedAt, { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton slug={capability.slug} />
        </div>
      </div>

      {/* Progress and Status */}
      <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
        <CardContent className="pt-0 pb-6 px-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-2xl font-bold text-primary">
                {capability.progressPercentage}%
              </span>
            </div>
            <ProgressBar
              progress={capability.progressPercentage}
              size="lg"
              animated
              gradient
            />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <StatusBadge status={capability.status} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
