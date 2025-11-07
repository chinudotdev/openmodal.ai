"use client";

import { useForm } from "@tanstack/react-form";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saveOnboardingStep } from "@/actions/onboarding";
import CountrySelect from "@/components/country-select";
import RegionSelect from "@/components/region-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/contexts/session-context";
import { authClient } from "@/lib/auth-client";
import { type BasicInfoInput, basicInfoSchema } from "@/lib/validations";

interface StepBasicInfoProps {
  onNext: (data: BasicInfoInput) => void;
  onBack: () => void;
  isLoading: boolean;
  savedData?: Record<string, unknown> | null;
}

export function StepBasicInfo({
  onNext,
  onBack,
  isLoading: parentLoading,
  savedData,
}: StepBasicInfoProps) {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
  }>({ checking: false, available: null, error: null });
  const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced username check using Better Auth's username plugin
  const checkUsername = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus({ checking: false, available: null, error: null });
      return;
    }

    setUsernameStatus({ checking: true, available: null, error: null });
    try {
      const result = await authClient.isUsernameAvailable({
        username,
      });
      // Handle result - Better Auth returns { data: { available: boolean } } or { error: ... }
      const available =
        (result as { data?: { available?: boolean } }).data?.available ?? false;
      setUsernameStatus({
        checking: false,
        available,
        error: null,
      });
    } catch (error) {
      setUsernameStatus({
        checking: false,
        available: false,
        error:
          error instanceof Error ? error.message : "Error checking username",
      });
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, []);

  const form = useForm({
    defaultValues: {
      username: (savedData?.username as string) || "",
      displayName: (savedData?.displayName as string) || "",
      location: (savedData?.location as string) || undefined,
      country: (savedData?.country as string) || undefined,
      stateProvince: (savedData?.stateProvince as string) || undefined,
      ageRange:
        (savedData?.ageRange as
          | "18-24"
          | "25-34"
          | "35-44"
          | "45-54"
          | "55-64"
          | "65+") || undefined,
      employmentStatus:
        (savedData?.employmentStatus as
          | "full_time"
          | "part_time"
          | "self_employed"
          | "unemployed"
          | "student"
          | "retired") || undefined,
    },
    validators: {
      onSubmit: basicInfoSchema as any, // TanStack Form type compatibility
    },
    onSubmit: async ({ value }) => {
      if (!user) {
        toast.error("Please sign in to continue");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await saveOnboardingStep(user.id, 1, value);
        if (result.success) {
          onNext(value);
        } else {
          toast.error(result.error || "Failed to save step");
        }
      } catch (error) {
        toast.error("An error occurred");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const isLoading = parentLoading || isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tell us about yourself</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-4">
            <form.Field
              name="username"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Username{" "}
                      <span className="text-muted-foreground">
                        (required, unique)
                      </span>
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const value = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, "");
                          field.handleChange(value);

                          // Clear previous timeout
                          if (usernameCheckTimeoutRef.current) {
                            clearTimeout(usernameCheckTimeoutRef.current);
                          }

                          // Debounce username check
                          if (value.length >= 3) {
                            usernameCheckTimeoutRef.current = setTimeout(() => {
                              checkUsername(value);
                            }, 500);
                          } else {
                            setUsernameStatus({
                              checking: false,
                              available: null,
                              error: null,
                            });
                          }
                        }}
                        aria-invalid={isInvalid}
                        placeholder="johndoe"
                        maxLength={20}
                        className="pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameStatus.checking && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {!usernameStatus.checking &&
                          field.state.value.length >= 3 &&
                          usernameStatus.available === true && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        {!usernameStatus.checking &&
                          field.state.value.length >= 3 &&
                          usernameStatus.available === false && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                      </div>
                    </div>
                    {field.state.value.length > 0 &&
                      field.state.value.length < 3 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Username must be at least 3 characters
                        </p>
                      )}
                    {usernameStatus.available === false && (
                      <p className="text-sm text-red-500 mt-1">
                        {usernameStatus.error || "Username is already taken"}
                      </p>
                    )}
                    {usernameStatus.available === true && (
                      <p className="text-sm text-green-500 mt-1">
                        Username is available
                      </p>
                    )}
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="displayName"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Display Name (can be pseudonym)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="John Doe"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="country"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const countryValue = field.state.value || "";

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                    <CountrySelect
                      value={field.state.value}
                      onChange={(value) => {
                        field.handleChange(value);
                        // Clear region when country changes
                        form.setFieldValue("stateProvince", undefined);
                      }}
                      className={isInvalid ? "border-red-500" : ""}
                      placeholder="Select country"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    {countryValue && (
                      <form.Field
                        name="stateProvince"
                        // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
                        children={(regionField) => {
                          return (
                            <Field className="mt-4">
                              <FieldLabel htmlFor={regionField.name}>
                                Region
                              </FieldLabel>
                              <RegionSelect
                                countryCode={countryValue}
                                value={regionField.state.value}
                                onChange={(value) =>
                                  regionField.handleChange(value)
                                }
                                placeholder="Select region"
                              />
                            </Field>
                          );
                        }}
                      />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="ageRange"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Age Range</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as
                            | "18-24"
                            | "25-34"
                            | "35-44"
                            | "45-54"
                            | "55-64"
                            | "65+",
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18-24">18-24</SelectItem>
                        <SelectItem value="25-34">25-34</SelectItem>
                        <SelectItem value="35-44">35-44</SelectItem>
                        <SelectItem value="45-54">45-54</SelectItem>
                        <SelectItem value="55-64">55-64</SelectItem>
                        <SelectItem value="65+">65+</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            />

            <form.Field
              name="employmentStatus"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Employment Status
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as
                            | "full_time"
                            | "part_time"
                            | "self_employed"
                            | "unemployed"
                            | "student"
                            | "retired",
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">
                          Full-time employed
                        </SelectItem>
                        <SelectItem value="part_time">
                          Part-time employed
                        </SelectItem>
                        <SelectItem value="self_employed">
                          Self-employed
                        </SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
              >
                Back
              </Button>
              <form.Subscribe
                selector={(formState) => [
                  formState.canSubmit,
                  formState.isSubmitting,
                ]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isLoading}
                    className="ml-auto"
                  >
                    {isSubmitting || isLoading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      "Next"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
