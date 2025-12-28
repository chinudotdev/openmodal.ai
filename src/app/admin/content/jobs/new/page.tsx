import { Suspense } from "react";
import { JobFormStep1 } from "../_components/job-form-step1";
import { QueryProvider } from "@/components/query-provider";
import { getAdminIndustries } from "@/actions/admin-content";
import { Spinner } from "@/components/ui/spinner";

async function NewJobContent() {
  const industriesData = await getAdminIndustries({}, 100, 0);
  
  return <JobFormStep1 initialIndustriesData={industriesData} />;
}

export default function NewJobPage() {
  return (
    <QueryProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <NewJobContent />
      </Suspense>
    </QueryProvider>
  );
}
