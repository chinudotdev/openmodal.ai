"use client";

import type { getCapabilityBySlug } from "@/actions/capabilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface WhyItMattersProps {
  capability: NonNullable<Capability>;
}

export function WhyItMatters({ capability }: WhyItMattersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Why It Matters</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-line">
          {capability.whyItMatters}
        </p>
      </CardContent>
    </Card>
  );
}
