"use client";

import { useState, useEffect } from "react";
import { BarrierReportForm } from "./_components/barrier-report-form";

export default function BarrierReportPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Barrier Report</h1>
        <p className="text-muted-foreground">
          Report obstacles preventing AI/automation from replacing human work
        </p>
      </div>

      <BarrierReportForm />
    </div>
  );
}
