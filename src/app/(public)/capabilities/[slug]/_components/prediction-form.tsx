import type { getCapabilityBySlug } from "@/actions/capabilities";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface PredictionFormProps {
  capability: NonNullable<Capability>;
}

// Prediction functionality has been removed from the schema
// - submitPrediction function deleted
// - capabilityPrediction table removed
export function PredictionForm(_props: PredictionFormProps) {
  // Component returns null - prediction submission is not available
  return null;
}
