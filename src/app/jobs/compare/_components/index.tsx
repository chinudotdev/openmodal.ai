import { getJobBySlug } from "@/actions/jobs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AddJobToCompare } from "./add-job-to-compare";
import { JobComparisonTable } from "./job-comparison-table";

interface PageProps {
  searchParams: Promise<{
    jobs?: string;
  }>;
}

export async function CompareContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const jobSlugs = params.jobs?.split(",").filter(Boolean) || [];

  // Fetch jobs by slugs
  const jobs = await Promise.all(
    jobSlugs.map(async (slug) => {
      const job = await getJobBySlug(slug.trim());
      return job;
    }),
  );

  // Filter out null jobs (jobs that don't exist)
  const validJobs = jobs.filter(
    (job): job is NonNullable<typeof job> => job !== null,
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/40">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/jobs">Jobs</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Compare</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Compare Jobs</h1>
            <p className="text-muted-foreground">
              Compare automation risk, salary, and other metrics across multiple
              jobs
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Add Job Component */}
          <AddJobToCompare
            currentJobs={validJobs.map((job) => ({
              slug: job.slug,
              title: job.title,
            }))}
          />

          {/* Comparison Table or Empty State */}
          {validJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {jobSlugs.length === 0
                  ? "Search and add jobs above to start comparing."
                  : "No valid jobs found to compare. Please check the job slugs and try again."}
              </p>
            </div>
          ) : (
            <JobComparisonTable
              jobs={validJobs.map((job) => ({
                id: job.id,
                slug: job.slug,
                title: job.title,
                automationPercentage: job.automationPercentage,
                automationStatus: job.automationStatus,
                totalWorkersGlobal: job.totalWorkersGlobal,
                medianSalaryUsa: job.medianSalaryUsa
                  ? Number(job.medianSalaryUsa)
                  : null,
                estimatedAutomationYear: job.estimatedAutomationYear,
                growthRate: job.growthRate ? Number(job.growthRate) : null,
              }))}
            />
          )}
        </div>
      </div>
    </>
  );
}
