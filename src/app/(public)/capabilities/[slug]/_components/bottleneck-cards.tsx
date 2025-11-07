"use client";

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { getCapabilityBySlug } from "@/actions/capabilities";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface BottleneckCardsProps {
  bottlenecks: NonNullable<Capability>["bottlenecks"];
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    label: "Critical",
    className: "border-red-500 bg-red-50 dark:bg-red-950/20",
    iconClassName: "text-red-500",
  },
  major: {
    icon: AlertCircle,
    label: "Major",
    className: "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
    iconClassName: "text-orange-500",
  },
  minor: {
    icon: Info,
    label: "Minor",
    className: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
    iconClassName: "text-yellow-500",
  },
};

const typeIcons: Record<string, string> = {
  hardware: "🔧",
  software: "💻",
  data: "📊",
  theory: "🧪",
  cost: "💰",
  safety: "🛡️",
};

export function BottleneckCards({ bottlenecks }: BottleneckCardsProps) {
  if (bottlenecks.length === 0) {
    return null;
  }

  // Group by severity
  const grouped = bottlenecks.reduce(
    (acc, bottleneck) => {
      if (!acc[bottleneck.severity]) {
        acc[bottleneck.severity] = [];
      }
      acc[bottleneck.severity].push(bottleneck);
      return acc;
    },
    {} as Record<string, typeof bottlenecks>,
  );

  const severities: Array<"critical" | "major" | "minor"> = [
    "critical",
    "major",
    "minor",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Bottlenecks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {severities.map((severity) => {
          const items = grouped[severity];
          if (!items || items.length === 0) return null;

          const config = severityConfig[severity];
          const Icon = config.icon;

          return (
            <div key={severity} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-5 w-5", config.iconClassName)} />
                <span className="font-semibold text-foreground">
                  {config.label.toUpperCase()}
                </span>
              </div>
              {items.map((bottleneck) => (
                <Card
                  key={bottleneck.id}
                  className={cn("border-2", config.className)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-foreground">
                          {bottleneck.title}
                        </h4>
                        <div className="flex gap-1">
                          {bottleneck.types.map((type) => (
                            <Badge
                              key={type}
                              variant="secondary"
                              className="text-xs"
                            >
                              {typeIcons[type] || "•"} {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bottleneck.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Estimated solve:{" "}
                          {bottleneck.estimatedSolveDate || "Unknown"}
                        </span>
                        <span>
                          {bottleneck.organizationsWorkingOnIt} organizations
                          working on it
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
