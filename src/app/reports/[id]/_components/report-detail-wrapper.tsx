"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ReportDetailContent } from "./report-detail-content";
import type {
  ReportDetail,
  ReportVerificationList,
} from "./report-detail-content";

interface ReportDetailWrapperProps {
  report: ReportDetail;
  verifications: ReportVerificationList;
}

export function ReportDetailWrapper({
  report,
  verifications,
}: ReportDetailWrapperProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client after mount
  // This prevents SSR issues with SessionProvider
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state while mounting
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <ReportDetailContent report={report} verifications={verifications} />;
}

