import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { report } from "@/db/schema";

interface UserReportsListProps {
  reports: (typeof report.$inferSelect)[];
}

export function UserReportsList({ reports }: UserReportsListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Reports</CardTitle>
        <Button asChild size="sm">
          <Link href="/reports/submit">
            <Plus className="h-4 w-4 mr-2" />
            Submit New Report
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reports yet</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/reports/submit">Submit Your First Report</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">
                      {report.jobTitle || report.type}
                    </h3>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {report.description?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{report.verificationCount} verifications</span>
                    <span>{report.upvotes} upvotes</span>
                    <span>{report.commentCount} comments</span>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/reports/${report.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
