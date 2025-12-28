import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { AnalyticsDashboard } from "./_components/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">
          View platform metrics and performance data
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}
