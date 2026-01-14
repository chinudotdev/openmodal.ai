"use client";

import type { getCapabilityBySlug } from "@/actions/capabilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PredictionDisplay } from "./prediction-display";
import { PredictionForm } from "./prediction-form";
import { TimelineChart } from "./timeline-chart";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface TimelineForecastProps {
  capability: NonNullable<Capability>;
}

export function TimelineForecast({ capability }: TimelineForecastProps) {
  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-2xl font-semibold">Timeline Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
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
