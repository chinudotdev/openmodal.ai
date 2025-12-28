import { getAdminJobs, type JobFilters } from "@/actions/admin-content";
import type { AutomationStatus } from "@/db/schema/jobs";
import { JobsListClient } from "./jobs-list-client";

interface JobsListProps {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    industryId?: string;
    page?: string;
  }>;
}

export async function JobsList({ searchParams }: JobsListProps) {
  const params = await searchParams;

  const filters: JobFilters = {};
  if (params?.search) {
    filters.search = params.search;
  }
  if (params?.status && params.status !== "all") {
    filters.status = params.status as AutomationStatus;
  }
  if (params?.industryId && params.industryId !== "all") {
    filters.industryId = params.industryId;
  }

  const page = parseInt(params?.page || "0", 10);
  const limit = 20;
  const offset = page * limit;

  const data = await getAdminJobs(filters, limit, offset);

  const allJobs = data.jobs || [];
  const publishedJobs = allJobs.filter((j) => j.verified);
  const draftJobs = allJobs.filter((j) => !j.verified);

  return (
    <JobsListClient
      initialData={data}
      initialPage={page}
      initialStatusTab={params?.status || "all"}
      initialSearch={params?.search || ""}
      allJobs={allJobs}
      publishedJobs={publishedJobs}
      draftJobs={draftJobs}
    />
  );
}
