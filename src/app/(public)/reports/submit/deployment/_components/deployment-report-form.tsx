"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getDraftForEditing, submitReport } from "@/actions/reports";
import { ReportFormNavigation } from "@/components/reports/report-form-navigation";
import { ReportFormStepper } from "@/components/reports/report-form-stepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/contexts/session-context";
import {
  type DeploymentReportInput,
  deploymentReportSchema,
} from "@/lib/validations";
import { DeploymentStep1 } from "./deployment-step-1";
import { DeploymentStep2 } from "./deployment-step-2";
import { DeploymentStep3 } from "./deployment-step-3";
import { DeploymentStep4 } from "./deployment-step-4";

interface DeploymentReportFormProps {
  draftId?: string;
}

/**
 * Validates step 3 data for deployment reports
 * Returns validation result with error message if invalid
 */
function validateStep3(step3: DeploymentReportInput["step3"] | undefined): {
  isValid: boolean;
  error?: string;
} {
  if (!step3) {
    return { isValid: false, error: "Step 3 data is missing" };
  }

  if (!step3.description || step3.description.length < 500) {
    return {
      isValid: false,
      error: "Description must be at least 500 characters",
    };
  }

  if (
    !step3.evidenceLinks ||
    !Array.isArray(step3.evidenceLinks) ||
    step3.evidenceLinks.length === 0
  ) {
    return {
      isValid: false,
      error: "At least one evidence link is required",
    };
  }

  if (!step3.source) {
    return { isValid: false, error: "Please select a source" };
  }

  return { isValid: true };
}

export function DeploymentReportForm({ draftId }: DeploymentReportFormProps) {
  const { user } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(!!draftId);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [initialFormData, setInitialFormData] = useState<
    Partial<DeploymentReportInput>
  >({
    type: "deployment",
    isDraft: false,
  });

  const [formData, setFormData] =
    useState<Partial<DeploymentReportInput>>(initialFormData);

  const form = useForm({
    defaultValues: initialFormData,
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
        // Get the latest form state values
        const currentFormValues = form.state.values;

        // Ensure we have complete step3 data - prioritize formData which should have all steps
        // formData is updated via onUpdate callbacks as user progresses through steps
        const completeStep3 =
          formData.step3 || currentFormValues.step3 || value.step3;

        // Validate step 3 using shared validation helper
        const step3Validation = validateStep3(completeStep3);
        if (!step3Validation.isValid) {
          toast.error(
            step3Validation.error ||
              "Step 3 data is missing. Please go back and complete step 3.",
          );
          setIsSubmitting(false);
          return;
        }

        // Build the complete report data - prioritize formData which has all steps
        const step1 = formData.step1 || currentFormValues.step1 || value.step1;
        const step2 = formData.step2 || currentFormValues.step2 || value.step2;

        // Final validation - ensure all steps are present
        if (!step1 || !step2 || !completeStep3) {
          toast.error("Please complete all steps before submitting");
          setIsSubmitting(false);
          return;
        }

        const mergedValue: DeploymentReportInput = {
          type: "deployment",
          isDraft: formData.isDraft || false,
          step1,
          step2,
          step3: completeStep3,
        };

        const result = await submitReport(
          user.id,
          mergedValue,
          draftId, // Pass draftId if editing existing draft
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

  // Load draft data if draftId is provided
  useEffect(() => {
    if (draftId && user) {
      let cancelled = false;
      setIsLoadingDraft(true);
      getDraftForEditing(draftId, user.id)
        .then((result) => {
          if (cancelled) return;
          if (result.success && result.data.type === "deployment") {
            const draftData = result.data;
            setFormData(draftData);
            setInitialFormData(draftData);
            // Reset form with draft data
            form.reset(draftData as Partial<DeploymentReportInput>);
          } else {
            toast.error(result.success ? "Invalid draft type" : result.error);
          }
        })
        .catch((error) => {
          if (cancelled) return;
          console.error("Error loading draft:", error);
          toast.error("Failed to load draft");
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoadingDraft(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }
  }, [draftId, user, form]);

  // Validate current step and show errors
  const validateCurrentStep = async (): Promise<boolean> => {
    const currentFormValues = form.state.values;

    // Mark that validation was attempted
    setValidationAttempted(true);

    if (currentStep === 1) {
      const step1Data = currentFormValues.step1 || formData.step1;
      let hasErrors = false;

      // Check for empty required fields
      if (!step1Data?.jobTitle || step1Data.jobTitle.trim() === "") {
        hasErrors = true;
      }
      if (!step1Data?.technology || step1Data.technology.trim() === "") {
        hasErrors = true;
      }
      if (!step1Data?.country) {
        hasErrors = true;
      }

      if (hasErrors) {
        toast.error("Please complete all required fields");
        return false;
      }
      setValidationAttempted(false);
      return true;
    }

    if (currentStep === 2) {
      const step2Data = currentFormValues.step2 || formData.step2;
      let hasErrors = false;

      if (!step2Data?.deploymentStatus) {
        form.setFieldMeta("step2.deploymentStatus" as any, (prev: any) => ({
          ...prev,
          isTouched: true,
          isValid: false,
          errors: ["Deployment status is required"],
        }));
        hasErrors = true;
      }
      if (!step2Data?.impactType) {
        form.setFieldMeta("step2.impactType" as any, (prev: any) => ({
          ...prev,
          isTouched: true,
          isValid: false,
          errors: ["Impact type is required"],
        }));
        hasErrors = true;
      }
      if (step2Data?.automationPercentage === undefined) {
        form.setFieldMeta("step2.automationPercentage" as any, (prev: any) => ({
          ...prev,
          isTouched: true,
          isValid: false,
          errors: ["Automation percentage is required"],
        }));
        hasErrors = true;
      }

      if (hasErrors) {
        toast.error("Please complete all required fields");
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      const step3Data = currentFormValues.step3 || formData.step3;

      // Use shared validation helper
      const step3Validation = validateStep3(step3Data);
      if (!step3Validation.isValid) {
        // Set field meta for form validation
        if (!step3Data?.description || step3Data.description.length < 500) {
          form.setFieldMeta("step3.description" as any, (prev: any) => ({
            ...prev,
            isTouched: true,
            isValid: false,
            errors: ["Description must be at least 500 characters"],
          }));
        }
        if (
          !step3Data?.evidenceLinks ||
          !Array.isArray(step3Data.evidenceLinks) ||
          step3Data.evidenceLinks.length === 0
        ) {
          form.setFieldMeta("step3.evidenceLinks" as any, (prev: any) => ({
            ...prev,
            isTouched: true,
            isValid: false,
            errors: ["At least one evidence link is required"],
          }));
        }
        if (!step3Data?.source) {
          form.setFieldMeta("step3.source" as any, (prev: any) => ({
            ...prev,
            isTouched: true,
            isValid: false,
            errors: ["Please select a source"],
          }));
        }

        // Show toast error
        toast.error(
          step3Validation.error || "Please complete all fields in step 3",
        );
        return false;
      }

      return true;
    }

    return true;
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      // Validate current step
      const isValid = await validateCurrentStep();

      if (!isValid) {
        // Validation failed - errors are already shown via toast
        // Field components will show errors if they have errors in their state
        return;
      }

      // Get current form values
      const currentFormValues = form.state.values;

      // For step 3, update formData with complete step3 before moving to step 4
      if (currentStep === 3) {
        const step3Data = currentFormValues.step3 || formData.step3;
        const updatedFormData: Partial<DeploymentReportInput> = {
          ...formData,
          step3: step3Data,
        };
        setFormData(updatedFormData);
      }

      // Merge formData with form state
      const mergedData: Partial<DeploymentReportInput> = {
        ...formData,
        step1: currentFormValues.step1 || formData.step1,
        step2: currentFormValues.step2 || formData.step2,
        step3: currentFormValues.step3 || formData.step3,
      };

      setFormData(mergedData);
      setCurrentStep(currentStep + 1);
    } else {
      // On step 4, submit the form
      // The onSubmit handler will merge formData with form values
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
    // Also check formData as fallback to ensure we have the data
    switch (step) {
      case 1:
        return { step1: values.step1 || formData.step1 };
      case 2:
        return { step2: values.step2 || formData.step2 };
      case 3:
        return { step3: values.step3 || formData.step3 };
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

  if (isLoadingDraft) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8" />
            <span className="ml-2 text-muted-foreground">Loading draft...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            validationAttempted={validationAttempted}
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
