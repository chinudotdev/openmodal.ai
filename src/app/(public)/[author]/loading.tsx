import { Skeleton } from "@/components/ui/skeleton";

export default function AuthorLoading() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="px-4 py-2">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            {/* Author Header Skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>

            {/* Author Description Skeleton */}
            <Skeleton className="h-4 w-full max-w-2xl mb-2" />
            <Skeleton className="h-4 w-3/4 max-w-2xl" />
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="max-w-4xl mx-auto">
          <div className="bg-background">
            <div className="flex items-baseline justify-between mb-6">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Model List Skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={`skeleton-model-${index}`}
                  className={`py-4 ${
                    index < 5 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3 w-px" />
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                  </div>

                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
