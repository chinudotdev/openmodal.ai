"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Bell, MessageSquare, FileText } from "lucide-react";
import type { getJobBySlug } from "@/actions/jobs";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface CommunityStatsProps {
  job: NonNullable<Job>;
}

export function CommunityStats({ job }: CommunityStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {job.viewCount.toLocaleString()} views
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {job.trackingCount.toLocaleString()} tracking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {job.reportCount} reports
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {job.reportCount} reports
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
