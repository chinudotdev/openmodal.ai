"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { saveOnboardingStep } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/session-context";
import {
  type AutomationExperienceInput,
  automationExperienceSchema,
} from "@/lib/validations";

interface StepAutomationExperienceProps {
  onNext: (data: AutomationExperienceInput) => void;
  onBack: () => void;
  isLoading: boolean;
  savedData?: Record<string, unknown> | null;
}

export function StepAutomationExperience({
  onNext,
  onBack,
  isLoading: parentLoading,
  savedData,
}: StepAutomationExperienceProps) {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      hasSeenAutomation: (savedData?.hasSeenAutomation as boolean) || false,
      automationTypes:
        (savedData?.automationTypes as (
          | "ai_ml_software"
          | "rpa"
          | "physical_robots"
          | "other"
        )[]) || [],
      automationImpact: (savedData?.automationImpact as string) || "",
    },
    validators: {
      onSubmit: automationExperienceSchema as any,
    },
    onSubmit: async ({ value }) => {
      if (!user) {
        toast.error("Please sign in to continue");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await saveOnboardingStep(user.id, 3, value);
        if (result.success) {
          onNext(value);
        } else {
          toast.error(result.error || "Failed to save step");
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
        <CardTitle>Your automation experience</CardTitle>
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
              name="hasSeenAutomation"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel>
                      Have you seen AI/automation at your workplace?
                    </FieldLabel>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="hasSeen-yes"
                          name="hasSeenAutomation"
                          checked={field.state.value === true}
                          onChange={() => field.handleChange(true)}
                          className="h-4 w-4"
                        />
                        <label htmlFor="hasSeen-yes" className="text-sm">
                          Yes, I've witnessed automation firsthand
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="hasSeen-no"
                          name="hasSeenAutomation"
                          checked={field.state.value === false}
                          onChange={() => field.handleChange(false)}
                          className="h-4 w-4"
                        />
                        <label htmlFor="hasSeen-no" className="text-sm">
                          No, not yet
                        </label>
                      </div>
                    </div>
                  </Field>
                );
              }}
            />

            <form.Field
              name="automationTypes"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                const types = field.state.value || [];
                return (
                  <Field>
                    <FieldLabel>
                      What type of automation have you seen? (Select all that
                      apply)
                    </FieldLabel>
                    <div className="space-y-2">
                      {[
                        {
                          value: "ai_ml_software",
                          label: "AI/ML software tools",
                        },
                        {
                          value: "rpa",
                          label: "Robotic process automation (RPA)",
                        },
                        { value: "physical_robots", label: "Physical robots" },
                        {
                          value: "other",
                          label: "Other automation technology",
                        },
                      ].map((type) => (
                        <div
                          key={type.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={type.value}
                            checked={types.includes(type.value as never)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.handleChange([
                                  ...types,
                                  type.value as never,
                                ]);
                              } else {
                                field.handleChange(
                                  types.filter((t) => t !== type.value),
                                );
                              }
                            }}
                          />
                          <label htmlFor={type.value} className="text-sm">
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </Field>
                );
              }}
            />

            <form.Field
              name="automationImpact"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      How has it affected your job? (Optional)
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Describe how automation has impacted your work..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      {field.state.value?.length || 0}/500 characters
                    </p>
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
                      "Next"
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
