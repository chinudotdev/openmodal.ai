import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { DashboardContent } from "./_components/dashboard-content";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<Spinner className="h-8 w-8" />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
