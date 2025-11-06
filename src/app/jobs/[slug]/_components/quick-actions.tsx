"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Share2, BarChart3, MessageSquare } from "lucide-react";
import { TrackButton } from "./track-button";
import { ShareButton } from "./share-button";
import Link from "next/link";

interface QuickActionsProps {
  jobId: string;
  slug: string;
}

export function QuickActions({ jobId, slug }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TrackButton jobId={jobId} />
        <ShareButton slug={slug} />
        <Button variant="outline" className="w-full gap-2" asChild>
          <Link href={`/jobs/compare?jobs=${encodeURIComponent(slug)}`}>
            <BarChart3 className="h-4 w-4" />
            Compare Jobs
          </Link>
        </Button>
        <Button variant="outline" className="w-full gap-2">
          <MessageSquare className="h-4 w-4" />
          Discuss
        </Button>
      </CardContent>
    </Card>
  );
}
