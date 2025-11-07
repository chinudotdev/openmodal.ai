"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { CapabilityBadge } from "@/components/shared/capability-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskCardProps {
  task: {
    id: string;
    description: string;
    category: string | null;
    automationStatus: "safe" | "partial" | "replaceable";
    percentageOfJob: number;
    reasoningNotes: string | null;
    capabilities: Array<{
      capability: {
        id: string;
        slug: string;
        name: string;
        progressPercentage: number;
      };
      importance: "critical" | "important" | "minor";
    }>;
  };
}

export function TaskCard({ task }: TaskCardProps) {
  const getStatusIcon = (status: "safe" | "partial" | "replaceable") => {
    switch (status) {
      case "safe":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "replaceable":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: "safe" | "partial" | "replaceable") => {
    switch (status) {
      case "safe":
        return "Safe";
      case "partial":
        return "Partial";
      case "replaceable":
        return "Replaceable";
    }
  };

  const getStatusColor = (status: "safe" | "partial" | "replaceable") => {
    switch (status) {
      case "safe":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "partial":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "replaceable":
        return "bg-red-500/10 text-red-600 border-red-500/20";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(task.automationStatus)}
            <CardTitle className="text-lg">{task.description}</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={getStatusColor(task.automationStatus)}
          >
            {getStatusLabel(task.automationStatus)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {task.percentageOfJob}% of job time
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.reasoningNotes && (
          <p className="text-sm text-muted-foreground">{task.reasoningNotes}</p>
        )}

        {task.capabilities && task.capabilities.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Required Capabilities:
            </p>
            <div className="flex flex-wrap gap-2">
              {task.capabilities.map((tc) => (
                <CapabilityBadge
                  key={tc.capability.id}
                  capabilityId={tc.capability.id}
                  capabilitySlug={tc.capability.slug}
                  capabilityName={tc.capability.name}
                  progress={tc.capability.progressPercentage}
                  importance={tc.importance}
                />
              ))}
            </div>
          </div>
        )}

        <Button variant="ghost" className="w-full group" asChild>
          <Link
            href={`/capabilities/${task.capabilities[0]?.capability.slug || ""}`}
          >
            View capabilities
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
