"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getAllIndustries,
  getAllJobsForDropdown,
  saveOnboardingStep,
  searchJobsByTitle,
} from "@/actions/onboarding";
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
import {
  type ProfessionalBackgroundInput,
  professionalBackgroundSchema,
} from "@/lib/validations";

interface StepProfessionalBackgroundProps {
  onNext: (data: ProfessionalBackgroundInput) => void;
  onBack: () => void;
  isLoading: boolean;
  savedData?: Record<string, unknown> | null;
}

interface JobOption {
  id: string;
  title: string;
  industry: string;
}

export function StepProfessionalBackground({
  onNext,
  onBack,
  isLoading: parentLoading,
  savedData,
}: StepProfessionalBackgroundProps) {
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [jobSearchResults, setJobSearchResults] = useState<JobOption[]>([]);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [industrySearchQuery, setIndustrySearchQuery] = useState("");
  const jobSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const industryContainerRef = useRef<HTMLDivElement>(null);

  // Load jobs and industries on mount
  useEffect(() => {
    const loadData = async () => {
      const [jobsResult, industriesResult] = await Promise.all([
        getAllJobsForDropdown(),
        getAllIndustries(),
      ]);

      if (jobsResult.success) {
        setJobs(jobsResult.jobs);
      }
      if (industriesResult.success) {
        setIndustries(industriesResult.industries);
      }
    };
    loadData();
  }, []);

  // Debounced job search
  const searchJobs = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setJobSearchResults([]);
      return;
    }

    setIsSearchingJobs(true);
    try {
      const result = await searchJobsByTitle(query, 10);
      if (result.success) {
        setJobSearchResults(result.jobs);
      }
    } catch (error) {
      console.error("Error searching jobs:", error);
      setJobSearchResults([]);
    } finally {
      setIsSearchingJobs(false);
    }
  }, []);

  // Handle job search input
  useEffect(() => {
    if (jobSearchTimeoutRef.current) {
      clearTimeout(jobSearchTimeoutRef.current);
    }

    if (jobSearchQuery.length >= 2) {
      jobSearchTimeoutRef.current = setTimeout(() => {
        searchJobs(jobSearchQuery);
      }, 300);
    } else {
      setJobSearchResults([]);
    }

    return () => {
      if (jobSearchTimeoutRef.current) {
        clearTimeout(jobSearchTimeoutRef.current);
      }
    };
  }, [jobSearchQuery, searchJobs]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowJobDropdown(false);
      }
      if (
        industryContainerRef.current &&
        !industryContainerRef.current.contains(event.target as Node)
      ) {
        setShowIndustryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find industry from existing jobs when typing job title
  const findIndustryForJobTitle = useCallback(
    (jobTitle: string) => {
      if (!jobTitle) return null;

      // First check exact match
      const exactMatch = jobs.find(
        (job) => job.title.toLowerCase() === jobTitle.toLowerCase(),
      );
      if (exactMatch) return exactMatch.industry;

      // Then check partial match
      const partialMatch = jobs.find((job) =>
        job.title.toLowerCase().includes(jobTitle.toLowerCase()),
      );
      if (partialMatch) return partialMatch.industry;

      // Check search results
      const searchMatch = jobSearchResults.find(
        (job) => job.title.toLowerCase() === jobTitle.toLowerCase(),
      );
      if (searchMatch) return searchMatch.industry;

      return null;
    },
    [jobs, jobSearchResults],
  );

  const form = useForm({
    defaultValues: {
      currentJobTitle: (savedData?.currentJobTitle as string) || "",
      industry: (savedData?.industry as string) || "",
      yearsOfExperience:
        (savedData?.yearsOfExperience as
          | "0-1"
          | "2-5"
          | "6-10"
          | "11-15"
          | "16-20"
          | "20+") || undefined,
      companySize:
        (savedData?.companySize as
          | "1-10"
          | "11-50"
          | "51-200"
          | "201-1000"
          | "1000+") || undefined,
      educationLevel:
        (savedData?.educationLevel as
          | "high_school"
          | "associates"
          | "bachelors"
          | "masters"
          | "phd"
          | "other") || undefined,
    },
    validators: {
      onSubmit: professionalBackgroundSchema as any,
    },
    onSubmit: async ({ value }) => {
      if (!user) {
        toast.error("Please sign in to continue");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await saveOnboardingStep(user.id, 2, value);
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
        <CardTitle>Your professional background</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-4">
            {/* Job Title with Autocomplete */}
            <form.Field
              name="currentJobTitle"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Current/Recent Job Title
                    </FieldLabel>
                    <div ref={containerRef} className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.handleChange(value);
                            setJobSearchQuery(value);
                            setShowJobDropdown(value.length > 0);
                            setSelectedJobId(null);

                            // Auto-fill industry if found
                            const matchedIndustry =
                              findIndustryForJobTitle(value);
                            if (matchedIndustry) {
                              form.setFieldValue("industry", matchedIndustry);
                            }
                          }}
                          onFocus={() => {
                            if (field.state.value.length > 0) {
                              setShowJobDropdown(true);
                            }
                          }}
                          aria-invalid={isInvalid}
                          placeholder="Software Engineer"
                          className="pl-9"
                        />
                        {isSearchingJobs && (
                          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                      </div>

                      {/* Job Dropdown */}
                      {showJobDropdown && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                          {jobSearchQuery.length >= 2 &&
                          jobSearchResults.length > 0 ? (
                            <div className="divide-y">
                              {jobSearchResults.map((job) => (
                                <button
                                  key={job.id}
                                  type="button"
                                  onClick={() => {
                                    field.handleChange(job.title);
                                    form.setFieldValue(
                                      "industry",
                                      job.industry,
                                    );
                                    setSelectedJobId(job.id);
                                    setShowJobDropdown(false);
                                    setJobSearchQuery("");
                                  }}
                                  className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="font-medium">{job.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {job.industry}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : jobSearchQuery.length >= 2 && isSearchingJobs ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              Searching...
                            </div>
                          ) : jobSearchQuery.length >= 2 &&
                            jobSearchResults.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No jobs found. You can type your job title.
                            </div>
                          ) : jobs.length > 0 ? (
                            <div className="divide-y max-h-60 overflow-y-auto">
                              {jobs.slice(0, 20).map((job) => (
                                <button
                                  key={job.id}
                                  type="button"
                                  onClick={() => {
                                    field.handleChange(job.title);
                                    form.setFieldValue(
                                      "industry",
                                      job.industry,
                                    );
                                    setSelectedJobId(job.id);
                                    setShowJobDropdown(false);
                                    setJobSearchQuery("");
                                  }}
                                  className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="font-medium">{job.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {job.industry}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            {/* Industry with Autocomplete */}
            <form.Field
              name="industry"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                const filteredIndustries = industries.filter((industry) =>
                  industry
                    .toLowerCase()
                    .includes(
                      (
                        industrySearchQuery ||
                        field.state.value ||
                        ""
                      ).toLowerCase(),
                    ),
                );

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Industry Sector
                    </FieldLabel>
                    <div ref={industryContainerRef} className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.handleChange(value);
                          setIndustrySearchQuery(value);
                          setShowIndustryDropdown(
                            value.length > 0 && industries.length > 0,
                          );
                        }}
                        onFocus={() => {
                          if (industries.length > 0) {
                            setShowIndustryDropdown(true);
                          }
                        }}
                        aria-invalid={isInvalid}
                        placeholder="Type industry (e.g., Technology, Healthcare)"
                      />
                      {showIndustryDropdown &&
                        filteredIndustries.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                            <div className="divide-y">
                              {filteredIndustries.map((industry) => (
                                <button
                                  key={industry}
                                  type="button"
                                  onClick={() => {
                                    field.handleChange(industry);
                                    setShowIndustryDropdown(false);
                                    setIndustrySearchQuery("");
                                  }}
                                  className="w-full text-left p-2 hover:bg-muted/50 transition-colors text-sm"
                                >
                                  {industry}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="yearsOfExperience"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Years of Experience
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as
                            | "0-1"
                            | "2-5"
                            | "6-10"
                            | "11-15"
                            | "16-20"
                            | "20+",
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select years of experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="2-5">2-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="11-15">11-15 years</SelectItem>
                        <SelectItem value="16-20">16-20 years</SelectItem>
                        <SelectItem value="20+">20+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            />

            <form.Field
              name="companySize"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Company Size</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as
                            | "1-10"
                            | "11-50"
                            | "51-200"
                            | "201-1000"
                            | "1000+",
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-1000">201-1000</SelectItem>
                        <SelectItem value="1000+">1000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            />

            <form.Field
              name="educationLevel"
              // biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Education Level
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as
                            | "high_school"
                            | "associates"
                            | "bachelors"
                            | "masters"
                            | "phd"
                            | "other",
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high_school">High School</SelectItem>
                        <SelectItem value="associates">
                          Associate's Degree
                        </SelectItem>
                        <SelectItem value="bachelors">
                          Bachelor's Degree
                        </SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
