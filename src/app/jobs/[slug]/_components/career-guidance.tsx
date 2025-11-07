"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import type { getJobBySlug } from "@/actions/jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface CareerGuidanceProps {
  job: NonNullable<Job>;
}

export function CareerGuidance({ job }: CareerGuidanceProps) {
  const relatedJobs = job.relatedJobs || [];
  const saferJobs = relatedJobs
    .filter(
      (rj) =>
        rj.automationPercentage < job.automationPercentage &&
        rj.automationStatus === "safe",
    )
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Guidance</CardTitle>
        <p className="text-sm text-muted-foreground">
          This job is relatively safe, but here's how to stay ahead:
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-foreground mb-3">
            Skills to Develop:
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Specialize in complex cases AI can't handle</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Focus on patient relationship building</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Learn to work alongside AI documentation tools</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Develop expertise in manual therapy techniques</span>
            </li>
          </ul>
        </div>

        {saferJobs.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Related Safer Jobs:
            </h3>
            <div className="space-y-2">
              {saferJobs.map((relatedJob) => (
                <div
                  key={relatedJob.id}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <div>
                    <Link
                      href={`/jobs/${relatedJob.slug}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {relatedJob.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {relatedJob.automationPercentage}% risk
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/jobs/${relatedJob.slug}`}>
                      View
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="#">Read: "Why Healthcare Jobs Remain Safe" →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
