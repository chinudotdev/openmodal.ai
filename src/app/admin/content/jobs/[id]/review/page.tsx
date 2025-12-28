import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { JobReviewContent } from "../../_components/job-review-content";

export default async function JobReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <JobReviewContent params={params} />
    </Suspense>
  );
}
