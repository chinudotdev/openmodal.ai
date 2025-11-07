"use client";

import { useEffect, useState } from "react";
import type { FormApi } from "@tanstack/react-form";
import CountrySelect from "@/components/country-select";
import RegionSelect from "@/components/region-select";
import { JobAutocompleteInput } from "@/components/reports/job-autocomplete-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { DeploymentReportInput } from "@/lib/validations";

interface DeploymentStep1Props {
  // @ts-expect-error - TanStack Form type compatibility
  form: FormApi<Partial<DeploymentReportInput>>;
  onNext: () => void;
  onUpdate: (data: DeploymentReportInput["step1"]) => void;
}

export function DeploymentStep1({
  form,
  onNext,
  onUpdate,
}: DeploymentStep1Props) {
  const [countryValue, setCountryValue] = useState<string | undefined>();

  useEffect(() => {
    const subscription = form.store.subscribe((state: any) => {
      const step1 = state.values?.step1;
      if (step1) {
        setCountryValue(step1.country);
        onUpdate(step1);
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
          name="step1.jobTitle"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <JobAutocompleteInput
                value={field.state.value || ""}
                onChange={(jobTitle, jobId) => {
                  field.handleChange(jobTitle);
                  if (jobId) {
                    form.setFieldValue("step1.jobId" as any, jobId);
                  }
                }}
                label="What job or task is being automated?"
                required
                error={isInvalid ? field.state.meta.errors?.[0] : undefined}
              />
            );
          }}
        />

        <form.Field
          name="step1.technology"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Technology/AI being used
                  <span className="text-destructive ml-1">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., ChatGPT (GPT-4), Claude, Gemini"
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="step1.company"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Company/Organization (optional)
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., TechCorp Inc."
                />
              </Field>
            );
          }}
        />

        <form.Field
          name="step1.country"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Country
                  <span className="text-destructive ml-1">*</span>
                </FieldLabel>
                <CountrySelect
                  value={field.state.value}
                  onChange={(value) => {
                    field.handleChange(value);
                    setCountryValue(value);
                  }}
                  placeholder="Select country"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        {countryValue && (
          <form.Field
            name="step1.stateProvince"
            // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
            children={(field: any) => {
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>State/Province</FieldLabel>
                  <RegionSelect
                    countryCode={countryValue}
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    placeholder="Select state/province"
                  />
                </Field>
              );
            }}
          />
        )}

        <form.Field
          name="step1.city"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>City</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., San Francisco"
                />
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
}
