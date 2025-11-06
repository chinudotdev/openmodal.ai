"use client";

import { getUserPrediction } from "@/actions/capabilities";
import { useSession } from "@/contexts/session-context";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { getCapabilityBySlug } from "@/actions/capabilities";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface PredictionDisplayProps {
  capability: NonNullable<Capability>;
}

export function PredictionDisplay({ capability }: PredictionDisplayProps) {
  const { user } = useSession();
  const [userPrediction, setUserPrediction] = useState<any>(null);

  useEffect(() => {
    if (user && capability.id) {
      getUserPrediction(capability.id, user.id).then(setUserPrediction);
    }
  }, [user, capability.id]);

  if (!user || !userPrediction) {
    return null;
  }

  const isMoreOptimistic =
    userPrediction.predictedYear < (capability.communityPredictionMedian || 0);
  const isMorePessimistic =
    userPrediction.predictedYear > (capability.communityPredictionMedian || 0);
  const isAligned = !isMoreOptimistic && !isMorePessimistic;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 font-semibold text-foreground">
              Your Prediction
            </h4>
            <p className="text-lg font-bold text-primary">
              {userPrediction.predictedYear}
              {userPrediction.predictedYearEnd &&
                `-${userPrediction.predictedYearEnd}`}
            </p>
            <p className="text-sm text-muted-foreground">
              Confidence:{" "}
              <span className="capitalize">{userPrediction.confidence}</span>
            </p>
          </div>

          {capability.communityPredictionMedian && (
            <div>
              <h4 className="mb-2 font-semibold text-foreground">
                Community Median
              </h4>
              <p className="text-lg font-bold text-muted-foreground">
                {capability.communityPredictionMedian}
              </p>
              <p className="text-sm text-muted-foreground">
                {isMoreOptimistic &&
                  "You're more optimistic than the community"}
                {isMorePessimistic &&
                  "You're more pessimistic than the community"}
                {isAligned && "You're aligned with the community"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
