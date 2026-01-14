"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { searchJobs } from "@/actions/jobs";
import { JobStatusBadge } from "@/components/shared/job-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface JobAutocompleteProps {
  query: string;
  onSelect: (slug: string) => void;
  onClose: () => void;
}

export function JobAutocomplete({ query, onSelect }: JobAutocompleteProps) {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const jobs = await searchJobs(query, 10);
        setResults(jobs);
      } catch (error) {
        console.error("Error searching jobs:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  if (query.length < 2) {
    return null;
  }

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

  return (
    <Card className="max-h-96 overflow-y-auto shadow-none border-0 bg-transparent rounded-none">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No jobs found
          </div>
        ) : (
          <div className="divide-y">
            {results.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(job.slug);
                }}
                className="block p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {job.title}
                      </h3>
                      <JobStatusBadge status={job.automationStatus} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {typeof job.industry === "string"
                        ? job.industry
                        : job.industry.name}{" "}
                      • {formatWorkers(job.totalWorkersGlobal)} workers
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Risk: {job.automationPercentage}%
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
