"use client";

import { ArrowRight } from "lucide-react";
import type { getCapabilityBySlug } from "@/actions/capabilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface JobsProtectedProps {
  capability: NonNullable<Capability>;
}

export function JobsProtected({ capability }: JobsProtectedProps) {
  if (capability.jobsProtectedExamples.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs Depending On This</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {capability.jobsProtectedExamples.slice(0, 5).map((job, index) => (
            <li
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">
                {index + 1}. {job}
              </span>
              <Button variant="ghost" size="sm" className="h-8 gap-2">
                View
                <ArrowRight className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        {capability.jobsProtectedExamples.length > 5 && (
          <Button variant="outline" className="w-full gap-2">
            View all {capability.jobsProtectedExamples.length} jobs
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
