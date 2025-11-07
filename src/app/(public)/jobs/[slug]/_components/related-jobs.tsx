
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { getJobBySlug } from "@/actions/jobs";
import { JobStatusBadge } from "@/components/shared/job-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface RelatedJobsProps {
  job: NonNullable<Job>;
}

export function RelatedJobs({ job }: RelatedJobsProps) {
  const relatedJobs = job.relatedJobs || [];

  const formatSalary = (salary: number | string | null) => {
    if (!salary) return "N/A";
    const numSalary = typeof salary === "string" ? parseFloat(salary) : salary;
    if (Number.isNaN(numSalary)) return "N/A";
    return `$${(numSalary / 1000).toFixed(0)}k`;
  };

  if (relatedJobs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Jobs</CardTitle>
        <p className="text-sm text-muted-foreground">
          Similar roles to consider:
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatedJobs.slice(0, 4).map((relatedJob) => (
          <div key={relatedJob.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <JobStatusBadge status={relatedJob.automationStatus} />
                <Link
                  href={`/jobs/${relatedJob.slug}`}
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  {relatedJob.title}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{relatedJob.automationPercentage}% risk</span>
              <span>•</span>
              <span>{formatSalary(relatedJob.medianSalaryUsa)} median</span>
            </div>
          </div>
        ))}
        {relatedJobs.length > 4 && (
          <Button variant="ghost" className="w-full group" asChild>
            <Link href="#related">
              View all {relatedJobs.length} related jobs
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
