import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { JobStatusBadge } from "@/components/shared/job-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JobComparisonTableProps {
  jobs: Array<{
    id: string;
    slug: string;
    title: string;
    automationPercentage: number;
    automationStatus: "safe" | "partial" | "high_risk" | "automated";
    totalWorkersGlobal: number | null;
    medianSalaryUsa: number | null;
    estimatedAutomationYear: number | null;
    growthRate: number | null;
  }>;
}

export function JobComparisonTable({ jobs }: JobComparisonTableProps) {
  const formatWorkers = (count: number | null) => {
    if (!count) return "N/A";
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toLocaleString();
  };

  const formatSalary = (salary: number | null) => {
    if (!salary) return "N/A";
    return `$${(salary / 1000).toFixed(0)}k`;
  };

  const formatYear = (year: number | null) => {
    if (!year) return "2050+";
    return year.toString();
  };

  const formatGrowth = (rate: number | null) => {
    if (!rate) return "N/A";
    const sign = rate >= 0 ? "+" : "";
    return `${sign}${rate.toFixed(1)}%`;
  };

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No jobs selected for comparison.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                {jobs.map((job) => (
                  <TableHead key={job.id}>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {job.title}
                    </Link>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Risk</TableCell>
                {jobs.map((job) => (
                  <TableCell key={job.id}>
                    <div className="flex items-center gap-2">
                      <JobStatusBadge status={job.automationStatus} />
                      <span>{job.automationPercentage}%</span>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Timeline</TableCell>
                {jobs.map((job) => (
                  <TableCell key={job.id}>
                    {formatYear(job.estimatedAutomationYear)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Workers</TableCell>
                {jobs.map((job) => (
                  <TableCell key={job.id}>
                    {formatWorkers(job.totalWorkersGlobal)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Salary</TableCell>
                {jobs.map((job) => (
                  <TableCell key={job.id}>
                    {formatSalary(job.medianSalaryUsa)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Growth</TableCell>
                {jobs.map((job) => (
                  <TableCell key={job.id}>
                    {formatGrowth(
                      job.growthRate ? Number(job.growthRate) : null,
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 flex justify-center gap-4">
          {jobs.map((job) => (
            <Button key={job.id} variant="outline" asChild>
              <Link href={`/jobs/${job.slug}`}>
                View {job.title}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
