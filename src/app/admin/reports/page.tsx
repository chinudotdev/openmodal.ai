import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ReportsList } from "./_components/reports-list";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Report Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage all reports
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <ReportsList />
      </Suspense>
    </div>
  );
}
