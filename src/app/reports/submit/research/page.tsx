"use client";

import { useState, useEffect } from "react";
import { ResearchReportForm } from "./_components/research-report-form";

export default function ResearchReportPage() {
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
        <h1 className="text-3xl font-bold mb-2">Research Update</h1>
        <p className="text-muted-foreground">
          Share new research or development that could impact job automation
        </p>
      </div>

      <ResearchReportForm />
    </div>
  );
}
