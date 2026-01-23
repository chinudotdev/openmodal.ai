import type { getCapabilityBySlug } from "@/actions/capabilities";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface PredictionDisplayProps {
  capability: NonNullable<Capability>;
}

// Prediction functionality has been removed from the schema
// - getUserPrediction function deleted
// - capabilityPrediction table removed
// - communityPredictionMedian field removed from capability
export function PredictionDisplay(_props: PredictionDisplayProps) {
  // Component returns null - prediction display is not available
  return null;
}
