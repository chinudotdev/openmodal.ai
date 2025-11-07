"use client";

import { BarChart3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Stats } from "@/actions/capabilities";

interface StatCardProps {
  value: number;
  label: string;
  suffix?: string;
}

function StatCard({ value, label, suffix = "" }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(increment * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const formatValue = (val: number) => {
    if (suffix === "M") {
      return (val / 1000000).toFixed(1);
    }
    return val.toLocaleString();
  };

  return (
    <div
      ref={cardRef}
      className="flex flex-col items-center gap-2 min-w-[150px]"
    >
      <div className="text-5xl font-bold text-primary tabular-nums">
        {formatValue(displayValue)}
        {suffix}
      </div>
      <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

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
