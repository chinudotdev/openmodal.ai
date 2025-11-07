"use client";

import { AlertCircle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryBreakdownProps {
  categories: Array<{
    category: any;
    progress: number;
    solved: number;
    partial: number;
    unsolved: number;
    capabilities: any[];
  }>;
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Category Breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(
          ({ category, progress, solved, partial, unsolved, capabilities }) => {
            // Get top capabilities
            const topCapabilities = capabilities
              .sort((a, b) => b.progressPercentage - a.progressPercentage)
              .slice(0, 3);

            const gaps = capabilities.filter(
              (cap) => cap.status === "unsolved" || cap.status === "partial",
            );

            return (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <span className="text-2xl font-bold text-primary">
                      {progress}%
                    </span>
                  </div>
                  <ProgressBar progress={progress} size="md" animated />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{solved} solved</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>{partial} partial</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span>{unsolved} unsolved</span>
                    </div>
                  </div>

                  {topCapabilities.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-foreground">
                        Key Strengths:
                      </h4>
                      <ul className="space-y-1">
                        {topCapabilities.map((cap) => (
                          <li
                            key={cap.id}
                            className="text-sm text-muted-foreground"
                          >
                            • {cap.name}: {cap.progressPercentage}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {gaps.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-foreground">
                        Key Gaps:
                      </h4>
                      <ul className="space-y-1">
                        {gaps
                          .sort(
                            (a, b) =>
                              b.jobsProtectedCount - a.jobsProtectedCount,
                          )
                          .slice(0, 3)
                          .map((cap) => (
                            <li
                              key={cap.id}
                              className="text-sm text-muted-foreground"
                            >
                              • {cap.name}: {cap.progressPercentage}%
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  <Link href={`/capabilities?category=${category.id}`}>
                    <Button variant="outline" className="w-full gap-2">
                      Explore {category.name.toLowerCase()} capabilities
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          },
        )}
      </div>
    </div>
  );
}
