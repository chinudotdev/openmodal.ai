"use client";

import { useEffect, useState } from "react";
import type { FormApi } from "@tanstack/react-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { BarrierReportInput } from "@/lib/validations";

interface BarrierStep2Props {
  // @ts-expect-error - TanStack Form type compatibility
  form: FormApi<Partial<BarrierReportInput>>;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: BarrierReportInput["step2"]) => void;
}

export function BarrierStep2({
  form,
  onNext,
  onBack,
  onUpdate,
}: BarrierStep2Props) {
  const [descriptionLength, setDescriptionLength] = useState(0);

  useEffect(() => {
    const subscription = form.store.subscribe((state: any) => {
      const step2 = state.values?.step2;
      if (step2) {
        setDescriptionLength(step2.barrierDescription?.length || 0);
        onUpdate(step2);
      }
    });
    return () => subscription();
  }, [form, onUpdate]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <FieldGroup className="gap-6">
        <form.Field
          name="step2.barrierType"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>
                  What type of barrier is this?
                  <span className="text-destructive ml-1">*</span>
                </FieldLabel>
                <RadioGroup
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(
                      value as
                        | "regulatory"
                        | "technical"
                        | "cost"
                        | "safety"
                        | "trust"
                        | "other",
                    )
                  }
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regulatory" id="regulatory" />
                    <Label htmlFor="regulatory">Regulatory</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="technical" id="technical" />
                    <Label htmlFor="technical">Technical</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cost" id="cost" />
                    <Label htmlFor="cost">Cost</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="safety" id="safety" />
                    <Label htmlFor="safety">Safety</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="trust" id="trust" />
                    <Label htmlFor="trust">Trust</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="barrier_other" />
                    <Label htmlFor="barrier_other">Other</Label>
                  </div>
                </RadioGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="step2.barrierDescription"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const value = field.state.value || "";
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Describe the barrier
                  <span className="text-destructive ml-1">*</span>
                </FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setDescriptionLength(e.target.value.length);
                  }}
                  placeholder="Describe what is preventing automation from replacing human work..."
                  rows={6}
                  className="resize-none"
                  aria-invalid={isInvalid}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {descriptionLength < 200
                      ? `${200 - descriptionLength} characters minimum`
                      : `${1000 - descriptionLength} characters remaining`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {descriptionLength}/1000
                  </p>
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="step2.estimatedSolveDate"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Estimated solve date (optional)
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., 2030-2035 or Unknown"
                />
              </Field>
            );
          }}
        />

        <form.Field
          name="step2.organizationsWorkingOnIt"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Organizations working on it (optional)
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min="0"
                  value={field.state.value?.toString() || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value ? parseInt(e.target.value, 10) : undefined,
                    )
                  }
                  placeholder="e.g., 5"
                />
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
}
