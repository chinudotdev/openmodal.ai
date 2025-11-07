import { Suspense } from "react";
import { getJobCategories, getJobs } from "@/actions/jobs";
import { Navbar } from "@/components/navigation/navbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { CompareJobsButton } from "./_components/compare-jobs-button";
import { JobFilters } from "./_components/job-filters";
import { JobGrid } from "./_components/job-grid";
import { JobHero } from "./_components/job-hero";
import { JobSort } from "./_components/job-sort";
import { JobStatsBar } from "./_components/job-stats-bar";

interface PageProps {
  searchParams: Promise<{
    industry?: string;
    status?: string;
    riskMin?: string;
    riskMax?: string;
    salaryMin?: string;
    salaryMax?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}

async function JobsContent({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters = {
    industry: params.industry,
    status: params.status as any,
    riskMin: params.riskMin ? parseInt(params.riskMin, 10) : undefined,
    riskMax: params.riskMax ? parseInt(params.riskMax, 10) : undefined,
    salaryMin: params.salaryMin ? parseInt(params.salaryMin, 10) : undefined,
    salaryMax: params.salaryMax ? parseInt(params.salaryMax, 10) : undefined,
    search: params.search,
  };

  const sort = (params.sort as any) || "risk_desc";
  const page = parseInt(params.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const [jobs, industries] = await Promise.all([
    getJobs(filters, sort, limit, offset),
    getJobCategories(),
  ]);

  // Calculate stats
  const totalJobs = jobs.length;
  const avgRisk =
    jobs.length > 0
      ? jobs.reduce((sum, job) => sum + job.automationPercentage, 0) /
        jobs.length
      : 0;
  const protectedWorkers = jobs.reduce(
    (sum, job) => sum + (job.totalWorkersGlobal || 0),
    0,
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
                <BreadcrumbPage>Jobs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Section */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-12">
          <JobHero initialSearch={params.search} />
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 py-6">
          <JobStatsBar
            totalJobs={totalJobs}
            avgRisk={avgRisk}
            protectedWorkers={protectedWorkers}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[25%_75%] gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <JobFilters industries={industries} currentFilters={filters} />
            <JobSort currentSort={sort} />
            <CompareJobsButton />
          </div>

          {/* Jobs Grid */}
          <div>
            <JobGrid jobs={jobs} currentPage={page} />
          </div>
        </div>
      </div>
    </>
  );
}

export default async function JobsListPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-96" />
              <div className="grid grid-cols-1 lg:grid-cols-[25%_75%] gap-8">
                <div className="space-y-4">
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                </div>
              </div>
            </div>
          </div>
        }
      >
        <JobsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
