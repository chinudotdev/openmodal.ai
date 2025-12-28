"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { verifyReport } from "@/actions/verifications";
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
import { verificationSchema } from "@/lib/validations";

interface VerificationModalProps {
  reportId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerificationModal({
  reportId,
  open,
  onOpenChange,
}: VerificationModalProps) {
  const { user } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      reportId,
      canVerify: true,
      source: undefined as
        | "work_at_company"
        | "direct_knowledge"
        | "additional_evidence"
        | "industry_insider"
        | "other"
        | undefined,
      comment: "",
      evidenceLinks: [] as string[],
    },
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: TanStack Form validator typing mismatch
      onSubmit: verificationSchema as any,
    },
    onSubmit: async ({ value }) => {
      if (!user) {
        toast.error("Please sign in to verify reports");
        return;
      }

      if (!value.source) {
        toast.error("Please select how you know this information");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await verifyReport(user.id, {
          ...value,
          source: value.source,
        });
        if (result.success) {
          toast.success("Report verified successfully! +10 reputation points");
          onOpenChange(false);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to verify report");
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
          <DialogTitle>Verify Report</DialogTitle>
          <DialogDescription>
            Help validate this information by verifying the report
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
              name="canVerify"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel>
                      Can you confirm this information is accurate?
                      <span className="text-destructive ml-1">*</span>
                    </FieldLabel>
                    <RadioGroup
                      value={field.state.value ? "yes" : "no"}
                      onValueChange={(value) =>
                        field.handleChange(value === "yes")
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="verify_yes" />
                        <Label htmlFor="verify_yes">
                          Yes, I can verify this is accurate
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="verify_no" />
                        <Label htmlFor="verify_no">
                          I have concerns about accuracy
                        </Label>
                      </div>
                    </RadioGroup>
                  </Field>
                );
              }}
            />

            <form.Field
              name="source"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      How do you know this information?
                      <span className="text-destructive ml-1">*</span>
                    </FieldLabel>
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as
                            | "work_at_company"
                            | "direct_knowledge"
                            | "additional_evidence"
                            | "industry_insider"
                            | "other",
                        )
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="work_at_company"
                          id="source_work"
                        />
                        <Label htmlFor="source_work">
                          I work/worked at this company
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="direct_knowledge"
                          id="source_direct"
                        />
                        <Label htmlFor="source_direct">
                          I have direct knowledge
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="additional_evidence"
                          id="source_evidence"
                        />
                        <Label htmlFor="source_evidence">
                          I found additional evidence
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="industry_insider"
                          id="source_insider"
                        />
                        <Label htmlFor="source_insider">
                          Industry insider knowledge
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="source_other" />
                        <Label htmlFor="source_other">Other</Label>
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
              name="comment"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Add context or additional evidence (optional)
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="I was part of the team that implemented this system. The numbers are accurate..."
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional, helps build trust
                    </p>
                  </Field>
                );
              }}
            />

            <form.Field
              name="evidenceLinks"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <EvidenceLinkInput
                    value={field.state.value || []}
                    onChange={(links) => field.handleChange(links)}
                    label="Supporting evidence links (optional)"
                    required={false}
                  />
                );
              }}
            />

            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">
                    Your verification will:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Help others trust this information</li>
                    <li>Award you +10 reputation points</li>
                    <li>Award the author +20 reputation points</li>
                  </ul>
                </div>
              </div>
            </div>

            <form.Field
              name="canVerify"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="confirm_verification"
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked === true)
                      }
                      required
                    />
                    <Label htmlFor="confirm_verification" className="text-sm">
                      I confirm this verification is genuine
                    </Label>
                  </div>
                );
              }}
            />
          </FieldGroup>

          <div className="flex items-center justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Verification"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
