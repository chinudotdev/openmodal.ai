"use client";

import type { getJobBySlug } from "@/actions/jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface AboutSectionProps {
  job: NonNullable<Job>;
}

export function AboutSection({ job }: AboutSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About This Job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Key Responsibilities:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {job.keyResponsibilities.map((responsibility) => (
                <li key={responsibility}>{responsibility}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
