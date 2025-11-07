"use client";

import { useEffect } from "react";
import type { FormApi } from "@tanstack/react-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { DeploymentReportInput } from "@/lib/validations";

interface DeploymentStep2Props {
  // @ts-expect-error - TanStack Form type compatibility
  form: FormApi<Partial<DeploymentReportInput>>;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: DeploymentReportInput["step2"]) => void;
}

export function DeploymentStep2({
  form,
  onNext,
  onBack,
  onUpdate,
}: DeploymentStep2Props) {
  useEffect(() => {
    const subscription = form.store.subscribe((state: any) => {
      const step2 = state.values?.step2;
      if (step2) {
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
          name="step2.deploymentStatus"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>
                  Deployment Status
                  <span className="text-destructive ml-1">*</span>
                </FieldLabel>
                <RadioGroup
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(
                      value as
                        | "fully_deployed"
                        | "pilot"
                        | "announced"
                        | "failed",
                    )
                  }
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="fully_deployed"
                      id="fully_deployed"
                    />
                    <Label htmlFor="fully_deployed">
                      Fully deployed (in production)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pilot" id="pilot" />
                    <Label htmlFor="pilot">Pilot/testing phase</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="announced" id="announced" />
                    <Label htmlFor="announced">
                      Announced but not deployed
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="failed" id="failed" />
                    <Label htmlFor="failed">Deployment failed/cancelled</Label>
                  </div>
                </RadioGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="step2.deploymentDate"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  When was this deployed?
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
          name="step2.workersAffected"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            return (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  How many jobs/workers affected? (estimate)
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
                  placeholder="e.g., 50"
                />
              </Field>
            );
          }}
        />

        <form.Field
          name="step2.impactType"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>
                  Impact on human workers
                  <span className="text-destructive ml-1">*</span>
                </FieldLabel>
                <RadioGroup
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(
                      value as
                        | "completely_replaced"
                        | "partially_replaced"
                        | "augmented"
                        | "no_job_loss",
                    )
                  }
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="completely_replaced"
                      id="completely_replaced"
                    />
                    <Label htmlFor="completely_replaced">
                      Completely replaced (workers laid off)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="partially_replaced"
                      id="partially_replaced"
                    />
                    <Label htmlFor="partially_replaced">
                      Partially replaced (reduced headcount)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="augmented" id="augmented" />
                    <Label htmlFor="augmented">
                      Augmented (workers still needed but fewer)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no_job_loss" id="no_job_loss" />
                    <Label htmlFor="no_job_loss">No job loss yet</Label>
                  </div>
                </RadioGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="step2.automationPercentage"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const value = field.state.value ?? 0;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Percentage of work automated (0-100%)
                  <span className="text-destructive ml-1">*</span>
                </FieldLabel>
                <div className="mt-2 space-y-2">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseInt(e.target.value, 10))
                    }
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>0%</span>
                    <span className="font-medium">{value}%</span>
                    <span>100%</span>
                  </div>
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="step2.performanceComparison"
          // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
          children={(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>
                  Performance compared to humans
                  <span className="text-destructive ml-1">*</span>
                </FieldLabel>
                <RadioGroup
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(
                      value as
                        | "better_than_humans"
                        | "about_same"
                        | "worse_improving"
                        | "worse_not_improving",
                    )
                  }
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="better_than_humans"
                      id="better_than_humans"
                    />
                    <Label htmlFor="better_than_humans">
                      Better than humans
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="about_same" id="about_same" />
                    <Label htmlFor="about_same">About the same</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="worse_improving"
                      id="worse_improving"
                    />
                    <Label htmlFor="worse_improving">Worse but improving</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="worse_not_improving"
                      id="worse_not_improving"
                    />
                    <Label htmlFor="worse_not_improving">
                      Worse and not improving
                    </Label>
                  </div>
                </RadioGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
}
