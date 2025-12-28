"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import {
  createIndustry,
  updateIndustry,
  getAdminIndustryById,
  getAllIndustriesForSelect,
} from "@/actions/admin-content";
import { FormField } from "../../_components/form-field";
import { EmojiPicker } from "../../_components/emoji-picker";
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
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function IndustryForm({ industryId }: { industryId?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slug, setSlug] = useState("");
  const isEditing = !!industryId;

  const { data: existingIndustry, isLoading: isLoadingExisting } = useQuery({
    queryKey: ["admin-industry", industryId],
    queryFn: () => {
      if (!industryId) {
        throw new Error("Industry ID is required");
      }
      return getAdminIndustryById(industryId);
    },
    enabled: isEditing && !!industryId,
  });

  const { data: industries } = useQuery({
    queryKey: ["admin-industries-select"],
    queryFn: () => getAllIndustriesForSelect(),
  });

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      icon: "",
      shortDescription: "",
      longDescription: "",
      parentIndustryId: "",
      displayOrder: 0,
      status: "active" as "active" | "hidden",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const input = {
          name: value.name,
          slug: value.slug || undefined,
          icon: value.icon || undefined,
          shortDescription: value.shortDescription || undefined,
          longDescription: value.longDescription || undefined,
          parentIndustryId: value.parentIndustryId || undefined,
          displayOrder: value.displayOrder,
          status: value.status,
        };

        if (isEditing && industryId) {
          const result = await updateIndustry(industryId, input);
          if (result.success) {
            toast.success("Industry updated successfully");
            router.push("/admin/content/industries");
          } else {
            toast.error("Failed to update industry");
          }
        } else {
          const result = await createIndustry(input);
          if (result.success) {
            toast.success("Industry created successfully");
            router.push("/admin/content/industries");
          } else {
            toast.error("Failed to create industry");
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save industry",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (existingIndustry) {
      form.setFieldValue("name", existingIndustry.name);
      form.setFieldValue("slug", existingIndustry.slug);
      form.setFieldValue("icon", existingIndustry.icon || "");
      form.setFieldValue(
        "shortDescription",
        existingIndustry.shortDescription || "",
      );
      form.setFieldValue(
        "longDescription",
        existingIndustry.longDescription || "",
      );
      form.setFieldValue(
        "parentIndustryId",
        existingIndustry.parentIndustryId || "",
      );
      form.setFieldValue("displayOrder", existingIndustry.displayOrder);
      form.setFieldValue("status", existingIndustry.status);
      setSlug(existingIndustry.slug);
    }
  }, [existingIndustry, form.setFieldValue]);

  // Watch for name changes to auto-generate slug
  useEffect(() => {
    const nameValue = form.state.values.name;
    if (nameValue && !isEditing) {
      const autoSlug = generateSlug(nameValue);
      setSlug(autoSlug);
      form.setFieldValue("slug", autoSlug);
    }
  }, [form.state.values.name, isEditing, form.setFieldValue]);

  if (isLoadingExisting) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/content/industries">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Industries
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Industry" : "Add New Industry"}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Industry Information</CardTitle>
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
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.length < 2) {
                    return "Name must be at least 2 characters";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <FormField
                  label="Industry Name"
                  required
                  error={field.state.meta.errors[0]}
                >
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g., Healthcare"
                  />
                </FormField>
              )}
            </form.Field>

            <FormField
              label="Industry ID (Slug)"
              hint="Auto-generated from name. Can be customized."
            >
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  form.setFieldValue("slug", e.target.value);
                }}
                placeholder="healthcare"
              />
            </FormField>

            <FormField label="Icon (Emoji)">
              <EmojiPicker
                value={form.state.values.icon}
                onChange={(emoji) => form.setFieldValue("icon", emoji)}
              />
            </FormField>

            <FormField label="Short Description" hint="1-2 sentences">
              <Textarea
                value={form.state.values.shortDescription}
                onChange={(e) =>
                  form.setFieldValue("shortDescription", e.target.value)
                }
                placeholder="Brief description of the industry..."
                rows={2}
              />
            </FormField>

            <FormField label="Long Description" hint="3-5 paragraphs">
              <Textarea
                value={form.state.values.longDescription}
                onChange={(e) =>
                  form.setFieldValue("longDescription", e.target.value)
                }
                placeholder="Detailed description of the industry..."
                rows={6}
              />
            </FormField>

            <FormField label="Parent Industry">
              <Select
                value={form.state.values.parentIndustryId || "__none__"}
                onValueChange={(value) =>
                  form.setFieldValue(
                    "parentIndustryId",
                    value === "__none__" ? "" : value,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (top-level)</SelectItem>
                  {industries
                    ?.filter((ind) => ind.id !== industryId)
                    .map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.icon && <span className="mr-2">{ind.icon}</span>}
                        {ind.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Display Order">
              <Input
                type="number"
                value={form.state.values.displayOrder}
                onChange={(e) =>
                  form.setFieldValue(
                    "displayOrder",
                    parseInt(e.target.value, 10) || 0,
                  )
                }
                placeholder="0"
              />
            </FormField>

            <FormField label="Status">
              <RadioGroup
                value={form.state.values.status}
                onValueChange={(value: "active" | "hidden") =>
                  form.setFieldValue("status", value)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label
                    htmlFor="active"
                    className="font-normal cursor-pointer"
                  >
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hidden" id="hidden" />
                  <Label
                    htmlFor="hidden"
                    className="font-normal cursor-pointer"
                  >
                    Hidden
                  </Label>
                </div>
              </RadioGroup>
            </FormField>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/content/industries">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Industry"
                    : "Create Industry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
