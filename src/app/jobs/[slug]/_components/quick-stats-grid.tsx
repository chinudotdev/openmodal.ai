"use client";

import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import type { getJobBySlug } from "@/actions/jobs";
import { Card, CardContent } from "@/components/ui/card";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface QuickStatsGridProps {
  job: NonNullable<Job>;
}

export function QuickStatsGrid({ job }: QuickStatsGridProps) {
  const formatWorkers = (count: number | null) => {
    if (!count) return "N/A";
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toLocaleString();
  };

  const formatSalary = (salary: number | string | null) => {
    if (!salary) return "N/A";
    const numSalary = typeof salary === "string" ? parseFloat(salary) : salary;
    if (Number.isNaN(numSalary)) return "N/A";
    return `$${(numSalary / 1000).toFixed(0)}k`;
  };

  const formatGrowth = (rate: number | string | null) => {
    if (!rate) return "N/A";
    const numRate = typeof rate === "string" ? parseFloat(rate) : rate;
    if (Number.isNaN(numRate)) return "N/A";
    const sign = numRate >= 0 ? "+" : "";
    return `${sign}${numRate.toFixed(1)}%`;
  };

  const formatYear = (year: number | null) => {
    if (!year) return "2050+";
    return year.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Workers (Global)</p>
              <p className="text-lg font-semibold text-foreground">
                {formatWorkers(job.totalWorkersGlobal)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Median Salary (US)
              </p>
              <p className="text-lg font-semibold text-foreground">
                {formatSalary(job.medianSalaryUsa)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Growth</p>
              <p className="text-lg font-semibold text-foreground">
                {formatGrowth(job.growthRate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Timeline</p>
              <p className="text-lg font-semibold text-foreground">
                {formatYear(job.estimatedAutomationYear)} Safe
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
