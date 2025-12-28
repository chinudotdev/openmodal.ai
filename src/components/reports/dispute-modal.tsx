"use client";

import { useForm } from "@tanstack/react-form";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { disputeReport } from "@/actions/verifications";
import { EvidenceLinkInput } from "@/components/reports/evidence-link-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/session-context";
import { disputeSchema } from "@/lib/validations";

interface DisputeModalProps {
  reportId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisputeModal({
  reportId,
  open,
  onOpenChange,
}: DisputeModalProps) {
  const { user } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      reportId,
      reason: undefined as
        | "factually_inaccurate"
        | "missing_context"
        | "exaggerated_claims"
        | "outdated_information"
        | "spam_irrelevant"
        | "other"
        | undefined,
      explanation: "",
      evidenceLinks: [] as string[],
    },
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: TanStack Form validator typing mismatch
      onSubmit: disputeSchema as any,
    },
    onSubmit: async ({ value }) => {
      if (!user) {
        toast.error("Please sign in to dispute reports");
        return;
      }

      if (!value.reason) {
        toast.error("Please select a reason");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await disputeReport(user.id, {
          ...value,
          reason: value.reason,
        });
        if (result.success) {
          toast.success("Dispute submitted successfully");
          onOpenChange(false);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to submit dispute");
        }
      } catch (error) {
        toast.error("An error occurred");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dispute Report</DialogTitle>
          <DialogDescription>
            Report an issue with this report
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-6">
            <form.Field
              name="reason"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      What's the issue?
                      <span className="text-destructive ml-1">*</span>
                    </FieldLabel>
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as
                            | "factually_inaccurate"
                            | "missing_context"
                            | "exaggerated_claims"
                            | "outdated_information"
                            | "spam_irrelevant"
                            | "other",
                        )
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="factually_inaccurate"
                          id="reason_inaccurate"
                        />
                        <Label htmlFor="reason_inaccurate">
                          Factually inaccurate
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="missing_context"
                          id="reason_context"
                        />
                        <Label htmlFor="reason_context">
                          Missing important context
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="exaggerated_claims"
                          id="reason_exaggerated"
                        />
                        <Label htmlFor="reason_exaggerated">
                          Exaggerated claims
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="outdated_information"
                          id="reason_outdated"
                        />
                        <Label htmlFor="reason_outdated">
                          Outdated information
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="spam_irrelevant"
                          id="reason_spam"
                        />
                        <Label htmlFor="reason_spam">Spam or irrelevant</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="reason_other" />
                        <Label htmlFor="reason_other">
                          Other (explain below)
                        </Label>
                      </div>
                    </RadioGroup>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="explanation"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const value = field.state.value || "";
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Please explain the issue
                      <span className="text-destructive ml-1">*</span>
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="The numbers are exaggerated. Only 20 positions were eliminated, not 50. I work in the department and can verify the actual numbers."
                      rows={6}
                      className="resize-none"
                      aria-invalid={isInvalid}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {value.length < 200
                          ? `${200 - value.length} characters minimum`
                          : `${2000 - value.length} characters remaining`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {value.length}/2000
                      </p>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="evidenceLinks"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <EvidenceLinkInput
                    value={field.state.value || []}
                    onChange={(links) => field.handleChange(links)}
                    label="Supporting evidence"
                    required
                    error={isInvalid ? field.state.meta.errors?.[0] : undefined}
                  />
                );
              }}
            />

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Important:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>False disputes may result in point penalties</li>
                    <li>Moderators will review your dispute</li>
                    <li>Both parties may be contacted</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox id="confirm_evidence" required />
                <Label htmlFor="confirm_evidence" className="text-sm">
                  I have evidence to support my dispute
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="confirm_genuine" required />
                <Label htmlFor="confirm_genuine" className="text-sm">
                  I'm not submitting this maliciously
                </Label>
              </div>
            </div>
          </FieldGroup>

          <div className="flex items-center justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="destructive">
              {isSubmitting ? "Submitting..." : "Submit Dispute"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
