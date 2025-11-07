import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ReportDataLoader } from "./_components/report-data-loader";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <ReportDataLoader reportId={id} />
      </Suspense>
    </div>
  );
}
