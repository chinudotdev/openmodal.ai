"use client";

import type { getCapabilityBySlug } from "@/actions/capabilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface WhyItMattersProps {
  capability: NonNullable<Capability>;
}

export function WhyItMatters({ capability }: WhyItMattersProps) {
  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-2xl font-semibold">Why It Matters</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <p className="text-muted-foreground whitespace-pre-line">
          {capability.whyItMatters}
        </p>
      </CardContent>
    </Card>
  );
}
