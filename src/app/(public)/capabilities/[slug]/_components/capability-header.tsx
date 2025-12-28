import { Building2, Share2, Users } from "lucide-react";
import type { getCapabilityBySlug } from "@/actions/capabilities";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/date-utils";
import { ShareButton } from "./share-button";
import { TrackButton } from "./track-button";

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
              <span className="font-medium text-foreground">
                {capability.category?.name}
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
          <TrackButton capabilityId={capability.id} />
          <ShareButton slug={capability.slug} />
        </div>
      </div>

      {/* Progress and Status */}
      <Card>
        <CardContent className="pt-6">
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
                <span className="text-muted-foreground">
                  Confidence:{" "}
                  <span className="font-medium capitalize text-foreground">
                    {capability.confidenceLevel}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tracking</p>
                <p className="text-lg font-semibold text-foreground">
                  {capability.trackingCount.toLocaleString("en-US")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Organizations</p>
                <p className="text-lg font-semibold text-foreground">
                  {capability.researchActivityCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Views</p>
                <p className="text-lg font-semibold text-foreground">
                  {capability.viewCount.toLocaleString("en-US")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
