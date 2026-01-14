"use client";

import { AlertCircle, Check, X } from "lucide-react";
import type { getCapabilityBySlug } from "@/actions/capabilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface CurrentStateProps {
  capability: NonNullable<Capability>;
}

export function CurrentState({ capability }: CurrentStateProps) {
  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-2xl font-semibold">Current State</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        {/* What Works */}
        {capability.whatWorks.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">What Works</h3>
            </div>
            <ul className="space-y-2">
              {capability.whatWorks.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What Struggles */}
        {capability.whatStruggles.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-foreground">What Struggles</h3>
            </div>
            <ul className="space-y-2">
              {capability.whatStruggles.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Major Gaps */}
        {capability.whatDoesntWork.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <X className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-foreground">Major Gaps</h3>
            </div>
            <ul className="space-y-2">
              {capability.whatDoesntWork.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
