"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { completeOnboarding, saveOnboardingStep } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/contexts/session-context";
import {
  type PlatformIntentInput,
  platformIntentSchema,
} from "@/lib/validations";

interface StepPlatformIntentProps {
  onNext: (data: PlatformIntentInput) => void;
  onBack: () => void;
  onFinish: () => void;
  isLoading: boolean;
  savedData?: Record<string, unknown> | null;
}

const platformIntents = [
  { value: "track_safety", label: "Track my job's safety" },
  { value: "understand_capabilities", label: "Understand AI capabilities" },
  { value: "find_resistant_careers", label: "Find AI-resistant careers" },
  { value: "learn_trends", label: "Learn about automation trends" },
  { value: "contribute_reports", label: "Contribute automation reports" },
  { value: "research", label: "Research purposes" },
  { value: "career_planning", label: "Career planning" },
];

export function StepPlatformIntent({
  onNext,
  onBack,
  onFinish,
  isLoading: parentLoading,
  savedData,
}: StepPlatformIntentProps) {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      platformIntents: (savedData?.platformIntents as string[]) || [],
      willingToContribute: (savedData?.willingToContribute as boolean) || false,
    },
    validators: {
      onSubmit: platformIntentSchema,
    },
    onSubmit: async ({ value }) => {
      if (!user) {
        toast.error("Please sign in to continue");
        return;
      }

      setIsSubmitting(true);
      try {
        // Save step
        const saveResult = await saveOnboardingStep(user.id, 4, value);
        if (!saveResult.success) {
          toast.error(saveResult.error || "Failed to save step");
          setIsSubmitting(false);
          return;
        }

        // Complete onboarding
        const completeResult = await completeOnboarding(user.id);
        if (completeResult.success) {
          toast.success(
            `You earned ${completeResult.pointsAwarded} reputation points!`,
          );
          onFinish();
        } else {
          toast.error(completeResult.error || "Failed to complete onboarding");
        }
      } catch (error) {
        toast.error("An error occurred");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const isLoading = parentLoading || isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>How can we help you?</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-4">
            <form.Field
              name="platformIntents"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                const intents = field.state.value || [];
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Why are you here? (Select all that apply)
                    </FieldLabel>
                    <div className="space-y-2">
                      {platformIntents.map((intent) => (
                        <div
                          key={intent.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={intent.value}
                            checked={intents.includes(intent.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.handleChange([...intents, intent.value]);
                              } else {
                                field.handleChange(
                                  intents.filter((i) => i !== intent.value),
                                );
                              }
                            }}
                          />
                          <label htmlFor={intent.value} className="text-sm">
                            {intent.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="willingToContribute"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel>
                      Would you be willing to submit reports?
                    </FieldLabel>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="willing-yes"
                          name="willingToContribute"
                          checked={field.state.value === true}
                          onChange={() => field.handleChange(true)}
                          className="h-4 w-4"
                        />
                        <label htmlFor="willing-yes" className="text-sm">
                          Yes, I'd like to contribute
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="willing-maybe"
                          name="willingToContribute"
                          checked={field.state.value === false}
                          onChange={() => field.handleChange(false)}
                          className="h-4 w-4"
                        />
                        <label htmlFor="willing-maybe" className="text-sm">
                          Maybe later
                        </label>
                      </div>
                    </div>
                  </Field>
                );
              }}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
              >
                Back
              </Button>
              <form.Subscribe
                selector={(formState) => [
                  formState.canSubmit,
                  formState.isSubmitting,
                ]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isLoading}
                    className="ml-auto"
                  >
                    {isSubmitting || isLoading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      "Finish"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
