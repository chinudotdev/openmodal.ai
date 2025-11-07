import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";
import { ReportActions } from "./_components/report-actions";
import { ReportActionsFallback } from "./_components/report-actions-fallback";
import { ReportNextSteps } from "./_components/report-next-steps";

export default async function SubmissionSuccessPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardContent className="pt-12 pb-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">
                Report Submitted Successfully!
              </h1>
              <p className="text-muted-foreground">
                Your report is now under review by moderators
              </p>
            </div>

            <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reputation Points</span>
                <span className="text-2xl font-bold text-green-600">+100</span>
              </div>
              <Separator />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Your report is now under review by moderators.</p>
                <p>You'll be notified once it's approved.</p>
                <p className="font-medium">Expected review time: 24-48 hours</p>
              </div>
            </div>

            <ReportNextSteps />
            <Suspense fallback={<ReportActionsFallback />}>
              <ReportActions params={params} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
