"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "@/lib/date-utils";
import Link from "next/link";
import { Eye, Rocket, Shield, FlaskConical } from "lucide-react";
import { ModerationReportDetail } from "./moderation-report-detail";

import type { report } from "@/db/schema";

interface ModerationReportListClientProps {
  type: "pending" | "flagged" | "disputed";
  initialReports: (typeof report.$inferSelect)[];
}

const formatType = (type?: string) => {
  switch (type) {
    case "deployment":
      return {
        label: "Deployment",
        icon: Rocket,
        color: "bg-blue-100 text-blue-700",
      };
    case "barrier":
      return {
        label: "Barrier",
        icon: Shield,
        color: "bg-green-100 text-green-700",
      };
    case "research":
      return {
        label: "Research",
        icon: FlaskConical,
        color: "bg-purple-100 text-purple-700",
      };
    default:
      return {
        label: "Report",
        icon: Rocket,
        color: "bg-gray-100 text-gray-700",
      };
  }
};

export function ModerationReportListClient({
  type,
  initialReports,
}: ModerationReportListClientProps) {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const reports = initialReports;

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            No {type} reports at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (selectedReportId) {
    return (
      <ModerationReportDetail
        reportId={selectedReportId}
        onBack={() => setSelectedReportId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const typeInfo = formatType(report.type);
        const Icon = typeInfo.icon;
        const location =
          [report.city, report.stateProvince, report.country]
            .filter(Boolean)
            .join(", ") ||
          report.location ||
          "Location not specified";
        const postedAgo = report.createdAt
          ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })
          : "Unknown";

        return (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={typeInfo.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {typeInfo.label}
                    </Badge>
                    <Badge variant="outline">{report.status}</Badge>
                    {type === "flagged" && (
                      <Badge variant="destructive">
                        {report.downvotes || 0} downvotes
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold leading-tight">
                      {report.jobTitle || report.type || "Automation Report"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {report.description?.substring(0, 200)}
                      {report.description && report.description.length > 200
                        ? "..."
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>{location}</span>
                    <span>•</span>
                    <span>Posted {postedAgo}</span>
                    <span>•</span>
                    <span>{report.upvotes || 0} upvotes</span>
                    <span>•</span>
                    <span>{report.verificationCount || 0} verifications</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReportId(report.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/reports/${report.id}`}>View Public</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
