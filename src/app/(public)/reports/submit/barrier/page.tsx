import { Suspense } from "react";
import { BarrierReportForm } from "./_components/barrier-report-form";
import { Spinner } from "@/components/ui/spinner";

export default function BarrierReportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Barrier Report</h1>
        <p className="text-muted-foreground">
          Report obstacles preventing AI/automation from replacing human work
        </p>
      </div>

      <Suspense fallback={<Spinner className="h-8 w-8" />}>
        <BarrierReportForm />
      </Suspense>
    </div>
  );
}
