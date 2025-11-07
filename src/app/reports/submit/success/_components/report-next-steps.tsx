"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ReportNextSteps() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">What's next?</h2>
      <div className="grid gap-3">
        {reportId && (
          <Button asChild variant="outline" className="w-full">
            <Link href={`/reports/${reportId}`}>
              View Your Pending Report
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href="/reports">Verify Other Reports (+10 points each)</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/reports/submit">Submit Another Report</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

