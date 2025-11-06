"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { getCapabilityBySlug } from "@/actions/capabilities";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface CapabilityDescriptionProps {
  capability: NonNullable<Capability>;
}

export function CapabilityDescription({
  capability,
}: CapabilityDescriptionProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>What Is This?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
