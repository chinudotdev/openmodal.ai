import { Navbar } from "@/components/navigation/navbar";
import {
  getCapabilities,
  getCapabilityCategories,
} from "@/actions/capabilities";
import { OverallProgress } from "./_components/overall-progress";
import { CategoryBreakdown } from "./_components/category-breakdown";
import { CriticalGaps } from "./_components/critical-gaps";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function CapabilitiesDashboardPage() {
  const [allCapabilities, categories] = await Promise.all([
    getCapabilities({}, "progress_desc", 1000, 0), // Get all capabilities
    getCapabilityCategories(),
  ]);

  // Calculate overall AGI progress (average of all capabilities)
  const overallProgress =
    allCapabilities.length > 0
      ? Math.round(
          allCapabilities.reduce(
            (sum, cap) => sum + cap.progressPercentage,
            0,
          ) / allCapabilities.length,
        )
      : 0;

  // Group capabilities by category
  const capabilitiesByCategory = categories.map((category) => ({
    category,
    capabilities: allCapabilities.filter(
      (cap) => cap.categoryId === category.id,
    ),
  }));

  // Calculate category progress
  const categoryProgress = capabilitiesByCategory.map(
    ({ category, capabilities }) => {
      const categoryProgress =
        capabilities.length > 0
          ? Math.round(
              capabilities.reduce(
                (sum, cap) => sum + cap.progressPercentage,
                0,
              ) / capabilities.length,
            )
          : 0;

      const solved = capabilities.filter(
        (cap) => cap.status === "solved",
      ).length;
      const partial = capabilities.filter(
        (cap) => cap.status === "partial",
      ).length;
      const unsolved = capabilities.filter(
        (cap) => cap.status === "unsolved",
      ).length;

      return {
        category,
        progress: categoryProgress,
        solved,
        partial,
        unsolved,
        capabilities,
      };
    },
  );

  // Get critical gaps (capabilities protecting most jobs)
  const criticalGaps = allCapabilities
    .filter((cap) => cap.status === "unsolved" || cap.status === "partial")
    .sort((a, b) => b.jobsProtectedCount - a.jobsProtectedCount)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
                <BreadcrumbLink href="/capabilities">
                  Capabilities
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground">
            AI Capabilities Dashboard
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        <OverallProgress progress={overallProgress} />
        <CategoryBreakdown categories={categoryProgress} />
        <CriticalGaps gaps={criticalGaps} />
      </div>
    </div>
  );
}
