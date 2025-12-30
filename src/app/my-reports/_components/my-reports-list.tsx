"use client";

import { Edit, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { report } from "@/db/schema";

type Report = typeof report.$inferSelect;

interface MyReportsListProps {
  reports: Report[];
}

export function MyReportsList({ reports }: MyReportsListProps) {
  const [filter, setFilter] = useState<"all" | "drafts" | "published">("all");

  const getStatusBadge = (status: string, isDraft: boolean) => {
    if (isDraft) {
      return <Badge variant="outline">Draft</Badge>;
    }
    switch (status) {
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "deployment":
        return "Deployment";
      case "barrier":
        return "Barrier";
      case "research":
        return "Research";
      default:
        return type;
    }
  };

  const getEditUrl = (report: Report) => {
    return `/reports/submit/${report.type}?draftId=${report.id}`;
  };

  const filteredReports =
    filter === "all"
      ? reports
      : filter === "drafts"
        ? reports.filter((r) => r.isDraft)
        : reports.filter((r) => !r.isDraft);

  const draftCount = reports.filter((r) => r.isDraft).length;
  const publishedCount = reports.filter((r) => !r.isDraft).length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as typeof filter)}
          >
            <TabsList>
              <TabsTrigger value="all">All ({reports.length})</TabsTrigger>
              <TabsTrigger value="drafts">Drafts ({draftCount})</TabsTrigger>
              <TabsTrigger value="published">
                Published ({publishedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {filter === "drafts"
                ? "No draft reports"
                : filter === "published"
                  ? "No published reports"
                  : "No reports"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.jobTitle || report.type || "Untitled Report"}
                    </TableCell>
                    <TableCell>{getReportTypeLabel(report.type)}</TableCell>
                    <TableCell>
                      {getStatusBadge(report.status, report.isDraft)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(report.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {report.isDraft ? (
                          <Button asChild variant="default" size="sm">
                            <Link href={getEditUrl(report)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Continue Editing
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/reports/${report.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
