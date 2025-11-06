import { Skeleton } from "@/components/ui/skeleton";

export function StatsSectionFallback() {
  return (
    <section className="border-y border-border bg-background py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto mb-3 h-10 w-64" />
          <Skeleton className="mx-auto h-4 w-48" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 min-w-[150px]"
            >
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
