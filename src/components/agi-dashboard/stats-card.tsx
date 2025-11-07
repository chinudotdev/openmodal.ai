"use client";

import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  value: number;
  label: string;
  suffix?: string;
}

export function StatCard({ value, label, suffix = "" }: StatCardProps) {
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
