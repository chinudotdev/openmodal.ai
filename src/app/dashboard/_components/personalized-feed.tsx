import { getPersonalizedReports } from "@/actions/reports";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  ArrowUp,
  CheckCircle2,
  Flame,
  FlaskConical,
  MapPin,
  MessageSquare,
  Rocket,
  Shield,
} from "lucide-react";
import Link from "next/link";

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

interface PersonalizedFeedProps {
  userId: string;
}

export async function PersonalizedFeed({ userId }: PersonalizedFeedProps) {
  // Fetch user profile to get job title and industry
  const profileResult = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  const profile = profileResult[0] || null;
  const jobTitle = profile?.currentJobTitle || null;
  const industry = profile?.industry || null;
  const reports = await getPersonalizedReports(jobTitle, industry, 5);

  const personalizationText =
    jobTitle && industry
      ? `Based on: ${jobTitle} • ${industry}`
      : jobTitle
        ? `Based on: ${jobTitle}`
        : industry
          ? `Based on: ${industry}`
          : "Complete your profile to see personalized content";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Personalized Feed
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reports">View More</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {personalizationText}
        </p>
      </CardHeader>
      <CardContent>
        {reports.length > 0 ? (
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
                <div
                  key={report.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={typeInfo.color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {typeInfo.label}
                      </Badge>
                      {isCommunityVerified ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Community Verified
                        </div>
                      ) : report.verificationCount ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3" />
                          {report.verificationCount} verified
                        </div>
                      ) : null}
                    </div>

                    <h3 className="font-semibold text-sm leading-tight">
                      <Link
                        href={`/reports/${report.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {report.jobTitle || report.type || "Automation Report"}
                      </Link>
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {report.description?.substring(0, 150)}
                      {report.description && report.description.length > 150
                        ? "..."
                        : ""}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ArrowUp className="h-3 w-3" />
                          {report.upvotes || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {report.commentCount || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {location.split(",")[0]}
                        </div>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                      >
                        <Link href={`/reports/${report.id}`}>Read</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Flame className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-muted-foreground mb-1">
              No personalized reports
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {jobTitle || industry
                ? "Try adjusting your profile to see more relevant content"
                : "Complete your profile to see personalized content"}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/reports">Browse All Reports</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
