import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
// import { ModerationReportList } from "../../_components/moderation-report-list-content";

export default async function ModerationPendingPage() {
  return (
    <Suspense fallback={<Spinner className="h-8 w-8" />}>
      {/* <ModerationReportList type="pending" /> */}
      pending
    </Suspense>
  );
}
