"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllReports } from "@/actions/admin-reports";
import { ReportCard } from "./report-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportStatus } from "@/db/schema";

export function ReportsList() {
  const [filters, setFilters] = useState<{
    status?: ReportStatus;
    disputed?: boolean;
  }>({});
  const [page, setPage] = useState(0);
  const limit = 50;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", filters, page],
    queryFn: () => getAllReports(filters, limit, page * limit),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value === "all" ? undefined : (value as ReportStatus),
            }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="changes_requested">Changes Requested</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              disputed: value === "disputed" ? true : undefined,
            }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Reports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="disputed">Disputed Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        Total: {data?.total ?? 0} reports
      </div>

      <div className="space-y-4">
        {data?.reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
}
