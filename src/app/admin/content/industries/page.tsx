import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { IndustriesList } from "./_components/industries-list";

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
