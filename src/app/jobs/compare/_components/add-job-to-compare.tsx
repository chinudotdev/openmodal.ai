"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { JobAutocomplete } from "@/app/jobs/_components/job-autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface JobInfo {
  slug: string;
  title: string;
}

interface AddJobToCompareProps {
  currentJobs?: JobInfo[];
}

export function AddJobToCompare({ currentJobs = [] }: AddJobToCompareProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Get current job slugs from URL
  const currentJobSlugs =
    searchParams.get("jobs")?.split(",").filter(Boolean) || [];

  const handleJobSelect = (slug: string) => {
    // Don't add if already in the list
    if (currentJobSlugs.includes(slug)) {
      setSearch("");
      setShowAutocomplete(false);
      return;
    }

    // Add the new job to the list
    const newJobs = [...currentJobSlugs, slug];
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("jobs", newJobs.join(","));

    router.push(`/jobs/compare?${newParams.toString()}`);
    setSearch("");
    setShowAutocomplete(false);
  };

  const handleRemoveJob = (slug: string) => {
    const newJobs = currentJobSlugs.filter((job) => job !== slug);
    const newParams = new URLSearchParams(searchParams.toString());

    if (newJobs.length > 0) {
      newParams.set("jobs", newJobs.join(","));
    } else {
      newParams.delete("jobs");
    }

    router.push(`/jobs/compare?${newParams.toString()}`);
  };

  // Create a map of slug to title for quick lookup
  const jobTitleMap = new Map(currentJobs.map((job) => [job.slug, job.title]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Jobs to Compare</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowAutocomplete(e.target.value.length > 0);
            }}
            onFocus={() => setShowAutocomplete(search.length > 0)}
            placeholder="Search for a job..."
            className="pl-9"
          />
          {showAutocomplete && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1">
              <JobAutocomplete
                query={search}
                onSelect={handleJobSelect}
                onClose={() => setShowAutocomplete(false)}
              />
            </div>
          )}
        </div>

        {/* Current Jobs List */}
        {currentJobSlugs.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Comparing {currentJobSlugs.length} job
              {currentJobSlugs.length !== 1 ? "s" : ""}:
            </p>
            <div className="flex flex-wrap gap-2">
              {currentJobSlugs.map((slug) => {
                const title = jobTitleMap.get(slug) || slug.replace(/-/g, " ");
                return (
                  <div
                    key={slug}
                    className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5 text-sm"
                  >
                    <span>{title}</span>
                    <button
                      onClick={() => handleRemoveJob(slug)}
                      className="hover:text-destructive transition-colors"
                      aria-label={`Remove ${title}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
