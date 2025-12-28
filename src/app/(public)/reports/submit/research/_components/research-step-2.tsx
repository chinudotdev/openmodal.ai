"use client";

import type { FormApi } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { ResearchReportInput } from "@/lib/validations";

interface ResearchStep2Props {
  // @ts-expect-error - TanStack Form type compatibility
  form: FormApi<Partial<ResearchReportInput>>;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: ResearchReportInput["step2"]) => void;
}

export function ResearchStep2({
  form,
  onNext,
  onBack,
  onUpdate,
}: ResearchStep2Props) {
  const [descriptionLength, setDescriptionLength] = useState(0);

  useEffect(() => {
    const subscription = form.store.subscribe((state: any) => {
      const step2 = state.values?.step2;
      if (step2) {
        setDescriptionLength(step2.impactDescription?.length || 0);
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
          name="step2.researchType"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>
                  What type of research is this?
                  <span className="text-destructive ml-1">*</span>
                </FieldLabel>
                <RadioGroup
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(
                      value as
                        | "breakthrough"
                        | "paper"
                        | "demo"
                        | "announcement"
                        | "other",
                    )
                  }
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="breakthrough" id="breakthrough" />
                    <Label htmlFor="breakthrough">Breakthrough</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paper" id="paper" />
                    <Label htmlFor="paper">Research Paper</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="demo" id="demo" />
                    <Label htmlFor="demo">Demo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="announcement" id="announcement" />
                    <Label htmlFor="announcement">Announcement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="research_other" />
                    <Label htmlFor="research_other">Other</Label>
                  </div>
                </RadioGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="step2.publicationDate"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Publication Date (optional)
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="month"
                  value={
                    field.state.value
                      ? new Date(field.state.value).toISOString().slice(0, 7)
                      : ""
                  }
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = new Date(e.target.value + "-01");
                      field.handleChange(date);
                    }
                  }}
                />
              </Field>
            );
          }}
        />

        <form.Field
          name="step2.impactDescription"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const value = field.state.value || "";
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Impact Description
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
                  placeholder="Describe the potential impact of this research on job automation..."
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
          name="step2.potentialJobsAffected"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Potential jobs affected (optional)
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
                  placeholder="e.g., 1000000"
                />
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
}
