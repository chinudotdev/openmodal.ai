import {
  getCapabilities,
  getCapabilityCategories,
} from "@/actions/capabilities";
import { CategoryBreakdown } from "./category-breakdown";
import { CriticalGaps } from "./critical-gaps";
import { OverallProgress } from "./overall-progress";

export const DashboardComponent = async () => {
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

  // Group capabilities by category (cap.category is now an enum string matching category.id)
  const capabilitiesByCategory = categories.map((category) => ({
    category,
    capabilities: allCapabilities.filter((cap) => cap.category === category.id),
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

  // Get critical gaps (capabilities with low progress)
  // Note: jobsProtectedCount field was removed from schema, sorting by progressPercentage instead
  const criticalGaps = allCapabilities
    .filter((cap) => cap.status === "unsolved" || cap.status === "partial")
    .sort((a, b) => a.progressPercentage - b.progressPercentage)
    .slice(0, 5);
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <OverallProgress progress={overallProgress} />
      <CategoryBreakdown categories={categoryProgress} />
      <CriticalGaps gaps={criticalGaps} />
    </div>
  );
};
