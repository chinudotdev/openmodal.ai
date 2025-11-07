"use client";

import { useState, useEffect } from "react";
import { DeploymentReportForm } from "./_components/deployment-report-form";

export default function DeploymentReportPage() {
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
        <h1 className="text-3xl font-bold mb-2">Deployment Report</h1>
        <p className="text-muted-foreground">
          Report AI/automation actually being used in real work environments
        </p>
      </div>

      <DeploymentReportForm />
    </div>
  );
}
