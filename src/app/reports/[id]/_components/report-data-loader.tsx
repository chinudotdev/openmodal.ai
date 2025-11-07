import { notFound } from "next/navigation";
import { getReportById } from "@/actions/reports";
import { getReportVerifications } from "@/actions/verifications";
import { ReportDetailWrapper } from "./report-detail-wrapper";

interface ReportDataLoaderProps {
  reportId: string;
}

export async function ReportDataLoader({ reportId }: ReportDataLoaderProps) {
  const report = await getReportById(reportId);
  if (!report) {
    notFound();
  }

  const verifications = await getReportVerifications(reportId);

  return <ReportDetailWrapper report={report} verifications={verifications} />;
}
