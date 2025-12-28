"use client";

import type { FormApi } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import CountrySelect from "@/components/country-select";
import RegionSelect from "@/components/region-select";
import { CapabilityAutocompleteInput } from "@/components/reports/capability-autocomplete-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ResearchReportInput } from "@/lib/validations";

interface ResearchStep1Props {
  // @ts-expect-error - TanStack Form type compatibility
  form: FormApi<Partial<ResearchReportInput>>;
  onNext: () => void;
  onUpdate: (data: ResearchReportInput["step1"]) => void;
}

export function ResearchStep1({ form, onNext, onUpdate }: ResearchStep1Props) {
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
          name="step1.capabilityName"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <CapabilityAutocompleteInput
                value={field.state.value || ""}
                onChange={(capabilityName, capabilityId) => {
                  field.handleChange(capabilityName);
                  if (capabilityId) {
                    form.setFieldValue(
                      "step1.capabilityId" as any,
                      capabilityId,
                    );
                  }
                }}
                label="What capability is this research about?"
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
                  Technology/AI being researched
                  <span className="text-destructive ml-1">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., GPT-5, Claude 4, Gemini Ultra"
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="step1.organization"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Organization (optional)
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., OpenAI, Anthropic, Google"
                />
              </Field>
            );
          }}
        />

        <form.Field
          name="step1.country"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>Country (optional)</FieldLabel>
                <CountrySelect
                  value={field.state.value}
                  onChange={(value) => {
                    field.handleChange(value);
                    setCountryValue(value);
                  }}
                  placeholder="Select country"
                />
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
