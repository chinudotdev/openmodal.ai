import { Skeleton } from "@/components/ui/skeleton";

export function HeroSectionFallback() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted to-background py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-[800px] text-center">
          <div className="mb-6 flex justify-center">
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
          <Skeleton className="mx-auto mb-4 h-12 w-96" />
          <Skeleton className="mx-auto mb-6 h-6 w-64" />
          <Skeleton className="mx-auto mb-6 h-32 w-full max-w-md" />
          <div className="space-y-2">
            <Skeleton className="mx-auto h-4 w-48" />
            <Skeleton className="mx-auto h-4 w-64" />
          </div>
        </div>
      </div>
    </section>
  );
}
