import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { IndustriesPage } from "../../_components/industries-page";

export default async function EditIndustryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <IndustriesPage params={params} />
    </Suspense>
  );
}
