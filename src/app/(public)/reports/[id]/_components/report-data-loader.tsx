import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getReportById } from "@/actions/reports";
import { getReportVerifications } from "@/actions/verifications";
import { getUserVote } from "@/actions/votes";
import { auth } from "@/lib/auth";
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

  // Get user session and vote
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userVote = session?.user?.id
    ? await getUserVote(reportId, session.user.id)
    : null;

  return (
    <ReportDetailContent
      report={report}
      verifications={verifications}
      userVote={userVote}
      userId={session?.user?.id ?? null}
    />
  );
}
