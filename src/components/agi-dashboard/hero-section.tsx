"use client";

import type { AGIProgress } from "@/actions/capabilities";
import { ProgressMeter } from "./progress-meter";

interface HeroSectionProps {
  agiProgress: AGIProgress;
}

export function HeroSection({ agiProgress }: HeroSectionProps) {
  return (
    <>
      <div
        className="mb-6 animate-fade-in-up"
        style={{ animationDelay: "0.4s" }}
      >
        <ProgressMeter percentage={agiProgress.overall} />
      </div>

      <div
        className="text-sm text-muted-foreground animate-fade-in-up"
        style={{ animationDelay: "0.6s" }}
      >
        <p>
          Last updated {agiProgress.lastUpdated} by @{agiProgress.lastUpdatedBy}
        </p>
        <p className="mt-1">
          {agiProgress.contributors.toLocaleString()} contributors •{" "}
          {agiProgress.expertForecasts} expert forecasts •{" "}
          {agiProgress.reports.toLocaleString()} reports
        </p>
      </div>
    </>
  );
}
