"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteJob } from "@/actions/admin-content";
import { JobCard } from "./job-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { AutomationStatus } from "@/db/schema/jobs";
import type { JobListResult } from "@/actions/admin-content";

interface JobsListClientProps {
  initialData: JobListResult;
  initialPage: number;
  initialStatusTab: string;
  initialSearch: string;
  allJobs: JobListResult["jobs"];
  publishedJobs: JobListResult["jobs"];
  draftJobs: JobListResult["jobs"];
}

export function JobsListClient({
  initialData,
  initialPage,
  initialStatusTab,
  initialSearch,
  allJobs,
  publishedJobs,
  draftJobs,
}: JobsListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [statusTab, setStatusTab] = useState(initialStatusTab);
  const limit = 20;

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Job deleted successfully");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete job");
    },
  });

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/admin/content/jobs?${params.toString()}`);
  };

  const handleSearch = () => {
    updateSearchParams({ search, page: "0" });
    setPage(0);
  };

  const handleStatusTabChange = (value: string) => {
    setStatusTab(value);
    updateSearchParams({
      status: value === "all" ? undefined : value,
      page: "0",
    });
    setPage(0);
  };

  const handleIndustryFilter = (industryId: string) => {
    updateSearchParams({
      industryId: industryId === "all" ? undefined : industryId,
      page: "0",
    });
    setPage(0);
  };

  const handleDelete = async (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteMutation.mutate(jobId);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateSearchParams({ page: newPage.toString() });
  };

  const displayedJobs =
    statusTab === "published"
      ? publishedJobs
      : statusTab === "draft"
        ? draftJobs
        : allJobs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Manage job listings and automation risk data
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Job
          </Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search jobs by title, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Select onValueChange={handleIndustryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {/* Industries will be loaded separately if needed */}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={statusTab} onValueChange={handleStatusTabChange}>
        <TabsList>
          <TabsTrigger value="all">
            All ({allJobs.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft ({draftJobs.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="text-sm text-muted-foreground">
        Total: {initialData.total ?? 0} jobs | Showing {page * limit + 1}-
        {Math.min((page + 1) * limit, initialData.total ?? 0)}
      </div>

      <div className="space-y-4">
        {displayedJobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No jobs found
          </div>
        ) : (
          displayedJobs.map((job) => (
            <JobCard key={job.id} job={job} onDelete={handleDelete} />
          ))
        )}
      </div>

      {initialData && initialData.total > limit && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page + 1} of {Math.ceil(initialData.total / limit)}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(page + 1)}
            disabled={(page + 1) * limit >= initialData.total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

