import { Suspense } from "react";
import { IndustriesList } from "./_components/industries-list";
import { Spinner } from "@/components/ui/spinner";

export default function IndustriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <IndustriesList />
    </Suspense>
  );
}
