import { Suspense } from "react";
import { ResearchReportForm } from "./_components/research-report-form";
import { Spinner } from "@/components/ui/spinner";

export default function ResearchReportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Research Update</h1>
        <p className="text-muted-foreground">
          Share new research or development that could impact job automation
        </p>
      </div>

      <Suspense fallback={<Spinner className="h-8 w-8" />}>
        <ResearchReportForm />
      </Suspense>
    </div>
  );
}
