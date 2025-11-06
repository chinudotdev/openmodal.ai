"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { getCapabilityBySlug } from "@/actions/capabilities";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface TimelineChartProps {
  capability: NonNullable<Capability>;
}

export function TimelineChart({ capability }: TimelineChartProps) {
  // Mock data for the chart - in a real app, this would come from predictions
  // For now, we'll create a simple visualization based on timeline_estimate
  const parseTimeline = (timeline?: string | null) => {
    if (!timeline) return null;

    // Try to parse "10-20 years" or "2035-2045"
    const match = timeline.match(/(\d{4})-(\d{4})/);
    if (match) {
      return {
        start: parseInt(match[1]),
        end: parseInt(match[2]),
      };
    }

    const yearMatch = timeline.match(/(\d+)-(\d+)\s*years?/);
    if (yearMatch) {
      const currentYear = new Date().getFullYear();
      return {
        start: currentYear + parseInt(yearMatch[1]),
        end: currentYear + parseInt(yearMatch[2]),
      };
    }

    return null;
  };

  const timeline = parseTimeline(capability.timelineEstimate);

  if (!timeline) {
    return (
      <div className="rounded-lg border border-border bg-muted p-4 text-center text-sm text-muted-foreground">
        Timeline data not available
      </div>
    );
  }

  // Create data points for the chart
  const currentYear = new Date().getFullYear();
  const data = [];
  const range = timeline.end - timeline.start;

  for (let i = 0; i <= range; i++) {
    const year = timeline.start + i;
    // Create a probability distribution (simplified - would use actual prediction data)
    const probability = Math.max(0, 100 - Math.abs(i - range / 2) * 20);
    data.push({
      year: year.toString(),
      probability,
    });
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            label={{
              value: "Probability %",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Bar dataKey="probability" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Expected timeline: {capability.timelineEstimate}
      </p>
    </div>
  );
}
