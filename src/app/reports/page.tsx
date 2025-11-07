import { Suspense } from "react";
import { ReportsFeed } from "./_components/reports-feed";
import { Spinner } from "@/components/ui/spinner";

export default async function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Automation Reports</h1>
          <p className="text-muted-foreground">
            Real-world reports of AI and automation impacting jobs
          </p>
        </div>
      </div>
      <Suspense fallback={<Spinner className="h-8 w-8" />}>
        <ReportsFeed />
      </Suspense>
    </div>
  );
}
