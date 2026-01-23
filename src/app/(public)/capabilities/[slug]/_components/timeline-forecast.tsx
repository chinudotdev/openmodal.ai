import { Clock } from "lucide-react";
import type { getCapabilityBySlug } from "@/actions/capabilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface TimelineForecastProps {
  capability: NonNullable<Capability>;
}

// Timeline and prediction fields have been removed from the schema:
// - timelineEstimate, expertConsensus, communityPredictionMedian, reasoning
// Prediction functionality (submitPrediction, getUserPrediction) has been removed
export function TimelineForecast(_props: TimelineForecastProps) {
  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-2xl font-semibold">
          Timeline Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
          <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Timeline forecasting data not yet available for this capability.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Check back later as the community adds predictions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
