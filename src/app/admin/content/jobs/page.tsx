import { Suspense } from "react";
import { JobsList } from "./_components/jobs-list";
import { Spinner } from "@/components/ui/spinner";

export default function JobsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    industryId?: string;
    page?: string;
  }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <JobsList searchParams={searchParams} />
    </Suspense>
  );
}
