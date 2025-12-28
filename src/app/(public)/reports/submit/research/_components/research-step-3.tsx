"use client";

import type { FormApi } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { EvidenceLinkInput } from "@/components/reports/evidence-link-input";
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

interface ResearchStep3Props {
  // @ts-expect-error - TanStack Form type compatibility
  form: FormApi<Partial<ResearchReportInput>>;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: ResearchReportInput["step3"]) => void;
}

export function ResearchStep3({
  form,
  onNext,
  onBack,
  onUpdate,
}: ResearchStep3Props) {
  const [descriptionLength, setDescriptionLength] = useState(0);

  useEffect(() => {
    const subscription = form.store.subscribe((state: any) => {
      const step3 = state.values?.step3;
      if (step3) {
        setDescriptionLength(step3.description?.length || 0);
        onUpdate(step3);
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
          name="step3.description"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const value = field.state.value || "";
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Describe the research and its impact
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
                  placeholder="Provide a detailed description of the research and how it could impact job automation..."
                  rows={8}
                  className="resize-none"
                  aria-invalid={isInvalid}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {descriptionLength < 500
                      ? `${500 - descriptionLength} characters minimum`
                      : `${2000 - descriptionLength} characters remaining`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {descriptionLength}/2000
                  </p>
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="step3.evidenceLinks"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <EvidenceLinkInput
                value={field.state.value || []}
                onChange={(links) => field.handleChange(links)}
                label="Evidence Links"
                required
                error={isInvalid ? field.state.meta.errors?.[0] : undefined}
              />
            );
          }}
        />

        <form.Field
          name="step3.source"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const sourceValue = field.state.value;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>
                  How did you learn about this?
                  <span className="text-destructive ml-1">*</span>
                </FieldLabel>
                <RadioGroup
                  value={sourceValue}
                  onValueChange={(value) =>
                    field.handleChange(
                      value as
                        | "work_at_company"
                        | "news_article"
                        | "public_announcement"
                        | "industry_knowledge"
                        | "other",
                    )
                  }
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="work_at_company"
                      id="research_work_at_company"
                    />
                    <Label htmlFor="research_work_at_company">
                      I work/worked there
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="news_article"
                      id="research_news_article"
                    />
                    <Label htmlFor="research_news_article">News article</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="public_announcement"
                      id="research_public_announcement"
                    />
                    <Label htmlFor="research_public_announcement">
                      Public announcement
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="industry_knowledge"
                      id="research_industry_knowledge"
                    />
                    <Label htmlFor="research_industry_knowledge">
                      Industry knowledge
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="research_source_other" />
                    <Label htmlFor="research_source_other">Other</Label>
                  </div>
                </RadioGroup>
                {sourceValue === "other" && (
                  <form.Field
                    name="step3.sourceOther"
                    // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
                    children={(otherField: any) => {
                      return (
                        <Field className="mt-2">
                          <Input
                            id={otherField.name}
                            name={otherField.name}
                            value={otherField.state.value || ""}
                            onBlur={otherField.handleBlur}
                            onChange={(e) =>
                              otherField.handleChange(e.target.value)
                            }
                            placeholder="Please specify"
                            className="max-w-md"
                          />
                        </Field>
                      );
                    }}
                  />
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
}
