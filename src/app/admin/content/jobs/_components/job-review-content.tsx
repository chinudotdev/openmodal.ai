import { getAdminJobById } from "@/actions/admin-content";
import { JobReview } from "./job-review";
import { notFound } from "next/navigation";

export async function JobReviewContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobData = await getAdminJobById(id);

  if (!jobData) {
    notFound();
  }

  return <JobReview initialJobData={jobData} />;
}
