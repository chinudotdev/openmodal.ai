import type { getJobBySlug } from "@/actions/jobs";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface RelatedJobsProps {
  job: NonNullable<Job>;
}

export function RelatedJobs({ job }: RelatedJobsProps) {
  // Related jobs feature removed - relatedJob table deleted
  return null;
}
