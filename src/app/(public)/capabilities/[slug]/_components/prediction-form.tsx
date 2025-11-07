"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { getCapabilityBySlug } from "@/actions/capabilities";
import { submitPrediction } from "@/actions/capabilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/session-context";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface PredictionFormProps {
  capability: NonNullable<Capability>;
}

export function PredictionForm({ capability }: PredictionFormProps) {
  const { user } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictedYear, setPredictedYear] = useState("");
  const [predictedYearEnd, setPredictedYearEnd] = useState("");
  const [confidence, setConfidence] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [reasoning, setReasoning] = useState("");
  const [background, setBackground] = useState<
    "general" | "professional" | "academic" | "researcher"
  >("general");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to submit predictions");
      window.location.href = "/login";
      return;
    }

    if (!predictedYear) {
      toast.error("Please enter a predicted year");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitPrediction(capability.id, user.id, {
        predictedYear: parseInt(predictedYear),
        predictedYearEnd: predictedYearEnd
          ? parseInt(predictedYearEnd)
          : undefined,
        confidence,
        reasoning: reasoning || undefined,
        background,
      });
      toast.success("Prediction submitted!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to submit prediction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Prediction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="predictedYear">Predicted Year</Label>
              <Input
                id="predictedYear"
                type="number"
                min={currentYear}
                max={currentYear + 50}
                value={predictedYear}
                onChange={(e) => setPredictedYear(e.target.value)}
                placeholder="2035"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="predictedYearEnd">
                End Year (optional, for ranges)
              </Label>
              <Input
                id="predictedYearEnd"
                type="number"
                min={predictedYear ? parseInt(predictedYear) : currentYear}
                max={currentYear + 50}
                value={predictedYearEnd}
                onChange={(e) => setPredictedYearEnd(e.target.value)}
                placeholder="2040"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Confidence Level</Label>
            <Select
              value={confidence}
              onValueChange={(value: "low" | "medium" | "high") =>
                setConfidence(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Background</Label>
            <RadioGroup
              value={background}
              onValueChange={(value: any) => setBackground(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general" className="font-normal">
                  General interest
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="professional" id="professional" />
                <Label htmlFor="professional" className="font-normal">
                  Industry professional
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="academic" id="academic" />
                <Label htmlFor="academic" className="font-normal">
                  Academic researcher
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="researcher" id="researcher" />
                <Label htmlFor="researcher" className="font-normal">
                  Working on this problem
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasoning">Reasoning (optional)</Label>
            <Textarea
              id="reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Explain your prediction..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Prediction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
