import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { DeploymentReportForm } from "./_components/deployment-report-form";

interface DeploymentReportPageProps {
  searchParams: Promise<{ draftId?: string }>;
}

export default async function DeploymentReportPage({
  searchParams,
}: DeploymentReportPageProps) {
  const { draftId } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {draftId ? "Edit Deployment Report" : "Deployment Report"}
        </h1>
        <p className="text-muted-foreground">
          {draftId
            ? "Continue editing your draft report"
            : "Report AI/automation actually being used in real work environments"}
        </p>
      </div>
      <Suspense fallback={<Spinner className="h-8 w-8" />}>
        <DeploymentReportForm draftId={draftId} />
      </Suspense>
    </div>
  );
}
