
import type { getJobBySlug } from "@/actions/jobs";
import { JobStatusBadge } from "@/components/shared/job-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface GeographicBreakdownProps {
  job: NonNullable<Job>;
}

export function GeographicBreakdown({ job }: GeographicBreakdownProps) {
  const geographicData = job.geographicData || [];

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

  const formatSalary = (salary: number | string | null) => {
    if (!salary) return "N/A";
    const numSalary = typeof salary === "string" ? parseFloat(salary) : salary;
    if (Number.isNaN(numSalary)) return "N/A";
    return `$${(numSalary / 1000).toFixed(0)}k`;
  };

  if (geographicData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Geographic data not available for this job.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">
          Worker distribution and automation risk by region
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Click a region to see:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Local worker statistics</li>
              <li>Salary data</li>
              <li>Deployment reports</li>
              <li>Regional automation differences</li>
            </ul>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Workers</TableHead>
                  <TableHead>Avg Risk</TableHead>
                  <TableHead>Median Salary</TableHead>
                  <TableHead>Deployments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {geographicData.slice(0, 10).map((geo) => (
                  <TableRow key={geo.id}>
                    <TableCell className="font-medium">
                      {geo.country}
                      {geo.stateProvince && `, ${geo.stateProvince}`}
                    </TableCell>
                    <TableCell>{formatWorkers(geo.workersCount)}</TableCell>
                    <TableCell>
                      {geo.automationStatus && (
                        <JobStatusBadge status={geo.automationStatus} />
                      )}
                    </TableCell>
                    <TableCell>{formatSalary(geo.medianSalary)}</TableCell>
                    <TableCell>{geo.deploymentCount || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {geographicData.length > 10 && (
            <p className="text-sm text-muted-foreground text-center">
              Showing top 10 regions. {geographicData.length - 10} more
              available.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
