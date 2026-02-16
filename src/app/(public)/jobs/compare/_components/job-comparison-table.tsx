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

// Map riskLevel to old AutomationStatus format for badge component
const mapRiskLevelToStatus = (
  riskLevel: "low" | "medium" | "high" | "critical",
): "safe" | "partial" | "high_risk" | "automated" => {
  switch (riskLevel) {
    case "low":
      return "safe";
    case "medium":
      return "partial";
    case "high":
      return "high_risk";
    case "critical":
      return "automated";
  }
};

interface JobComparisonTableProps {
  jobs: Array<{
    id: string;
    slug: string;
    name: string;
    category: string;
    description: string;
    automationRiskPercentage: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    timelineEstimate: string | null;
    confidence: "low" | "medium" | "high";
  }>;
}

export function JobComparisonTable({ jobs }: JobComparisonTableProps) {

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
                      {job.name}
                    </Link>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Name</TableCell>
                {jobs.map((job) => (
                  <TableCell key={job.id}>{job.name}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Category</TableCell>
                {jobs.map((job) => (
                  <TableCell key={job.id} className="capitalize">
                    {job.category}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Risk</TableCell>
                {jobs.map((job) => (
                  <TableCell key={job.id}>
                    <div className="flex items-center gap-2">
                      <JobStatusBadge status={mapRiskLevelToStatus(job.riskLevel)} />
                      <span>{job.automationRiskPercentage}%</span>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Risk Level</TableCell>
                {jobs.map((job) => (
                  <TableCell key={job.id} className="capitalize">
                    {job.riskLevel}
                  </TableCell>
                ))}
              </TableRow>
              {jobs.some((job) => job.timelineEstimate) && (
                <TableRow>
                  <TableCell className="font-medium">Timeline</TableCell>
                  {jobs.map((job) => (
                    <TableCell key={job.id}>
                      {job.timelineEstimate || "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-medium">Confidence</TableCell>
                {jobs.map((job) => (
                  <TableCell key={job.id} className="capitalize">
                    {job.confidence}
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
                View {job.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
