import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { JobTasksContent } from "../../_components/job-tasks-content";

export default async function JobTasksPage({
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
      <JobTasksContent params={params} />
    </Suspense>
  );
}
