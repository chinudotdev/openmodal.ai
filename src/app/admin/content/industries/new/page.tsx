import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { IndustryForm } from "../_components/industry-form";

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
