"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { getCapabilityBySlug } from "@/actions/capabilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface CapabilityDescriptionProps {
  capability: NonNullable<Capability>;
}

export function CapabilityDescription({
  capability,
}: CapabilityDescriptionProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-2xl font-semibold">What Is This?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        <p className="text-muted-foreground">{capability.description}</p>
        <Button
          variant="ghost"
          onClick={() => setShowTechnical(!showTechnical)}
          className="gap-2"
        >
          {showTechnical ? (
            <>
              Hide technical explanation
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show technical explanation
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
        {showTechnical && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {capability.technicalDescription}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
