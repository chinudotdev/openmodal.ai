"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";
import type { getJobBySlug } from "@/actions/jobs";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface AutomationTimelineProps {
  job: NonNullable<Job>;
}

export function AutomationTimeline({ job }: AutomationTimelineProps) {
  // Generate timeline based on current automation percentage and estimated year
  const currentYear = new Date().getFullYear();
  const estimatedYear = job.estimatedAutomationYear || 2050;
  const years = [];
  
  for (let year = currentYear; year <= estimatedYear + 5; year += 5) {
    years.push(year);
  }

  const getProjectedPercentage = (year: number) => {
    const current = job.automationPercentage;
    const target = 75; // High risk threshold
    const yearsToTarget = estimatedYear - currentYear;
    if (yearsToTarget <= 0) return current;
    
    const progress = (year - currentYear) / yearsToTarget;
    return Math.min(current + (target - current) * progress, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on capability progress and expert consensus:
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {years.map((year) => {
            const percentage = getProjectedPercentage(year);
            return (
              <div key={year} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {year}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <ProgressBar progress={percentage} size="md" animated={false} />
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4 space-y-2">
          <h3 className="font-semibold text-foreground">Key Milestones:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>2028: AI assistants handle documentation</li>
            <li>2032: Partial treatment plan automation</li>
            <li>{estimatedYear}+: Some hands-on therapy capabilities</li>
          </ul>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Physical manipulation remains the primary protection against full
            automation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

