"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { getCapabilityBySlug } from "@/actions/capabilities";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface JobImpactSectionProps {
  capability: NonNullable<Capability>;
}

export function JobImpactSection({ capability }: JobImpactSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs Protected By This Gap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-bold text-foreground">
            {capability.jobsProtectedCount.toLocaleString()} jobs
          </p>
          <p className="text-sm text-muted-foreground">
            globally depend on this capability
          </p>
        </div>

        {capability.jobsProtectedExamples.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Top Examples</h4>
            <ul className="space-y-2">
              {capability.jobsProtectedExamples
                .slice(0, 5)
                .map((job, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{job}</span>
                    <Button variant="ghost" size="sm" className="h-8 gap-2">
                      View analysis
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {capability.jobsProtectedCount > 5 && (
          <Button variant="outline" className="w-full gap-2">
            View all {capability.jobsProtectedCount.toLocaleString()} affected
            jobs
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
