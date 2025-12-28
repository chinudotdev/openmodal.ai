"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { submitReport } from "@/actions/reports";
import { ReportFormNavigation } from "@/components/reports/report-form-navigation";
import { ReportFormStepper } from "@/components/reports/report-form-stepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/contexts/session-context";
import {
  type DeploymentReportInput,
  deploymentReportSchema,
} from "@/lib/validations";
import { DeploymentStep1 } from "./deployment-step-1";
import { DeploymentStep2 } from "./deployment-step-2";
import { DeploymentStep3 } from "./deployment-step-3";
import { DeploymentStep4 } from "./deployment-step-4";

export function DeploymentReportForm() {
  const { user } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<DeploymentReportInput>>({
    type: "deployment",
    isDraft: false,
  });

  const form = useForm({
    defaultValues: formData,
    validators: {
      onSubmit: deploymentReportSchema as any,
    },
    onSubmit: async ({ value }) => {
      if (!user) {
        toast.error("Please sign in to submit reports");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await submitReport(
          user.id,
          value as DeploymentReportInput,
        );
        if (result.success) {
          toast.success("Report submitted successfully!");
          router.push(`/reports/submit/success?reportId=${result.reportId}`);
        } else {
          toast.error(result.error || "Failed to submit report");
        }
      } catch (error) {
        toast.error("An error occurred");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleNext = () => {
    if (currentStep < 4) {
      // Validate current step before moving forward
      const stepData = getStepData(currentStep);
      if (validateStep(currentStep, stepData)) {
        // Sync formData with form state before moving to next step
        const currentFormValues = form.state.values;
        setFormData({
          ...formData,
          step1: currentFormValues.step1,
          step2: currentFormValues.step2,
          step3: currentFormValues.step3,
        });
        setCurrentStep(currentStep + 1);
      }
    } else {
      form.handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error("Please sign in to save drafts");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentData = {
        ...formData,
        ...getStepData(currentStep),
        isDraft: true,
      };
      const result = await submitReport(
        user.id,
        currentData as DeploymentReportInput,
      );
      if (result.success) {
        toast.success("Draft saved successfully");
      } else {
        toast.error(result.error || "Failed to save draft");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepData = (step: number) => {
    const values = form.state.values;
    switch (step) {
      case 1:
        return { step1: values.step1 };
      case 2:
        return { step2: values.step2 };
      case 3:
        return { step3: values.step3 };
      default:
        return {};
    }
  };

  const validateStep = (
    step: number,
    data: Record<string, unknown>,
  ): boolean => {
    // Basic validation - full validation happens on submit
    switch (step) {
      case 1:
        return !!(
          (data.step1 as Record<string, unknown>)?.jobTitle &&
          (data.step1 as Record<string, unknown>)?.technology &&
          (data.step1 as Record<string, unknown>)?.country
        );
      case 2:
        return !!(
          (data.step2 as Record<string, unknown>)?.deploymentStatus &&
          (data.step2 as Record<string, unknown>)?.impactType &&
          (data.step2 as Record<string, unknown>)?.automationPercentage !==
            undefined
        );
      case 3: {
        const step3 = data.step3 as Record<string, unknown>;
        return !!(
          step3?.description &&
          step3?.evidenceLinks &&
          Array.isArray(step3.evidenceLinks) &&
          (step3.evidenceLinks as unknown[]).length > 0 &&
          step3?.source
        );
      }
      default:
        return true;
    }
  };

  const updateFormData = (step: number, data: Record<string, unknown>) => {
    const newData = { ...formData };
    if (step === 1) newData.step1 = data as DeploymentReportInput["step1"];
    if (step === 2) newData.step2 = data as DeploymentReportInput["step2"];
    if (step === 3) newData.step3 = data as DeploymentReportInput["step3"];
    setFormData(newData);
    // @ts-expect-error - TanStack Form type compatibility
    form.setFieldValue(`step${step}`, data);
  };

  const stepTitles = [
    "Basic Information",
    "Impact Data",
    "Evidence & Details",
    "Review & Submit",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{stepTitles[currentStep - 1]}</CardTitle>
        <ReportFormStepper
          currentStep={currentStep}
          totalSteps={4}
          className="mt-4"
        />
      </CardHeader>
      <CardContent>
        {currentStep === 1 && (
          <DeploymentStep1
            form={form}
            onNext={handleNext}
            onUpdate={(data) => updateFormData(1, data)}
          />
        )}
        {currentStep === 2 && (
          <DeploymentStep2
            form={form}
            onNext={handleNext}
            onBack={handleBack}
            onUpdate={(data) => updateFormData(2, data)}
          />
        )}
        {currentStep === 3 && (
          <DeploymentStep3
            form={form}
            onNext={handleNext}
            onBack={handleBack}
            onUpdate={(data) => updateFormData(3, data)}
          />
        )}
        {currentStep === 4 && (
          <DeploymentStep4
            form={form}
            onBack={handleBack}
            formData={formData as DeploymentReportInput}
          />
        )}

        {currentStep < 4 && (
          <ReportFormNavigation
            onBack={currentStep > 1 ? handleBack : undefined}
            onNext={handleNext}
            onSaveDraft={handleSaveDraft}
            isSubmitting={isSubmitting}
            nextLabel={currentStep === 3 ? "Next: Review" : "Next"}
            backLabel="Back"
            className="mt-6"
          />
        )}
      </CardContent>
    </Card>
  );
}
