import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CriticalGapsProps {
  gaps: any[];
}

export function CriticalGaps({ gaps }: CriticalGapsProps) {
  if (gaps.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Critical Gaps (What's Protecting Jobs)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gaps.map((capability, index) => (
          <div
            key={capability.id}
            className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-muted-foreground">
                  #{index + 1}
                </span>
                <Link href={`/capabilities/${capability.slug}`}>
                  <h3 className="text-lg font-semibold text-foreground hover:text-primary">
                    {capability.name}
                  </h3>
                </Link>
                <Badge
                  variant={
                    capability.status === "unsolved"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {capability.progressPercentage}%
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <AlertTriangle className="mr-1 inline h-4 w-4" />
                  {capability.status === "unsolved" ? "CRITICAL" : "MAJOR"}
                </span>
                <span>•</span>
                <span>
                  Protects{" "}
                  {capability.jobsProtectedCount.toLocaleString("en-US")} jobs
                </span>
                <span>•</span>
                <span>
                  Timeline: {capability.timelineEstimate || "Unknown"}
                </span>
              </div>
            </div>
            <Link href={`/capabilities/${capability.slug}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                Details
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
        <Link href="/capabilities">
          <Button variant="outline" className="w-full gap-2">
            View all critical gaps
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
