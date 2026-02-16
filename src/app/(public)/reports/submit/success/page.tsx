import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";
import { getReportById } from "@/actions/reports";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReportActions } from "./_components/report-actions";
import { ReportActionsFallback } from "./_components/report-actions-fallback";
import { ReportNextSteps } from "./_components/report-next-steps";

export default async function SubmissionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reportId?: string }>;
}) {
  const { reportId } = await searchParams;
  const report = reportId ? await getReportById(reportId) : null;

  // Calculate points based on report (simplified - no reputation system)
  const pointsToAward = 50; // Default points for any report
  const totalPoints = pointsToAward;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardContent className="pt-12 pb-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="text-6xl">✅</div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">
                Report Submitted Successfully!
              </h1>
            </div>

            <div className="rounded-lg border bg-green-50 border-green-200 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🎁</span>
                  <span className="text-2xl font-bold text-green-600">
                    +{pointsToAward} reputation points earned!
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span className="text-lg font-semibold text-green-800">
                    Total: {totalPoints} points
                  </span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm text-green-800">
                <p>Your report is now under review by moderators.</p>
                <p>You'll be notified once it's approved.</p>
                <p className="font-medium">Expected review time: 24-48 hours</p>
              </div>
            </div>

            <ReportNextSteps />
            <Suspense fallback={<ReportActionsFallback />}>
              <ReportActions
                params={Promise.resolve({ reportId: reportId || "" })}
              />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
