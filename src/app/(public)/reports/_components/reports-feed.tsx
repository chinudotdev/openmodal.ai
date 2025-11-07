import { getApprovedReports } from "@/actions/reports";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  CheckCircle2,
  Cpu,
  FlaskConical,
  MapPin,
  MessageSquare,
  Rocket,
  Shield,
} from "lucide-react";
import Link from "next/link";

export async function ReportsFeed() {
  const reports = await getApprovedReports(20, 0);
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

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No reports yet. Be the first to submit a report!
          </p>
          <Button asChild>
            <Link href="/reports/submit">Submit Your First Report</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (value: number | null | undefined) => {
    return value == null ? 0 : value;
  };

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
        const isCommunityVerified = (report.verificationCount || 0) >= 3;

        return (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2 w-12 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Upvote"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold">
                    {formatNumber(report.upvotes || 0)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Downvote"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={typeInfo.color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {typeInfo.label}
                      </Badge>
                      {isCommunityVerified ? (
                        <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Community Verified (
                          {formatNumber(report.verificationCount || 0)})
                        </div>
                      ) : report.verificationCount ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4" />
                          {formatNumber(report.verificationCount)} verified
                        </div>
                      ) : null}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {location}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold leading-tight">
                      <Link
                        href={`/reports/${report.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {report.jobTitle || report.type || "Automation Report"}
                      </Link>
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {report.jobTitle || "Not specified"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Cpu className="h-4 w-4" />
                        {report.technology || "Not specified"}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {report.description?.substring(0, 200)}
                      {report.description && report.description.length > 200
                        ? "..."
                        : ""}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {formatNumber(report.commentCount || 0)} comments
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {location}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/reports/${report.id}`}>Read More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
