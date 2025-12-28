"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { createJob } from "@/actions/admin-content";
import { FormField } from "../../_components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type IndustriesData = Awaited<
  ReturnType<typeof import("@/actions/admin-content").getAdminIndustries>
>;

interface JobFormStep1Props {
  initialIndustriesData: IndustriesData;
}

export function JobFormStep1({ initialIndustriesData }: JobFormStep1Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slug, setSlug] = useState("");

  const industriesData = initialIndustriesData;

  const form = useForm({
    defaultValues: {
      title: "",
      slug: "",
      industryId: "",
      category: "",
      shortDescription: "",
      description: "",
      metaDescription: "",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const result = await createJob({
          title: value.title,
          slug: value.slug || undefined,
          industryId: value.industryId,
          category: value.category,
          description: value.description,
          shortDescription: value.shortDescription,
          metaDescription: value.metaDescription || undefined,
        });

        if (result.success && result.jobId) {
          toast.success("Job created successfully");
          router.push(`/admin/content/jobs/${result.jobId}/tasks`);
        } else {
          toast.error("Failed to create job");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create job",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Watch for title changes to auto-generate slug
  useEffect(() => {
    const titleValue = form.state.values.title;
    if (titleValue) {
      const autoSlug = generateSlug(titleValue);
      setSlug(autoSlug);
      form.setFieldValue("slug", autoSlug);
    }
  }, [form.state.values.title, form.setFieldValue]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/content/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Job</h1>
          <p className="text-muted-foreground mt-1">
            Step 1 of 3: Basic Information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Job Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="title"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.length < 3) {
                    return "Title must be at least 3 characters";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <FormField
                  label="Job Title"
                  required
                  error={field.state.meta.errors[0]}
                >
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., Software Developer"
                  />
                </FormField>
              )}
            </form.Field>

            <FormField
              label="Job ID (Slug)"
              hint="Auto-generated from title. Can be customized."
            >
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  form.setFieldValue("slug", e.target.value);
                }}
                placeholder="job-software-developer"
              />
            </FormField>

            <form.Field
              name="industryId"
              validators={{
                onChange: ({ value }) => {
                  if (!value) {
                    return "Industry is required";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <FormField
                  label="Industry"
                  required
                  error={field.state.meta.errors[0]}
                >
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industriesData.industries.map((industry) => (
                        <SelectItem key={industry.id} value={industry.id}>
                          {industry.icon && (
                            <span className="mr-2">{industry.icon}</span>
                          )}
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            </form.Field>

            <FormField
              label="Category"
              required
              hint="e.g., Medical & Health, Technology, etc."
            >
              <Input
                value={form.state.values.category}
                onChange={(e) => form.setFieldValue("category", e.target.value)}
                placeholder="Medical & Health"
              />
            </FormField>

            <FormField
              label="Short Description"
              required
              hint="1-2 sentences, ~150 characters"
            >
              <Textarea
                value={form.state.values.shortDescription}
                onChange={(e) =>
                  form.setFieldValue("shortDescription", e.target.value)
                }
                placeholder="Designs, develops, and maintains software applications and systems."
                maxLength={150}
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.state.values.shortDescription.length}/150 characters
              </p>
            </FormField>

            <FormField
              label="Full Description"
              required
              hint="3-5 paragraphs, ~800 characters"
            >
              <Textarea
                value={form.state.values.description}
                onChange={(e) =>
                  form.setFieldValue("description", e.target.value)
                }
                placeholder="Software developers create the applications and systems that run on computers and devices..."
                maxLength={800}
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.state.values.description.length}/800 characters
              </p>
            </FormField>

            <FormField
              label="Meta Description (SEO)"
              hint="Optional: For search engine optimization"
            >
              <Textarea
                value={form.state.values.metaDescription || ""}
                onChange={(e) =>
                  form.setFieldValue("metaDescription", e.target.value)
                }
                placeholder="Brief description for search engines..."
                rows={2}
              />
            </FormField>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/content/jobs">Cancel</Link>
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Save as draft - for now just create with verified=false
                    form.handleSubmit();
                  }}
                  disabled={isSubmitting}
                >
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Next: Tasks →"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
