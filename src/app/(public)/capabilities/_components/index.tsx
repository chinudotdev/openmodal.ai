import {
  getCapabilities,
  getCapabilityCategories,
} from "@/actions/capabilities";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CapabilityFilters } from "./capability-filters";
import { CapabilityGrid } from "./capability-grid";
import { CapabilitySort } from "./capability-sort";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    timeline?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}

export async function CapabilitiesContent({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters = {
    categoryId: params.category,
    status: params.status as any,
    timeline: params.timeline as any,
    search: params.search,
  };

  const sort = (params.sort as any) || "progress_desc";
  const page = parseInt(params.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const [capabilities, categories] = await Promise.all([
    getCapabilities(filters, sort, limit, offset),
    getCapabilityCategories(),
  ]);

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
                <BreadcrumbPage>Capabilities</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              AI Capabilities Tracker
            </h1>
            <p className="text-muted-foreground">
              Track the progress toward Artificial General Intelligence
            </p>
            <p className="text-sm text-muted-foreground">
              Community-verified data • 1,234 contributors
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[25%_75%] gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <CapabilityFilters
              categories={categories}
              currentFilters={filters}
            />
            <CapabilitySort currentSort={sort} />
          </div>

          {/* Capabilities Grid */}
          <div>
            <CapabilityGrid capabilities={capabilities} currentPage={page} />
          </div>
        </div>
      </div>
    </>
  );
}
