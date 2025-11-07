import { getReportById } from "@/actions/reports";
import { getReportVerifications } from "@/actions/verifications";
import { notFound } from "next/navigation";
import { ReportDetailContent } from "./report-detail-content";

interface ReportDataLoaderProps {
  reportId: string;
}

export async function ReportDataLoader({ reportId }: ReportDataLoaderProps) {
  const report = await getReportById(reportId);

  if (!report) {
    notFound();
  }

  const verifications = await getReportVerifications(reportId);

  return <ReportDetailContent report={report} verifications={verifications} />;
}
