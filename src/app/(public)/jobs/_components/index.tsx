import { getJobCategories, getJobs } from "@/actions/jobs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CompareJobsButton } from "./compare-jobs-button";
import { JobFilters } from "./job-filters";
import { JobGrid } from "./job-grid";
import { JobHero } from "./job-hero";
import { JobSort } from "./job-sort";

export interface JobsContentProps {
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

export async function JobsContent({ searchParams }: JobsContentProps) {
  const params = await searchParams;

  const filters = {
    industryId: params.industry, // Now using industryId
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

  return (
    <>
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
