"use client";

import { Brain } from "lucide-react";
import { ProgressMeter } from "./progress-meter";
import { mockAGIProgress } from "@/lib/mock-data";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted to-background py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-[800px] text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center animate-fade-in-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in-up">
            Artificial General Intelligence
          </h1>

          {/* Subtitle */}
          <p
            className="mb-6 text-lg text-muted-foreground md:text-xl animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            How close are we to human-level AI?
            <br />
            <span className="text-base text-muted-foreground/80">
              Community-tracked progress
            </span>
          </p>

          {/* Progress Meter */}
          <div
            className="mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <ProgressMeter percentage={mockAGIProgress.overall} />
          </div>

          {/* Stats */}
          <div
            className="text-sm text-muted-foreground animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <p>
              Last updated {mockAGIProgress.lastUpdated} by @
              {mockAGIProgress.lastUpdatedBy}
            </p>
            <p className="mt-1">
              {mockAGIProgress.contributors.toLocaleString()} contributors •{" "}
              {mockAGIProgress.expertForecasts} expert forecasts •{" "}
              {mockAGIProgress.reports.toLocaleString()} reports
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
