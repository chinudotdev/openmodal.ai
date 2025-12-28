"use client";

import { AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ReportCardProps {
  report: {
    id: string;
    type: string;
    status: string;
    description: string;
    technology: string;
    company: string | null;
    upvotes: number;
    downvotes: number;
    verificationCount: number;
    user: {
      name: string;
      email: string;
    };
  };
}

export function ReportCard({ report }: ReportCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50">
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50">
            Pending
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">{report.technology}</h3>
              {getStatusBadge(report.status)}
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {report.description}
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>By: {report.user.name}</span>
              <span>Type: {report.type}</span>
              {report.company && <span>Company: {report.company}</span>}
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground mt-2">
              <span>↑ {report.upvotes}</span>
              <span>↓ {report.downvotes}</span>
              <span>✓ {report.verificationCount} verifications</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/reports/${report.id}`}>View Report</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
