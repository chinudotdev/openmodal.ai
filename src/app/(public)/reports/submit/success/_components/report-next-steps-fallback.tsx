import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ReportNextStepsFallback() {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">What's next?</h2>
      <div className="grid gap-3">
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

