import { Suspense } from "react";
import {
  getDisputedReports,
  getFlaggedReports,
  getPendingReports,
} from "@/actions/moderation";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ModerationReportListClient } from "./moderation-report-list-client";

interface ModerationReportListContentProps {
  type: "pending" | "flagged" | "disputed";
}

async function getReports(
  type: "pending" | "flagged" | "disputed",
  limit: number,
  offset: number,
) {
  switch (type) {
    case "pending":
      return await getPendingReports(limit, offset);
    case "flagged":
      return await getFlaggedReports(limit, offset);
    case "disputed":
      return await getDisputedReports(limit, offset);
  }
}

async function ModerationReportListContent({
  type,
}: ModerationReportListContentProps) {
  const reports = await getReports(type, 20, 0);

  return <ModerationReportListClient type={type} initialReports={reports} />;
}

export function ModerationReportList({
  type,
}: {
  type: "pending" | "flagged" | "disputed";
}) {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      }
    >
      <ModerationReportListContent type={type} />
    </Suspense>
  );
}
