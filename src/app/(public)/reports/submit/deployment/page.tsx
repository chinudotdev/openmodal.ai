import { Suspense } from "react";
import { DeploymentReportForm } from "./_components/deployment-report-form";
import { Spinner } from "@/components/ui/spinner";

export default function DeploymentReportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Deployment Report</h1>
        <p className="text-muted-foreground">
          Report AI/automation actually being used in real work environments
        </p>
      </div>
      <Suspense fallback={<Spinner className="h-8 w-8" />}>
        <DeploymentReportForm />
      </Suspense>
    </div>
  );
}
