import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ReportDataLoader } from "./_components/report-data-loader";

// With Cache Components, generateStaticParams must return at least one result
// Return a placeholder that will result in 404 - this route is fully dynamic
export async function generateStaticParams() {
  // Return a placeholder to satisfy Cache Components requirement
  // This will result in 404, which is handled by the page component
  return [{ id: "__placeholder__dynamic_route__" }];
}

// Note: This route is dynamic and cannot use generateMetadata
// during build time. Metadata will be generated at runtime.
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
