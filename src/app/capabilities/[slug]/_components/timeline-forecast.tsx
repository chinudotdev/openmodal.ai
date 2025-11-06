"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PredictionForm } from "./prediction-form";
import { PredictionDisplay } from "./prediction-display";
import { TimelineChart } from "./timeline-chart";
import type { getCapabilityBySlug } from "@/actions/capabilities";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface TimelineForecastProps {
  capability: NonNullable<Capability>;
}

export function TimelineForecast({ capability }: TimelineForecastProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Expert Consensus */}
        {capability.expertConsensus && (
          <div>
            <h4 className="mb-2 font-semibold text-foreground">
              Expert Consensus
            </h4>
            <p className="text-sm text-muted-foreground">
              {capability.expertConsensus}
            </p>
          </div>
        )}

        {/* Community Prediction */}
        {capability.communityPredictionMedian && (
          <div>
            <h4 className="mb-2 font-semibold text-foreground">
              Community Prediction
            </h4>
            <p className="text-sm text-muted-foreground">
              {capability.communityPredictionMedian} (median of community
              forecasts)
            </p>
          </div>
        )}

        {/* Timeline Chart */}
        <TimelineChart capability={capability} />

        {/* Reasoning */}
        {capability.reasoning && (
          <div>
            <h4 className="mb-2 font-semibold text-foreground">Reasoning</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {capability.reasoning}
            </p>
          </div>
        )}

        {/* User Prediction */}
        <PredictionDisplay capability={capability} />
        <PredictionForm capability={capability} />
      </CardContent>
    </Card>
  );
}
