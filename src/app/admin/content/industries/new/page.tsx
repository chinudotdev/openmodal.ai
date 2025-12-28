import { Suspense } from "react";
import { IndustryForm } from "../_components/industry-form";
import { Spinner } from "@/components/ui/spinner";

export default function NewIndustryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <IndustryForm />
    </Suspense>
  );
}
