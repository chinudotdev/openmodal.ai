"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, ArrowRight, ThumbsUp, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";
import type { getJobBySlug } from "@/actions/jobs";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface AutomationReportsProps {
  job: NonNullable<Job>;
}

export function AutomationReports({ job }: AutomationReportsProps) {
  // Placeholder for reports - in a real implementation, this would come from the database
  const reports: Array<{
    id: string;
    type: "deployment" | "barrier";
    title: string;
    location: string;
    status: string;
    date: string;
    description: string;
    tasksAutomated?: string[];
    jobsAffected?: number;
    capabilityGap?: string;
    upvotes: number;
    comments: number;
    verified: boolean;
  }> = [];

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-World Automation Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No reports yet. Be the first to submit a deployment or barrier
            report!
          </p>
          <Button variant="outline" className="w-full">
            Submit a Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-World Automation Reports</CardTitle>
        <p className="text-sm text-muted-foreground">
          {reports.length} reports from the community:
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {report.type === "deployment" ? (
                      <Package className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <Badge variant="outline">
                      {report.type === "deployment" ? "DEPLOYMENT" : "BARRIER"}
                    </Badge>
                  </div>
                  <Badge variant="secondary">{report.status}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">
                    {report.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {report.location} • {report.date}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  {report.description}
                </p>

                {report.tasksAutomated && report.tasksAutomated.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Tasks Automated:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {report.tasksAutomated.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.capabilityGap && (
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Capability Gap: {report.capabilityGap}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {report.upvotes} upvotes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {report.comments} comments
                    </span>
                    {report.verified && (
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    View full report
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            View all {reports.length} reports
          </Button>
          <Button variant="outline" className="flex-1">
            Submit a report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

