import { BarChart3 } from "lucide-react";
import type { Stats } from "@/actions/capabilities";
import { StatCard } from "./stats-card";

interface StatsSectionProps {
  stats: Stats;
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="border-y border-border bg-background py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            By The Numbers
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Live statistics from the community
          </p>
        </div>

        {/* Stats Grid */}
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
          <StatCard value={stats.reports} label="Reports" />
          <StatCard value={stats.experts} label="Experts" />
          <StatCard value={stats.papers} label="Papers" />
          <StatCard value={stats.jobsSafe} label="Jobs Safe" suffix="M" />
        </div>
      </div>
    </section>
  );
}
